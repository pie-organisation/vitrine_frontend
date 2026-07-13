import { useState } from 'react'
import { ExternalLink, CheckCircle2, XCircle, ClipboardList } from 'lucide-react'
import { PageHeader }     from '../../components/ui/PageHeader'
import { FilterPills }    from '../../components/ui/FilterPills'
import { ListCard }       from '../../components/ui/ListCard'
import { Badge }          from '../../components/ui/Badge'
import { DotsPagination } from '../../components/ui/DotsPagination'
import { Modal }          from '../../components/ui/Modal'
import { SectionCard }    from '../../components/ui/SectionCard'
import { useApi }        from '../../hooks/useApi'
import { api, ENDPOINTS } from '../../api/client'
import type { Demande, DemandeStatut, OrgType } from '../../mocks/data'

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUT_BADGE: Record<DemandeStatut, { label: string; variant: 'yellow' | 'green' | 'red' }> = {
  en_attente: { label: 'En attente', variant: 'yellow' },
  validee:    { label: 'Validée',    variant: 'green'  },
  refusee:    { label: 'Refusée',    variant: 'red'    },
}

const TYPE_BADGE: Record<OrgType, { label: string; variant: 'blue' | 'violet' }> = {
  ecole:  { label: 'École',  variant: 'blue'   },
  groupe: { label: 'Groupe', variant: 'violet' },
}

// ── Filter options ─────────────────────────────────────────────────────────────

const FILTERS = [
  { value: 'all',        label: 'Toutes'     },
  { value: 'ecole',      label: 'Écoles'     },
  { value: 'groupe',     label: 'Groupes'    },
  { value: 'en_attente', label: 'En attente' },
  { value: 'validee',    label: 'Validées'   },
  { value: 'refusee',    label: 'Refusées'   },
]

const PER_PAGE = 4

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-7 h-7 rounded-full border-2 animate-spin"
        style={{ borderColor: 'rgba(107,79,224,0.2)', borderTopColor: '#6B4FE0' }} />
    </div>
  )
}

// ── Label–value row ───────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="flex items-start justify-between gap-4 py-2"
      style={{ borderBottom: '1px solid rgba(107,79,224,0.07)' }}
    >
      <span
        className="text-xs font-semibold shrink-0"
        style={{ color: 'rgba(30,15,70,0.45)', minWidth: '110px' }}
      >
        {label}
      </span>
      <span className="text-sm text-right" style={{ color: '#1a1040' }}>{value}</span>
    </div>
  )
}

// ── Demande card ──────────────────────────────────────────────────────────────

function DemandeCard({
  demande,
  onView,
  onValider,
  onRefuser,
}: {
  demande: Demande
  onView: () => void
  onValider: () => void
  onRefuser: () => void
}) {
  const st = STATUT_BADGE[demande.statut]
  const ty = TYPE_BADGE[demande.type]

  return (
    <ListCard onClick={onView}>
      <div className="flex flex-col gap-3">
        {/* Row 1: identity */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-sm shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(107,79,224,0.1), rgba(232,121,249,0.1))',
                color: '#6B4FE0',
              }}
            >
              {demande.nomEntite[0]}
            </div>
            <div className="min-w-0">
              <div className="font-display font-bold text-sm" style={{ color: '#1a1040' }}>
                {demande.nomEntite}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'rgba(30,15,70,0.42)' }}>
                Soumis le {demande.dateSubmission}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <Badge variant={ty.variant}>{ty.label}</Badge>
            <Badge variant={st.variant} dot>{st.label}</Badge>
          </div>
        </div>

        {/* Row 2: SIRET + actions */}
        <div
          className="flex items-center justify-between gap-3 flex-wrap"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2.5 flex-wrap">
            <code
              className="text-xs font-medium px-2 py-1 rounded-lg"
              style={{ background: 'rgba(107,79,224,0.06)', color: 'rgba(30,15,70,0.6)' }}
            >
              SIRET {demande.siret}
            </code>
            <Badge variant={demande.siretVerifie ? 'green' : 'neutral'}>
              {demande.siretVerifie ? '✓ Vérifié' : 'Non vérifié'}
            </Badge>
            <button
              className="flex items-center gap-1 text-xs font-medium border-none bg-transparent cursor-pointer"
              style={{ color: '#6B4FE0', fontFamily: 'var(--font-sans)' }}
              onClick={() => console.log('fc-link', demande.siret)}
            >
              <ExternalLink size={11} />
              France Compétences
            </button>
          </div>
          {demande.statut === 'en_attente' && (
            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border-none cursor-pointer"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a', fontFamily: 'var(--font-sans)' }}
                onClick={(e) => { e.stopPropagation(); onValider() }}
              >
                <CheckCircle2 size={13} />
                Valider
              </button>
              <button
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border-none cursor-pointer"
                style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', fontFamily: 'var(--font-sans)' }}
                onClick={(e) => { e.stopPropagation(); onRefuser() }}
              >
                <XCircle size={13} />
                Refuser
              </button>
            </div>
          )}
        </div>
      </div>
    </ListCard>
  )
}

// ── Detail modal ──────────────────────────────────────────────────────────────

function DemandeDetailModal({
  demande,
  onClose,
  onValider,
  onRefuser,
}: {
  demande: Demande
  onClose: () => void
  onValider: () => void
  onRefuser: () => void
}) {
  const st = STATUT_BADGE[demande.statut]
  const ty = TYPE_BADGE[demande.type]

  return (
    <>
      <div className="flex items-center gap-2 mb-5">
        <Badge variant={ty.variant}>{ty.label}</Badge>
        <Badge variant={st.variant} dot>{st.label}</Badge>
      </div>

      <SectionCard title="Entité">
        <InfoRow label="Nom du siège" value={demande.nomSiege} />
        <InfoRow label="Nom école"    value={demande.nomEcole} />
        <InfoRow label="DAF"          value={`${demande.prenomDaf} ${demande.nomDaf}`} />
        <InfoRow
          label="SIRET"
          value={
            <div className="flex items-center gap-2 justify-end">
              <code className="text-xs" style={{ color: 'rgba(30,15,70,0.6)' }}>{demande.siret}</code>
              <Badge variant={demande.siretVerifie ? 'green' : 'neutral'}>
                {demande.siretVerifie ? '✓ Vérifié' : 'Non vérifié'}
              </Badge>
            </div>
          }
        />
        {demande.visaEcole && <InfoRow label="Visa école" value={demande.visaEcole} />}
      </SectionCard>

      <SectionCard title="Adresse" className="mt-4">
        <InfoRow label="Adresse"     value={demande.adresse}    />
        <InfoRow label="Code postal" value={demande.codePostal} />
        <InfoRow label="Ville"       value={demande.ville}      />
      </SectionCard>

      <SectionCard title="Licence souhaitée" className="mt-4">
        <InfoRow
          label="Licence"
          value={<span className="font-semibold" style={{ color: '#6B4FE0' }}>{demande.planDemande}</span>}
        />
      </SectionCard>

      <SectionCard title="Contact référent" className="mt-4">
        <InfoRow label="Nom"   value={`${demande.prenomContact} ${demande.nomContact}`} />
        <InfoRow
          label="Email"
          value={
            <a href={`mailto:${demande.emailContact}`} className="no-underline" style={{ color: '#6B4FE0' }}>
              {demande.emailContact}
            </a>
          }
        />
      </SectionCard>

      {demande.statut === 'en_attente' && (
        <div className="flex gap-3 mt-6">
          <button
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border-none cursor-pointer"
            style={{ background: 'rgba(34,197,94,0.12)', color: '#16a34a', fontFamily: 'var(--font-sans)' }}
            onClick={() => { onValider(); onClose() }}
          >
            <CheckCircle2 size={15} />
            Valider la demande
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border-none cursor-pointer"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', fontFamily: 'var(--font-sans)' }}
            onClick={() => { onRefuser(); onClose() }}
          >
            <XCircle size={15} />
            Refuser
          </button>
        </div>
      )}
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function Demandes() {
  const [filter,      setFilter]      = useState('all')
  const [page,        setPage]        = useState(0)
  const [selectedId,  setSelectedId]  = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: demandes, loading, error, refetch } = useApi<Demande[]>(
    () => api.get<Demande[]>(ENDPOINTS.demandes),
    []
  )
  const allDemandes = demandes ?? []

  const handleAction = (id: string, statut: 'validee' | 'refusee') => {
    setActionError(null)
    api.patch(ENDPOINTS.demande(id), { statut })
      .then(refetch)
      .catch((e) => setActionError(e instanceof Error ? e.message : 'Erreur lors du traitement de la demande.'))
  }

  const enAttenteCount = allDemandes.filter((d) => d.statut === 'en_attente').length

  const handleFilter = (f: string) => { setFilter(f); setPage(0) }

  const filtered = allDemandes.filter((d) => {
    if (filter === 'all')    return true
    if (filter === 'ecole')  return d.type === 'ecole'
    if (filter === 'groupe') return d.type === 'groupe'
    return d.statut === filter
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const visible    = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)
  const selected   = allDemandes.find((d) => d.id === selectedId) ?? null

  if (loading) return <Spinner />
  if (error) return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>Erreur de chargement</p>
      <p className="text-xs" style={{ color: 'rgba(30,15,70,0.5)' }}>{error}</p>
      <button onClick={refetch} className="text-xs font-semibold px-4 py-2 rounded-xl border-none cursor-pointer"
        style={{ background: 'rgba(107,79,224,0.1)', color: '#6B4FE0' }}>Réessayer</button>
    </div>
  )

  return (
    <div>
      <PageHeader
        title="Demandes d'inscription"
        subtitle={`${enAttenteCount} demande${enAttenteCount !== 1 ? 's' : ''} en attente de traitement`}
        actions={
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626' }}
          >
            <ClipboardList size={13} />
            {enAttenteCount} en attente
          </div>
        }
      />

      {actionError && (
        <div
          className="rounded-xl px-4 py-3 text-sm mb-4 flex items-center justify-between gap-3"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626' }}
        >
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="text-xs font-semibold border-none bg-transparent cursor-pointer shrink-0"
            style={{ color: '#dc2626' }}
          >
            Fermer
          </button>
        </div>
      )}

      <FilterPills options={FILTERS} value={filter} onChange={handleFilter} />

      <div className="flex items-center mt-5 mb-4">
        <span className="text-sm font-semibold" style={{ color: 'rgba(30,15,70,0.6)' }}>
          {filtered.length} demande{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {visible.map((d) => (
          <DemandeCard
            key={d.id}
            demande={d}
            onView={() => setSelectedId(d.id)}
            onValider={() => handleAction(d.id, 'validee')}
            onRefuser={() => handleAction(d.id, 'refusee')}
          />
        ))}
        {visible.length === 0 && (
          <div
            className="rounded-2xl py-12 text-center text-sm"
            style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(107,79,224,0.08)', color: 'rgba(30,15,70,0.35)' }}
          >
            Aucune demande dans cette catégorie.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <DotsPagination total={totalPages} current={page} onChange={setPage} showLabel />
        </div>
      )}

      <Modal
        isOpen={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected?.nomEntite ?? ''}
        size="lg"
      >
        {selected && (
          <DemandeDetailModal
            demande={selected}
            onClose={() => setSelectedId(null)}
            onValider={() => handleAction(selected.id, 'validee')}
            onRefuser={() => handleAction(selected.id, 'refusee')}
          />
        )}
      </Modal>
    </div>
  )
}
