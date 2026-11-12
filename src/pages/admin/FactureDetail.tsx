import { useCallback, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ChevronRight, CheckCircle2, FileMinus2, Mail } from 'lucide-react'
import { PageHeader }  from '../../components/ui/PageHeader'
import { SectionCard } from '../../components/ui/SectionCard'
import { Modal }       from '../../components/ui/Modal'
import { Spinner, ErrorState, Notice } from '../../components/ui/AsyncState'
import { FactureStatutBadge } from '../../components/documents/StatusBadges'
import { PdfPreview } from '../../components/documents/PdfPreview'
import { PdfButton }  from '../../components/documents/PdfButton'
import { useApi }      from '../../hooks/useApi'
import { useCanWrite } from '../../hooks/useCanWrite'
import {
  facturesApi, formatCentimes, formatDate, aujourdhuiIso,
  type FactureDetail as FactureDetailT, type FactureLigne, type AvoirLigneInput,
} from '../../api/documents'

// ── Marquer payée ─────────────────────────────────────────────────────────────

function PayerForm({ facture, onClose, onDone }: { facture: FactureDetailT; onClose: () => void; onDone: (msg: string) => void }) {
  const today = aujourdhuiIso()
  const [date, setDate] = useState(today)
  const [busy, setBusy] = useState(false)
  const [err,  setErr]  = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    try {
      await facturesApi.payer(facture.id, date)
      onDone(`Facture ${facture.reference} marquée payée le ${formatDate(date)}.`)
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "L'enregistrement du paiement a échoué.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.7)' }}>Date de paiement</span>
        <input className="cubi-input" type="date" value={date} onChange={(e) => setDate(e.target.value)}
          min={facture.dateEmission ?? undefined} max={today} required />
        <span className="text-[11px]" style={{ color: 'rgba(30,15,70,0.55)' }}>Entre la date d'émission et aujourd'hui.</span>
      </label>
      {err && <Notice tone="error">{err}</Notice>}
      <div className="flex gap-3">
        <button type="button" className="btn-action flex-1" onClick={onClose} disabled={busy}>Annuler</button>
        <button type="submit" className="btn-action flex-1" disabled={busy} style={{ background: 'rgba(107,79,224,0.1)' }}>
          {busy ? 'Enregistrement…' : 'Marquer payée'}
        </button>
      </div>
    </form>
  )
}

// ── Avoir ─────────────────────────────────────────────────────────────────────

interface LigneAvoirState { checked: boolean; quantite: string; prixHt: string }

const toCents = (s: string) => Math.round(parseFloat(s.replace(/\s/g, '').replace(',', '.')) * 100)

function AvoirForm({ facture, onClose, onDone }: { facture: FactureDetailT; onClose: () => void; onDone: (msg: string) => void }) {
  const lignes: FactureLigne[] = (facture.lignes ?? []).filter((l) => l.totalHtCents > 0)
  const avoirsExistants = facture.avoirs ?? []
  // Plafond : TTC de la facture moins les avoirs déjà émis (montants négatifs)
  const dejaCredite = avoirsExistants.reduce((s, a) => s + Math.abs(a.totalTtcCentimes ?? 0), 0)
  const plafond = Math.max(0, (facture.totalTtcCentimes ?? 0) - dejaCredite)
  const totalPossible = avoirsExistants.length === 0

  const [mode,  setMode]  = useState<'total' | 'partiel'>(totalPossible ? 'total' : 'partiel')
  const [motif, setMotif] = useState('')
  const [etat,  setEtat]  = useState<LigneAvoirState[]>(() => lignes.map((l) => ({
    checked: false, quantite: String(l.quantity), prixHt: (l.unitPriceCents / 100).toFixed(2).replace('.', ','),
  })))
  const [busy, setBusy] = useState(false)
  const [err,  setErr]  = useState<string | null>(null)

  const update = (i: number, patch: Partial<LigneAvoirState>) =>
    setEtat((list) => list.map((l, j) => (j === i ? { ...l, ...patch } : l)))

  // Contrôles ligne par ligne : quantité et prix unitaire ne dépassent pas ceux de la ligne d'origine
  const selection = lignes.map((l, i) => {
    const s = etat[i]
    const q = parseInt(s.quantite, 10)
    const pu = toCents(s.prixHt)
    const erreur =
      !Number.isInteger(q) || q < 1 ? 'Quantité invalide'
      : q > l.quantity ? `Quantité max ${l.quantity}`
      : !Number.isFinite(pu) || pu <= 0 ? 'Montant invalide'
      : pu > l.unitPriceCents ? `Max ${formatCentimes(l.unitPriceCents)}`
      : null
    const ttc = Number.isFinite(pu) && Number.isInteger(q) ? Math.round(q * pu * (1 + (l.vatRate ?? 0) / 100)) : 0
    return { ligne: l, state: s, q, pu, erreur, ttc }
  })
  const choisies = selection.filter((x) => x.state.checked)
  const totalPartielTtc = choisies.reduce((s, x) => s + x.ttc, 0)
  const depasse = mode === 'partiel' && totalPartielTtc > plafond

  const valide = motif.trim().length >= 3 && (mode === 'total'
    ? totalPossible
    : choisies.length > 0 && choisies.every((x) => !x.erreur) && !depasse)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valide) return
    setBusy(true)
    setErr(null)
    try {
      const payload: AvoirLigneInput[] | undefined = mode === 'partiel'
        ? choisies.map((x) => ({ label: x.ligne.label, quantite: x.q, prixUnitaireHtCentimes: x.pu, tauxTva: x.ligne.vatRate }))
        : undefined
      const avoir = await facturesApi.avoir(facture.id, motif.trim(), payload)
      onDone(`Avoir ${avoir.reference} émis (${avoir.montant}).`)
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "L'émission de l'avoir a échoué.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Type d'avoir">
        {(['total', 'partiel'] as const).map((m) => {
          const disabled = m === 'total' && !totalPossible
          const active = mode === m
          return (
            <button key={m} type="button" role="radio" aria-checked={active} disabled={disabled}
              onClick={() => setMode(m)}
              className="text-left rounded-xl px-3.5 py-2.5 cursor-pointer"
              style={{
                background: active ? 'rgba(107,79,224,0.08)' : '#fff',
                border: `1.5px solid ${active ? '#6B4FE0' : 'rgba(107,79,224,0.2)'}`,
                opacity: disabled ? 0.5 : 1,
              }}>
              <div className="text-sm font-semibold" style={{ color: active ? '#6B4FE0' : '#1a1040' }}>
                {m === 'total' ? 'Avoir total' : 'Avoir partiel'}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: 'rgba(30,15,70,0.62)' }}>
                {m === 'total'
                  ? (totalPossible ? 'Annule toute la facture' : 'Impossible : un avoir partiel existe déjà')
                  : 'Lignes et montants au choix'}
              </div>
            </button>
          )
        })}
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.7)' }}>Motif <span style={{ color: '#dc2626' }}>*</span></span>
        <input className="cubi-input" value={motif} onChange={(e) => setMotif(e.target.value)} maxLength={300}
          placeholder="Ex : erreur de quantité, geste commercial…" required />
      </label>

      {mode === 'partiel' && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.7)' }}>Lignes à créditer (montants HT)</span>
          {selection.map((x, i) => (
            <div key={i} className="rounded-xl p-3 flex flex-col gap-2"
              style={{ border: `1px solid ${x.state.checked && x.erreur ? 'rgba(239,68,68,0.4)' : 'rgba(107,79,224,0.14)'}` }}>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={x.state.checked} onChange={(e) => update(i, { checked: e.target.checked })}
                  className="mt-0.5 w-4 h-4" style={{ accentColor: '#6B4FE0' }} />
                <span className="text-sm min-w-0" style={{ color: '#1a1040' }}>
                  {x.ligne.label}
                  <span className="block text-[11px]" style={{ color: 'rgba(30,15,70,0.62)' }}>
                    Origine : {x.ligne.quantity} × {formatCentimes(x.ligne.unitPriceCents)} HT · TVA {x.ligne.vatRate} %
                  </span>
                </span>
              </label>
              {x.state.checked && (
                <div className="grid grid-cols-2 gap-2 pl-6">
                  <input className="cubi-input" type="number" min={1} max={x.ligne.quantity} step={1} inputMode="numeric"
                    aria-label="Quantité" value={x.state.quantite} onChange={(e) => update(i, { quantite: e.target.value })} />
                  <input className="cubi-input" inputMode="decimal" aria-label="Prix unitaire HT en euros"
                    value={x.state.prixHt} onChange={(e) => update(i, { prixHt: e.target.value })} />
                  {x.erreur && <span className="col-span-2 text-[11px]" style={{ color: '#dc2626' }}>{x.erreur}</span>}
                </div>
              )}
            </div>
          ))}
          <div className="text-xs flex justify-between rounded-lg px-3 py-2" style={{ background: 'rgba(107,79,224,0.05)', color: depasse ? '#dc2626' : 'rgba(30,15,70,0.75)' }}>
            <span>Avoir estimé : <strong>{formatCentimes(totalPartielTtc)} TTC</strong></span>
            <span>Plafond restant : {formatCentimes(plafond)} TTC</span>
          </div>
        </div>
      )}

      {err && <Notice tone="error">{err}</Notice>}
      <div className="flex gap-3">
        <button type="button" className="btn-action flex-1" onClick={onClose} disabled={busy}>Annuler</button>
        <button type="submit" className="btn-danger flex-1" disabled={busy || !valide}
          style={!valide ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}>
          {busy ? 'Émission…' : "Émettre l'avoir"}
        </button>
      </div>
    </form>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

type ModalKind = 'payer' | 'avoir' | null

export function FactureDetail() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const canWrite = useCanWrite()
  const { data: facture, loading, error, refetch } = useApi<FactureDetailT>(() => facturesApi.get(id), [id])

  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(
    () => {
      const n = (location.state as { notice?: string } | null)?.notice
      return n ? { tone: 'success', text: n } : null
    },
  )
  const [modal,     setModal]     = useState<ModalKind>(null)
  const [renvoi,    setRenvoi]    = useState(false)
  const [version,   setVersion]   = useState(0)

  const fetchPdf = useCallback(() => facturesApi.pdf(id), [id])

  if (loading && !facture) return <Spinner />
  if (error || !facture) return <ErrorState message={error ?? 'Facture introuvable.'} onRetry={refetch} />

  const estAvoir = facture.type === 'avoir' || facture.statut === 'avoir'
  const peutPayer  = canWrite && !estAvoir && (facture.statut === 'en_attente' || facture.statut === 'impayee')
  const peutAvoir  = canWrite && !estAvoir && facture.statut !== 'annulee'

  const done = (text: string) => {
    setModal(null)
    setNotice({ tone: 'success', text })
    setVersion((v) => v + 1)
    refetch()
  }

  const renvoyer = async () => {
    setRenvoi(true)
    setNotice(null)
    try {
      const r = await facturesApi.renvoyer(facture.id)
      setNotice({ tone: 'success', text: `${r.message}.` })
    } catch (e) {
      setNotice({ tone: 'error', text: e instanceof Error ? e.message : "L'e-mail n'a pas pu être envoyé." })
    } finally {
      setRenvoi(false)
    }
  }

  return (
    <div>
      <nav className="flex items-center gap-1 text-xs mb-3" style={{ color: 'rgba(30,15,70,0.62)' }}>
        <Link to="/admin/facturation" className="no-underline" style={{ color: '#6B4FE0' }}>Facturation</Link>
        <ChevronRight size={12} /> <span>{facture.reference}</span>
      </nav>

      <PageHeader
        title={`${estAvoir ? 'Avoir' : 'Facture'} ${facture.reference}`}
        subtitle={facture.organisation}
        actions={
          <>
            <FactureStatutBadge statut={facture.statut} />
            <PdfButton fetchBlob={fetchPdf} filename={`${facture.reference}.pdf`} />
          </>
        }
      />

      {notice && <div className="mb-4"><Notice tone={notice.tone} onClose={() => setNotice(null)}>{notice.text}</Notice></div>}

      {canWrite && (
        <div className="flex flex-wrap gap-2 mb-5">
          {peutPayer && (
            <button type="button" className="btn-action flex items-center gap-1.5" onClick={() => setModal('payer')}>
              <CheckCircle2 size={14} /> Marquer payée
            </button>
          )}
          {peutAvoir && (
            <button type="button" className="btn-danger flex items-center gap-1.5" onClick={() => setModal('avoir')}>
              <FileMinus2 size={14} /> Créer un avoir
            </button>
          )}
          <button type="button" className="btn-action flex items-center gap-1.5" onClick={renvoyer} disabled={renvoi}>
            <Mail size={14} /> {renvoi ? 'Envoi…' : "Renvoyer l'e-mail"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-5">
        <div className="flex flex-col gap-5 min-w-0">
          <SectionCard title="Détail">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {[
                ['Émise le', formatDate(facture.dateEmission)],
                ['Échéance', estAvoir ? '—' : formatDate(facture.dateEcheance)],
                ['Période', facture.periodeDebut ? `${formatDate(facture.periodeDebut)} → ${formatDate(facture.periodeFin)}` : '—'],
                ['Paiement', facture.datePaiement ? formatDate(facture.datePaiement) : '—'],
                ['Contrat', facture.contratNumero ?? '—'],
                ['Offre', facture.plan ?? '—'],
              ].map(([k, v]) => (
                <div key={k} className="min-w-0">
                  <dt className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.62)' }}>{k}</dt>
                  <dd className="font-medium break-words" style={{ color: '#1a1040' }}>{v}</dd>
                </div>
              ))}
            </dl>

            {estAvoir && facture.factureOrigineId && (
              <p className="text-sm mt-4" style={{ color: 'rgba(30,15,70,0.75)' }}>
                Avoir sur la facture{' '}
                <Link to={`/admin/facturation/${facture.factureOrigineId}`} style={{ color: '#6B4FE0' }}>
                  {facture.factureOrigine ?? 'd\'origine'}
                </Link>
              </p>
            )}
            {facture.contratId && (
              <p className="text-sm mt-2">
                <Link to={`/admin/contrats/${facture.contratId}`} style={{ color: '#6B4FE0' }}>Voir le contrat</Link>
              </p>
            )}
          </SectionCard>

          <SectionCard title="Lignes">
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm min-w-[420px]">
                <thead>
                  <tr className="text-xs text-left" style={{ color: 'rgba(30,15,70,0.62)' }}>
                    <th className="font-semibold py-2 px-1">Désignation</th>
                    <th className="font-semibold py-2 px-1 text-right">Qté</th>
                    <th className="font-semibold py-2 px-1 text-right">PU HT</th>
                    <th className="font-semibold py-2 px-1 text-right">Total HT</th>
                  </tr>
                </thead>
                <tbody>
                  {(facture.lignes ?? []).map((l, i) => (
                    <tr key={i} style={{ borderTop: '1px solid rgba(107,79,224,0.07)', color: '#1a1040' }}>
                      <td className="py-2 px-1">{l.label}</td>
                      <td className="py-2 px-1 text-right tabular-nums">{l.quantity}</td>
                      <td className="py-2 px-1 text-right tabular-nums">{formatCentimes(l.unitPriceCents)}</td>
                      <td className="py-2 px-1 text-right tabular-nums">{formatCentimes(l.totalHtCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="mt-4 flex flex-col items-end gap-1 text-sm">
              <div className="flex gap-6"><dt style={{ color: 'rgba(30,15,70,0.7)' }}>Total HT</dt><dd className="tabular-nums w-28 text-right">{formatCentimes(facture.totalHtCentimes)}</dd></div>
              <div className="flex gap-6"><dt style={{ color: 'rgba(30,15,70,0.7)' }}>TVA</dt><dd className="tabular-nums w-28 text-right">{formatCentimes(facture.totalTvaCentimes)}</dd></div>
              <div className="flex gap-6 font-bold pt-1" style={{ borderTop: '1px solid rgba(107,79,224,0.12)', color: '#1a1040' }}>
                <dt>Total TTC</dt><dd className="tabular-nums w-28 text-right">{formatCentimes(facture.totalTtcCentimes)}</dd>
              </div>
            </dl>
          </SectionCard>

          {(facture.avoirs?.length ?? 0) > 0 && (
            <SectionCard title="Avoirs émis sur cette facture">
              <ul className="flex flex-col">
                {facture.avoirs!.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-2 text-sm" style={{ borderTop: '1px solid rgba(107,79,224,0.07)' }}>
                    <button type="button" className="border-none bg-transparent p-0 cursor-pointer font-semibold" style={{ color: '#6B4FE0' }}
                      onClick={() => navigate(`/admin/facturation/${a.id}`)}>
                      {a.reference}
                    </button>
                    <span className="text-xs" style={{ color: 'rgba(30,15,70,0.62)' }}>{formatDate(a.dateEmission)}</span>
                    <span className="tabular-nums">{a.montant}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {facture.sha256 && (
            <p className="text-[11px] font-mono break-all" style={{ color: 'rgba(30,15,70,0.55)' }}>SHA-256 du PDF : {facture.sha256}</p>
          )}
        </div>

        <div className="min-w-0">
          <SectionCard title="PDF">
            <PdfPreview fetchBlob={fetchPdf} filename={`${facture.reference}.pdf`} reloadKey={version} height={720} />
          </SectionCard>
        </div>
      </div>

      <Modal isOpen={modal === 'payer'} onClose={() => setModal(null)} title="Marquer la facture payée">
        {modal === 'payer' && <PayerForm facture={facture} onClose={() => setModal(null)} onDone={done} />}
      </Modal>
      <Modal isOpen={modal === 'avoir'} onClose={() => setModal(null)} title={`Avoir sur ${facture.reference}`} size="lg">
        {modal === 'avoir' && <AvoirForm facture={facture} onClose={() => setModal(null)} onDone={done} />}
      </Modal>
    </div>
  )
}
