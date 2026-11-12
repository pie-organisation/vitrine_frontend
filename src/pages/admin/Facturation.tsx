import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronRight, FilePlus2 } from 'lucide-react'
import { PageHeader }     from '../../components/ui/PageHeader'
import { FilterPills }    from '../../components/ui/FilterPills'
import { ListCard }       from '../../components/ui/ListCard'
import { Modal }          from '../../components/ui/Modal'
import { Spinner, ErrorState, EmptyState, Notice } from '../../components/ui/AsyncState'
import { FactureStatutBadge } from '../../components/documents/StatusBadges'
import { PdfButton }      from '../../components/documents/PdfButton'
import { useApi }         from '../../hooks/useApi'
import { useCanWrite }    from '../../hooks/useCanWrite'
import { api, ENDPOINTS } from '../../api/client'
import {
  facturesApi, contratsApi, formatDate, aujourdhuiIso,
  type Facture, type Contrat,
} from '../../api/documents'
import type { Organisation } from '../../mocks/data'

const FILTERS = [
  { value: '',           label: 'Toutes'     },
  { value: 'en_attente', label: 'En attente' },
  { value: 'impayee',    label: 'Impayées'   },
  { value: 'payee',      label: 'Payées'     },
  { value: 'annulee',    label: 'Annulées'   },
  { value: 'avoir',      label: 'Avoirs'     },
]

const PAR_PAGE = 50 // côté back, avec ?page=

// ── Ligne ─────────────────────────────────────────────────────────────────────

function FactureRow({ facture, onOpen }: { facture: Facture; onOpen: () => void }) {
  const estAvoir = facture.type === 'avoir' || facture.statut === 'avoir'
  return (
    <ListCard onClick={onOpen}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-sm shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(107,79,224,0.1), rgba(232,121,249,0.1))', color: '#6B4FE0' }}>
            {facture.organisation?.[0] ?? '?'}
          </div>
          <div className="min-w-0">
            <div className="font-display font-bold text-sm truncate" style={{ color: '#1a1040' }}>{facture.organisation}</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(30,15,70,0.62)' }}>
              {facture.reference}
              {estAvoir && facture.factureOrigine ? ` · avoir sur ${facture.factureOrigine}` : ` · ${facture.plan ?? ''}`}
              {facture.periodeDebut ? ` · ${formatDate(facture.periodeDebut)} → ${formatDate(facture.periodeFin)}` : ''}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end shrink-0">
          <div className="text-right">
            <div className="text-sm font-semibold tabular-nums" style={{ color: '#1a1040' }}>{facture.montant}</div>
            <div className="text-xs" style={{ color: 'rgba(30,15,70,0.62)' }}>
              {facture.datePaiement ? `Payée le ${formatDate(facture.datePaiement)}` : estAvoir ? `Émis le ${formatDate(facture.dateEmission)}` : `Éch. ${facture.echeance}`}
            </div>
          </div>
          <FactureStatutBadge statut={facture.statut} />
          <PdfButton iconOnly fetchBlob={() => facturesApi.pdf(facture.id)} filename={`${facture.reference}.pdf`} label={`Télécharger ${facture.reference}`} />
          <ChevronRight size={16} style={{ color: 'rgba(107,79,224,0.5)' }} />
        </div>
      </div>
    </ListCard>
  )
}

// ── Émission manuelle ─────────────────────────────────────────────────────────

function dernierJourDuMois(mois: string): string {
  const [y, m] = mois.split('-').map(Number)
  const d = new Date(Date.UTC(y, m, 0))
  return d.toISOString().slice(0, 10)
}

function EmettreModal({ onClose, onDone }: { onClose: () => void; onDone: (f: { id: string; reference: string }) => void }) {
  // Contrats signés : seuls facturables. Paginés par 20 côté back : on charge toutes les pages.
  const { data: contrats, loading, error, refetch } = useApi<Contrat[]>(async () => {
    const first = await contratsApi.list('signe', 1)
    const pages = Math.ceil(first.total / (first.parPage || 20))
    const rest = await Promise.all(Array.from({ length: Math.max(0, pages - 1) }, (_, i) => contratsApi.list('signe', i + 2)))
    return [first, ...rest].flatMap((p) => p.items)
  }, [])

  const [contratId, setContratId] = useState('')
  const [mois,      setMois]      = useState(aujourdhuiIso().slice(0, 7))
  const [busy,      setBusy]      = useState(false)
  const [err,       setErr]       = useState<string | null>(null)

  const contrat = contrats?.find((c) => c.id === contratId) ?? null
  // Première période : de la date d'effet à la fin du mois
  const effet = contrat?.dateEffet ?? null
  const debutMois = `${mois}-01`
  const periodeDebut = effet && effet.slice(0, 7) === mois && effet > debutMois ? effet : debutMois
  const periodeFin = mois ? dernierJourDuMois(mois) : ''
  const avantEffet = !!effet && periodeFin < effet

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contrat || !mois) return
    setBusy(true)
    setErr(null)
    try {
      const f = await facturesApi.emettre({ contratId: contrat.id, periodeDebut, periodeFin })
      onDone({ id: f.id, reference: f.reference })
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "L'émission a échoué.")
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Spinner />
  if (error) return <ErrorState compact message={error} onRetry={refetch} />

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <p className="text-sm" style={{ color: 'rgba(30,15,70,0.72)' }}>
        Émission manuelle d'une période (un mois civil au plus), par exemple pour refacturer une période annulée par avoir.
        Le job quotidien facture déjà automatiquement le mois en cours.
      </p>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.7)' }}>Contrat signé</span>
        <select className="cubi-input" value={contratId} onChange={(e) => setContratId(e.target.value)} required>
          <option value="" disabled>Sélectionner un contrat</option>
          {(contrats ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.numero} — {c.organisation}</option>
          ))}
        </select>
        {contrats && contrats.length === 0 && (
          <span className="text-xs" style={{ color: 'rgba(30,15,70,0.62)' }}>Aucun contrat signé.</span>
        )}
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.7)' }}>Mois facturé</span>
        <input className="cubi-input" type="month" value={mois} onChange={(e) => setMois(e.target.value)} required />
        {contrat && mois && (
          <span className="text-xs" style={{ color: avantEffet ? '#dc2626' : 'rgba(30,15,70,0.62)' }}>
            {avantEffet
              ? `Période antérieure à la date d'effet du contrat (${formatDate(effet)}).`
              : `Période : ${formatDate(periodeDebut)} → ${formatDate(periodeFin)}`}
          </span>
        )}
      </label>
      {err && <Notice tone="error">{err}</Notice>}
      <div className="flex gap-3">
        <button type="button" className="btn-action flex-1" onClick={onClose} disabled={busy}>Annuler</button>
        <button type="submit" className="btn-action flex-1" disabled={busy || !contrat || avantEffet}
          style={{ background: 'rgba(107,79,224,0.1)' }}>
          {busy ? 'Émission…' : 'Émettre la facture'}
        </button>
      </div>
    </form>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function Facturation() {
  const navigate = useNavigate()
  const canWrite = useCanWrite()
  const [params, setParams] = useSearchParams()
  const statut       = params.get('statut') ?? ''
  const organisation = params.get('organisation') ?? ''
  const page         = Math.max(1, parseInt(params.get('page') ?? '1', 10) || 1)

  const [showEmettre, setShowEmettre] = useState(false)

  const setFilter = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) { if (v) next.set(k, v); else next.delete(k) }
    if (!('page' in patch)) next.delete('page')
    setParams(next, { replace: true })
  }

  const { data, loading, error, refetch } = useApi(
    () => facturesApi.list({ statut: statut || undefined, organisation: organisation || undefined, page }),
    [statut, organisation, page],
  )
  const { data: orgs } = useApi<Organisation[]>(() => api.get<Organisation[]>(ENDPOINTS.organisations), [])

  const factures = data?.data ?? []
  // X-Total-Count n'est lisible que si le back l'expose en CORS ; sinon on déduit « page suivante » d'une page pleine
  const total = data?.total ?? null
  const totalPages = total !== null ? Math.max(1, Math.ceil(total / PAR_PAGE)) : null
  const hasNext = totalPages !== null ? page < totalPages : factures.length === PAR_PAGE

  const orgOptions = useMemo(
    () => [...(orgs ?? [])].sort((a, b) => a.nom.localeCompare(b.nom, 'fr')),
    [orgs],
  )

  useEffect(() => { document.querySelector('main')?.scrollTo({ top: 0 }) }, [page])

  return (
    <div>
      <PageHeader
        title="Facturation"
        subtitle="Factures et avoirs émis à partir des contrats signés"
        actions={canWrite ? (
          <button type="button" className="btn-action flex items-center gap-1.5" onClick={() => setShowEmettre(true)}>
            <FilePlus2 size={14} /> Émettre une facture
          </button>
        ) : undefined}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <FilterPills options={FILTERS} value={statut} onChange={(v) => setFilter({ statut: v })} />
        <select
          className="cubi-input lg:max-w-xs"
          aria-label="Filtrer par organisation"
          value={organisation}
          onChange={(e) => setFilter({ organisation: e.target.value })}
        >
          <option value="">Toutes les organisations</option>
          {orgOptions.map((o) => <option key={o.id} value={o.id}>{o.nom}</option>)}
        </select>
      </div>

      {loading ? <Spinner /> : error ? <ErrorState message={error} onRetry={refetch} /> : (
        <>
          <div className="flex items-center mt-5 mb-4">
            <span className="text-sm font-semibold" style={{ color: 'rgba(30,15,70,0.7)' }}>
              {total !== null ? `${total} document${total !== 1 ? 's' : ''}` : `${factures.length} document${factures.length !== 1 ? 's' : ''} sur cette page`}
            </span>
          </div>

          {factures.length === 0 ? (
            <EmptyState
              title={statut || organisation ? 'Aucune facture pour ces filtres.' : 'Aucune facture émise pour le moment.'}
              hint={statut || organisation ? undefined : 'La première facture est émise automatiquement à la signature d\'un contrat.'}
            />
          ) : (
            <div className="flex flex-col gap-2.5">
              {factures.map((f) => (
                <FactureRow key={f.id} facture={f} onOpen={() => navigate(`/admin/facturation/${f.id}`)} />
              ))}
            </div>
          )}

          {(page > 1 || hasNext) && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button type="button" className="btn-action" disabled={page <= 1} onClick={() => setFilter({ page: String(page - 1) })}>
                Précédent
              </button>
              <span className="text-xs" style={{ color: 'rgba(30,15,70,0.62)' }}>
                Page {page}{totalPages !== null ? ` sur ${totalPages}` : ''}
              </span>
              <button type="button" className="btn-action" disabled={!hasNext} onClick={() => setFilter({ page: String(page + 1) })}>
                Suivant
              </button>
            </div>
          )}
        </>
      )}

      <Modal isOpen={showEmettre} onClose={() => setShowEmettre(false)} title="Émettre une facture" size="lg">
        {showEmettre && (
          <EmettreModal
            onClose={() => setShowEmettre(false)}
            onDone={(f) => {
              setShowEmettre(false)
              navigate(`/admin/facturation/${f.id}`, { state: { notice: `Facture ${f.reference} émise.` } })
            }}
          />
        )}
      </Modal>
    </div>
  )
}
