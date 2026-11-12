import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ChevronRight, Send, RotateCcw, Ban, Zap, Save, AlertTriangle, Clock,
} from 'lucide-react'
import { PageHeader }  from '../../components/ui/PageHeader'
import { SectionCard } from '../../components/ui/SectionCard'
import { Modal }       from '../../components/ui/Modal'
import { Spinner, ErrorState, Notice } from '../../components/ui/AsyncState'
import { ContratStatutBadge, StatusBadge } from '../../components/documents/StatusBadges'
import { PdfPreview } from '../../components/documents/PdfPreview'
import { PdfButton }  from '../../components/documents/PdfButton'
import { useApi }      from '../../hooks/useApi'
import { useCanWrite } from '../../hooks/useCanWrite'
import {
  contratsApi, demandesApi, calculerPalier, formatCentimes, formatDate, formatDateTime, formatEuros,
  type ContratDetail as ContratDetailT, type ContratPatch, type Palier,
} from '../../api/documents'

// ── Journal ───────────────────────────────────────────────────────────────────

const EVENEMENTS: Record<string, string> = {
  cree:                 'Contrat créé (brouillon)',
  modifie:              'Brouillon modifié',
  genere:               'PDF original généré et figé',
  signe_cubi:           'Contre-signé par Cubi',
  envoye:               'Envoyé pour signature',
  renvoye:              'Nouveau lien envoyé',
  relance:              'Relance automatique',
  consulte:             'Contrat consulté par le signataire',
  otp_envoye:           'Code de signature envoyé',
  otp_echec:            'Code erroné',
  revoque:              'Lien révoqué',
  integrite_ko:         'Contrôle d\'intégrité du PDF en échec',
  signe:                'Signé par le client',
  organisation_activee: 'Organisation activée',
  facture_emise:        'Facture émise',
  expire:               'Lien expiré',
  annule:               'Contrat annulé',
}
const EVT_DANGER = new Set(['otp_echec', 'revoque', 'integrite_ko', 'annule', 'expire'])
const EVT_SUCCESS = new Set(['signe', 'organisation_activee', 'signe_cubi'])

function Timeline({ contrat }: { contrat: ContratDetailT }) {
  const evts = contrat.evenements ?? []
  if (!evts.length) return <p className="text-sm" style={{ color: 'rgba(30,15,70,0.62)' }}>Aucun événement.</p>
  return (
    <ol className="relative flex flex-col gap-4 pl-5" style={{ borderLeft: '2px solid rgba(107,79,224,0.12)' }}>
      {evts.map((e) => {
        const color = EVT_DANGER.has(e.type) ? '#dc2626' : EVT_SUCCESS.has(e.type) ? '#16a34a' : '#6B4FE0'
        const champs = Array.isArray(e.meta?.champs) ? (e.meta?.champs as unknown[]).join(', ') : null
        const destinataire = typeof e.meta?.destinataire === 'string' ? e.meta.destinataire : null
        return (
          <li key={String(e.id)} className="relative">
            <span className="absolute -left-[27px] top-1 w-3 h-3 rounded-full"
              style={{ background: '#fff', border: `2.5px solid ${color}` }} />
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <span className="text-sm font-semibold" style={{ color: '#1a1040' }}>{EVENEMENTS[e.type] ?? e.type}</span>
              <time className="text-xs tabular-nums" style={{ color: 'rgba(30,15,70,0.62)' }}>{formatDateTime(e.horodatage)}</time>
            </div>
            <div className="text-xs mt-0.5 break-all" style={{ color: 'rgba(30,15,70,0.62)' }}>
              {e.acteur ?? 'système'}{e.ip ? ` · IP ${e.ip}` : ''}
              {champs ? ` · ${champs}` : ''}{destinataire ? ` · à ${destinataire}` : ''}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

// ── Formulaire du brouillon ───────────────────────────────────────────────────

interface FormState {
  nom: string; fonction: string; email: string
  adresse: string
  dateDebut: string; dureeMois: string
  quantites: Record<string, string>
}

const initialForm = (c: ContratDetailT): FormState => ({
  nom: c.signataire.nom ?? '',
  fonction: c.signataire.fonction ?? '',
  email: c.signataire.email ?? '',
  adresse: c.adresseClient ?? '',
  dateDebut: c.dateDebut ?? '',
  dureeMois: String(c.dureeMois ?? 12),
  quantites: Object.fromEntries(c.etablissements.map((e) => [e.ecoleId, String(e.quantite)])),
})

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Field({ label, required, missing, hint, children }: {
  label: string; required?: boolean; missing?: boolean; hint?: string; children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold flex items-center gap-1" style={{ color: missing ? '#b45309' : 'rgba(30,15,70,0.7)' }}>
        {label}{required && <span aria-hidden style={{ color: '#dc2626' }}>*</span>}
        {missing && <span className="ml-1 font-normal">— requis avant l'envoi</span>}
      </span>
      <div style={missing ? { borderRadius: 10, boxShadow: '0 0 0 2px rgba(251,191,36,0.55)' } : undefined}>{children}</div>
      {hint && <span className="text-[11px]" style={{ color: 'rgba(30,15,70,0.55)' }}>{hint}</span>}
    </label>
  )
}

function BrouillonForm({ contrat, paliers, canWrite, adresseConnue, onSaved }: {
  contrat: ContratDetailT
  paliers: Palier[] | null
  canWrite: boolean
  adresseConnue: boolean
  onSaved: (msg: string) => void
}) {
  const [form,   setForm]   = useState<FormState>(() => initialForm(contrat))
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState<string | null>(null)
  useEffect(() => { setForm(initialForm(contrat)) }, [contrat])

  const set = (k: Exclude<keyof FormState, 'quantites'>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const total = contrat.etablissements.reduce((s, e) => s + (parseInt(form.quantites[e.ecoleId] ?? '', 10) || 0), 0)
  const palier = paliers ? calculerPalier(paliers, total) : null

  const missing = {
    nom: !form.nom.trim(),
    fonction: !form.fonction.trim(),
    email: !EMAIL_RE.test(form.email.trim()),
    adresse: !adresseConnue && form.adresse.trim().length < 5,
  }

  const buildPatch = (): ContratPatch | string => {
    const patch: ContratPatch = {}
    const sig: NonNullable<ContratPatch['signataire']> = {}
    if (form.nom.trim() && form.nom.trim() !== (contrat.signataire.nom ?? '')) sig.nom = form.nom.trim()
    if (form.fonction.trim() && form.fonction.trim() !== (contrat.signataire.fonction ?? '')) sig.fonction = form.fonction.trim()
    if (form.email.trim() && form.email.trim() !== (contrat.signataire.email ?? '')) {
      if (!EMAIL_RE.test(form.email.trim())) return "L'e-mail du signataire est invalide."
      sig.email = form.email.trim()
    }
    if (Object.keys(sig).length) patch.signataire = sig
    if (form.adresse.trim()) {
      if (form.adresse.trim().length < 5) return "L'adresse du client est trop courte."
      patch.adresseClient = form.adresse.trim()
    }
    if (form.dateDebut && form.dateDebut !== contrat.dateDebut) patch.dateDebut = form.dateDebut
    const duree = parseInt(form.dureeMois, 10)
    if (!Number.isInteger(duree) || duree < 1 || duree > 60) return 'La durée doit être comprise entre 1 et 60 mois.'
    if (duree !== contrat.dureeMois) patch.dureeMois = duree
    const quantites = contrat.etablissements.map((e) => ({ ecoleId: e.ecoleId, quantite: parseInt(form.quantites[e.ecoleId] ?? '', 10) }))
    if (quantites.some((q) => !Number.isInteger(q.quantite) || q.quantite < 1)) return 'Chaque quantité doit être un entier ≥ 1.'
    if (quantites.some((q, i) => q.quantite !== contrat.etablissements[i].quantite)) patch.quantites = quantites
    return patch
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const patch = buildPatch()
    if (typeof patch === 'string') { setError(patch); return }
    if (!Object.keys(patch).length) { setError('Aucune modification à enregistrer.'); return }
    setSaving(true)
    try {
      await contratsApi.update(contrat.id, patch)
      onSaved('Brouillon enregistré.')
    } catch (err) {
      setError(err instanceof Error ? err.message : "L'enregistrement a échoué.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-5">
      <fieldset disabled={!canWrite || saving} className="flex flex-col gap-5 border-0 p-0 m-0 min-w-0">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#6B4FE0' }}>Signataire</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nom" required missing={missing.nom}>
              <input className="cubi-input w-full" value={form.nom} onChange={set('nom')} placeholder="Prénom Nom" />
            </Field>
            <Field label="Fonction" required missing={missing.fonction}>
              <input className="cubi-input w-full" value={form.fonction} onChange={set('fonction')} placeholder="Directeur·rice, DAF…" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="E-mail" required missing={missing.email} hint="Le lien de signature et le code y seront envoyés.">
                <input className="cubi-input w-full" type="email" value={form.email} onChange={set('email')} placeholder="signataire@etablissement.fr" />
              </Field>
            </div>
          </div>
        </div>

        <Field
          label={contrat.type === 'groupe' ? 'Adresse du siège' : 'Adresse du client'}
          required
          missing={missing.adresse}
          hint={adresseConnue
            ? "Laisser vide pour conserver l'adresse actuelle (visible dans l'aperçu)."
            : "Non demandée à l'inscription d'un groupe : à saisir avant l'envoi."}
        >
          <input className="cubi-input w-full" value={form.adresse} onChange={set('adresse')} placeholder="12 rue de la Paix, 75001 Paris" />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Date de début">
            <input className="cubi-input w-full" type="date" value={form.dateDebut} onChange={set('dateDebut')} />
          </Field>
          <Field label="Durée (mois)">
            <input className="cubi-input w-full" type="number" min={1} max={60} step={1} value={form.dureeMois} onChange={set('dureeMois')} />
          </Field>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#6B4FE0' }}>
            Quantités {contrat.type === 'groupe' ? 'par établissement' : ''}
          </h4>
          <div className="flex flex-col gap-2">
            {contrat.etablissements.map((e) => (
              <div key={e.ecoleId} className="flex items-center justify-between gap-3">
                <span className="text-sm min-w-0 truncate" style={{ color: '#1a1040' }}>{e.nom}</span>
                <input
                  className="cubi-input w-28 text-right"
                  type="number" min={1} step={1} inputMode="numeric"
                  aria-label={`Quantité pour ${e.nom}`}
                  value={form.quantites[e.ecoleId] ?? ''}
                  onChange={(ev) => setForm((f) => ({ ...f, quantites: { ...f.quantites, [e.ecoleId]: ev.target.value } }))}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl px-3.5 py-2.5 text-xs flex flex-wrap justify-between gap-2"
            style={{ background: 'rgba(107,79,224,0.05)', color: 'rgba(30,15,70,0.75)' }}>
            <span>Total : <strong>{total}</strong> utilisateur{total > 1 ? 's' : ''}</span>
            <span>
              {paliers === null ? 'Palier : chargement…'
                : palier ? <>Palier <strong>{palier.nom}</strong> · {formatEuros(palier.prixUnitaire)} HT/utilisateur · <strong>{formatEuros(palier.prixUnitaire * total)} HT/mois</strong></>
                : <span style={{ color: '#dc2626' }}>Aucun palier ne couvre cette quantité</span>}
            </span>
          </div>
        </div>
      </fieldset>

      {error && <Notice tone="error">{error}</Notice>}

      {canWrite && (
        <div className="flex justify-end">
          <button type="submit" className="btn-action flex items-center gap-1.5" disabled={saving}>
            <Save size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer le brouillon'}
          </button>
        </div>
      )}
    </form>
  )
}

// ── Actions ───────────────────────────────────────────────────────────────────

type Action = 'envoyer' | 'renvoyer' | 'annuler' | 'activer'

const ACTION_META: Record<Action, { label: string; confirm: string; danger?: boolean; icon: typeof Send }> = {
  envoyer:  { label: 'Envoyer pour signature', icon: Send,      confirm: "Le PDF original sera figé et un lien de signature valable 14 jours sera envoyé au signataire. Le brouillon ne sera plus modifiable." },
  renvoyer: { label: 'Renvoyer le lien',       icon: RotateCcw, confirm: 'Le lien actuel sera révoqué et un nouveau lien (14 jours) sera envoyé au signataire.' },
  annuler:  { label: 'Annuler le contrat',     icon: Ban,       confirm: 'Le contrat passera en « annulé » et tout lien de signature ouvert sera révoqué. Cette action est définitive.', danger: true },
  activer:  { label: "Rejouer l'activation",   icon: Zap,       confirm: "Relance l'activation post-signature (organisation, licences, comptes, première facture). Sans effet si elle a déjà réussi." },
}

function actionsPour(statut: string): Action[] {
  switch (statut) {
    case 'brouillon': return ['envoyer', 'annuler']
    case 'envoye':    return ['renvoyer', 'annuler']
    case 'expire':    return ['renvoyer', 'annuler']
    case 'signe':     return ['activer']
    default:          return []
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function ContratDetail() {
  const { id = '' } = useParams<{ id: string }>()
  const canWrite = useCanWrite()
  const { data: contrat, loading, error, refetch } = useApi<ContratDetailT>(() => contratsApi.get(id), [id])
  const { data: plans } = useApi<Palier[]>(() => demandesApi.paliers(), [])

  const [notice,  setNotice]  = useState<{ tone: 'success' | 'error'; text: string } | null>(null)
  const [pending, setPending] = useState<Action | null>(null)
  const [running, setRunning] = useState(false)
  const [version, setVersion] = useState(0)

  const fetchPdf = useCallback(() => contratsApi.pdf(id), [id])

  // L'adresse n'est pas renvoyée par GET /admin/contrats/:id : connue pour une école (reprise de
  // l'inscription), ou si un événement « modifie » l'a déjà renseignée.
  const adresseConnue = useMemo(() => {
    if (!contrat) return false
    if (contrat.adresseClient) return true
    if (contrat.type === 'ecole') return true
    return (contrat.evenements ?? []).some((e) =>
      e.type === 'modifie' && Array.isArray(e.meta?.champs) && (e.meta?.champs as unknown[]).includes('adresseClient'))
  }, [contrat])

  if (loading && !contrat) return <Spinner />
  if (error || !contrat) return <ErrorState message={error ?? 'Contrat introuvable.'} onRetry={refetch} />

  const champsManquants = [
    !contrat.signataire.nom && 'nom du signataire',
    !contrat.signataire.fonction && 'fonction du signataire',
    !contrat.signataire.email && 'e-mail du signataire',
    !adresseConnue && 'adresse du client',
  ].filter(Boolean) as string[]

  const runAction = async (action: Action) => {
    setRunning(true)
    setNotice(null)
    try {
      let text: string
      if (action === 'envoyer' || action === 'renvoyer') {
        const r = await contratsApi[action](contrat.id)
        text = `${r.message}${r.expireLe ? ` — lien valable jusqu'au ${formatDate(r.expireLe)}` : ''}.`
      } else if (action === 'activer') {
        const r = await contratsApi.activer(contrat.id)
        text = r.message
      } else {
        text = (await contratsApi.annuler(contrat.id)).message
      }
      setNotice({ tone: 'success', text })
      setPending(null)
      setVersion((v) => v + 1)
      refetch()
    } catch (e) {
      setNotice({ tone: 'error', text: e instanceof Error ? e.message : "L'action a échoué." })
      setPending(null)
    } finally {
      setRunning(false)
    }
  }

  const actions = canWrite ? actionsPour(contrat.statut) : []
  const mensuel = contrat.quantiteTotale * contrat.prixUnitaireCentimes

  return (
    <div>
      <nav className="flex items-center gap-1 text-xs mb-3" style={{ color: 'rgba(30,15,70,0.62)' }}>
        <Link to="/admin/contrats" className="no-underline" style={{ color: '#6B4FE0' }}>Contrats</Link>
        <ChevronRight size={12} /> <span>{contrat.numero}</span>
      </nav>

      <PageHeader
        title={`Contrat ${contrat.numero}`}
        subtitle={`${contrat.organisation} · ${contrat.type === 'groupe' ? `Groupe, ${contrat.etablissements.length} établissements` : 'Établissement'}`}
        actions={
          <>
            <ContratStatutBadge statut={contrat.statut} />
            <PdfButton
              fetchBlob={fetchPdf}
              filename={`${contrat.numero}${contrat.sha256Signe ? '-signe' : contrat.statut === 'brouillon' ? '-apercu' : ''}.pdf`}
              label="Télécharger le PDF"
            />
          </>
        }
      />

      {notice && <div className="mb-4"><Notice tone={notice.tone} onClose={() => setNotice(null)}>{notice.text}</Notice></div>}

      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {actions.map((a) => {
            const meta = ACTION_META[a]
            const blocked = a === 'envoyer' && champsManquants.length > 0
            const Icon = meta.icon
            return (
              <button
                key={a}
                type="button"
                className={`${meta.danger ? 'btn-danger' : 'btn-action'} flex items-center gap-1.5`}
                onClick={() => setPending(a)}
                disabled={blocked || running}
                title={blocked ? `À compléter : ${champsManquants.join(', ')}` : undefined}
                style={blocked ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
              >
                <Icon size={14} /> {meta.label}
              </button>
            )
          })}
        </div>
      )}

      {contrat.statut === 'brouillon' && champsManquants.length > 0 && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.35)', color: '#92400e' }}>
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>Avant l'envoi, complète : <strong>{champsManquants.join(', ')}</strong>.</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-5">
        <div className="flex flex-col gap-5 min-w-0">
          <SectionCard title="Synthèse">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {[
                ['Offre', contrat.offre],
                ['Utilisateurs', String(contrat.quantiteTotale)],
                ['Prix unitaire', `${formatCentimes(contrat.prixUnitaireCentimes)} HT/mois`],
                ['Montant mensuel', `${formatCentimes(mensuel)} HT`],
                ['Début', formatDate(contrat.dateDebut)],
                ['Durée', `${contrat.dureeMois} mois`],
                ...(contrat.dateEffet ? [['Date d\'effet', formatDate(contrat.dateEffet)]] : []),
                ['Signé par le client', contrat.dateSignatureClient ? formatDateTime(contrat.dateSignatureClient) : '—'],
              ].map(([k, v]) => (
                <div key={k} className="min-w-0">
                  <dt className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.62)' }}>{k}</dt>
                  <dd className="font-medium break-words" style={{ color: '#1a1040' }}>{v}</dd>
                </div>
              ))}
            </dl>
            {(contrat.sha256Original || contrat.sha256Signe) && (
              <div className="mt-4 text-[11px] font-mono break-all flex flex-col gap-1" style={{ color: 'rgba(30,15,70,0.62)' }}>
                {contrat.sha256Original && <span>SHA-256 original : {contrat.sha256Original}</span>}
                {contrat.sha256Signe && <span>SHA-256 signé : {contrat.sha256Signe}</span>}
              </div>
            )}
          </SectionCard>

          {contrat.statut === 'brouillon' ? (
            <SectionCard title="Brouillon">
              <BrouillonForm
                contrat={contrat}
                paliers={plans}
                canWrite={canWrite}
                adresseConnue={adresseConnue}
                onSaved={(text) => { setNotice({ tone: 'success', text }); setVersion((v) => v + 1); refetch() }}
              />
            </SectionCard>
          ) : (
            <SectionCard title="Signataire et établissements">
              <p className="text-sm" style={{ color: '#1a1040' }}>
                {contrat.signataire.nom ?? '—'}{contrat.signataire.fonction ? `, ${contrat.signataire.fonction}` : ''}
                <span className="block text-xs" style={{ color: 'rgba(30,15,70,0.62)' }}>{contrat.signataire.email ?? '—'}</span>
              </p>
              <ul className="mt-3 flex flex-col">
                {contrat.etablissements.map((e) => (
                  <li key={e.ecoleId} className="flex justify-between gap-3 py-2 text-sm" style={{ borderTop: '1px solid rgba(107,79,224,0.07)' }}>
                    <span className="min-w-0 truncate" style={{ color: '#1a1040' }}>{e.nom}</span>
                    <span className="shrink-0 tabular-nums" style={{ color: 'rgba(30,15,70,0.75)' }}>{e.quantite} × {formatCentimes(e.prixUnitaireCentimes)}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {(contrat.demandesSignature?.length ?? 0) > 0 && (
            <SectionCard title="Liens de signature">
              <ul className="flex flex-col">
                {contrat.demandesSignature.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-xs" style={{ borderTop: '1px solid rgba(107,79,224,0.07)' }}>
                    <span className="flex items-center gap-2" style={{ color: 'rgba(30,15,70,0.75)' }}>
                      <Clock size={12} /> {formatDateTime(d.dateCreation)} → {formatDate(d.expireLe)}
                    </span>
                    <span className="flex items-center gap-2">
                      <span style={{ color: 'rgba(30,15,70,0.62)' }}>{d.otpTentatives} code{d.otpTentatives > 1 ? 's' : ''} faux</span>
                      <StatusBadge statut={d.statut} map={{
                        ouverte:  { label: 'Ouvert',   variant: 'blue' },
                        terminee: { label: 'Signé',    variant: 'green' },
                        revoquee: { label: 'Révoqué',  variant: 'neutral' },
                        expiree:  { label: 'Expiré',   variant: 'yellow' },
                      }} />
                    </span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          <SectionCard title="Journal des événements">
            <Timeline contrat={contrat} />
          </SectionCard>
        </div>

        <div className="min-w-0">
          <SectionCard title={contrat.sha256Signe ? 'Contrat signé' : contrat.statut === 'brouillon' ? 'Aperçu (non figé)' : 'Contrat envoyé'}>
            <PdfPreview fetchBlob={fetchPdf} filename={`${contrat.numero}.pdf`} reloadKey={version} height={720} openLabel="Ouvrir le contrat" />
          </SectionCard>
        </div>
      </div>

      <Modal isOpen={pending !== null} onClose={() => !running && setPending(null)} title={pending ? ACTION_META[pending].label : ''} dismissable={!running}>
        {pending && (
          <div className="flex flex-col gap-5">
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(30,15,70,0.8)' }}>{ACTION_META[pending].confirm}</p>
            {(pending === 'envoyer' || pending === 'renvoyer') && contrat.signataire.email && (
              <p className="text-sm" style={{ color: '#1a1040' }}>Destinataire : <strong>{contrat.signataire.email}</strong></p>
            )}
            <div className="flex gap-3">
              <button type="button" className="btn-action flex-1" onClick={() => setPending(null)} disabled={running}>Retour</button>
              <button
                type="button"
                className={`${ACTION_META[pending].danger ? 'btn-danger' : 'btn-action'} flex-1`}
                onClick={() => void runAction(pending)}
                disabled={running}
                style={ACTION_META[pending].danger ? undefined : { background: 'rgba(107,79,224,0.1)' }}
              >
                {running ? 'En cours…' : 'Confirmer'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
