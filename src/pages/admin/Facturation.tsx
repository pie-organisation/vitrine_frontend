import { useState } from 'react'
import { Eye } from 'lucide-react'
import { PageHeader }     from '../../components/ui/PageHeader'
import { ExportButton }   from '../../components/ui/ExportButton'
import { MetricCard }     from '../../components/ui/MetricCard'
import { FilterPills }    from '../../components/ui/FilterPills'
import { ListCard }       from '../../components/ui/ListCard'
import { Badge }          from '../../components/ui/Badge'
import { DotsPagination } from '../../components/ui/DotsPagination'
import { Modal }          from '../../components/ui/Modal'
import { Logo }           from '../../components/ui/Logo'
import { useApi }        from '../../hooks/useApi'
import { api, ENDPOINTS } from '../../api/client'
import type { Facture, FactureStatut } from '../../mocks/data'

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUT_BADGE: Record<FactureStatut, { label: string; variant: 'green' | 'yellow' | 'red' }> = {
  payee:      { label: 'Payée',      variant: 'green'  },
  en_attente: { label: 'En attente', variant: 'yellow' },
  impayee:    { label: 'Impayée',    variant: 'red'    },
}

// ── Filter options ─────────────────────────────────────────────────────────────

const FILTERS = [
  { value: 'all',        label: 'Toutes'     },
  { value: 'payee',      label: 'Payées'     },
  { value: 'en_attente', label: 'En attente' },
  { value: 'impayee',    label: 'Impayées'   },
]

const PER_PAGE = 5

// ── Facture row ───────────────────────────────────────────────────────────────

function FactureRow({ facture, onView }: { facture: Facture; onView: () => void }) {
  const st = STATUT_BADGE[facture.statut]

  return (
    <ListCard>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-sm shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(107,79,224,0.1), rgba(232,121,249,0.1))',
              color: '#6B4FE0',
            }}
          >
            {facture.organisation[0]}
          </div>
          <div className="min-w-0">
            <div className="font-display font-bold text-sm truncate" style={{ color: '#1a1040' }}>
              {facture.organisation}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(30,15,70,0.42)' }}>
              {facture.reference} · {facture.plan}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end shrink-0">
          <div className="text-right">
            <div className="text-sm font-semibold" style={{ color: '#1a1040' }}>{facture.montant}</div>
            <div className="text-xs" style={{ color: 'rgba(30,15,70,0.4)' }}>Éch. {facture.echeance}</div>
          </div>
          <Badge variant={st.variant} dot>{st.label}</Badge>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg border-none cursor-pointer"
            style={{ background: 'rgba(107,79,224,0.07)', color: '#6B4FE0' }}
            onClick={onView}
            title="Voir la facture"
          >
            <Eye size={14} />
          </button>
        </div>
      </div>
    </ListCard>
  )
}

// ── Invoice modal ─────────────────────────────────────────────────────────────

function InvoiceModal({ facture }: { facture: Facture }) {
  return (
    <div>
      {/* Header */}
      <div
        className="flex items-start justify-between pb-5 mb-5"
        style={{ borderBottom: '1px solid rgba(107,79,224,0.1)' }}
      >
        <Logo size="md" />
        <div className="text-right">
          <div className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.45)' }}>FACTURE</div>
          <div className="font-display font-bold text-lg" style={{ color: '#1a1040' }}>
            {facture.reference}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'rgba(30,15,70,0.4)' }}>
            Échéance : {facture.echeance}
          </div>
        </div>
      </div>

      {/* Recipient */}
      <div className="mb-5">
        <div className="text-xs font-semibold mb-1" style={{ color: 'rgba(30,15,70,0.45)' }}>FACTURÉ À</div>
        <div className="font-semibold text-sm" style={{ color: '#1a1040' }}>{facture.organisation}</div>
      </div>

      {/* Line item */}
      <div
        className="rounded-xl overflow-hidden mb-5"
        style={{ border: '1px solid rgba(107,79,224,0.1)' }}
      >
        <div
          className="grid grid-cols-3 gap-2 px-4 py-2.5 text-xs font-semibold"
          style={{ background: 'rgba(107,79,224,0.05)', color: 'rgba(30,15,70,0.5)' }}
        >
          <span>Description</span>
          <span className="text-center">Durée</span>
          <span className="text-right">Montant HT</span>
        </div>
        <div className="grid grid-cols-3 gap-2 px-4 py-3.5 text-sm" style={{ color: '#1a1040' }}>
          <span>{facture.plan}</span>
          <span className="text-center">12 mois</span>
          <span className="text-right font-semibold">{facture.montant}</span>
        </div>
      </div>

      {/* Totals */}
      <div className="flex flex-col gap-1.5 items-end">
        <div className="flex justify-between w-52">
          <span className="text-xs" style={{ color: 'rgba(30,15,70,0.5)' }}>Sous-total HT</span>
          <span className="text-xs font-medium" style={{ color: '#1a1040' }}>{facture.montant}</span>
        </div>
        <div className="flex justify-between w-52">
          <span className="text-xs" style={{ color: 'rgba(30,15,70,0.5)' }}>TVA (20 %)</span>
          <span className="text-xs font-medium" style={{ color: '#1a1040' }}>calculée</span>
        </div>
        <div
          className="flex justify-between w-52 pt-2"
          style={{ borderTop: '1px solid rgba(107,79,224,0.12)' }}
        >
          <span className="text-sm font-bold" style={{ color: '#1a1040' }}>TOTAL TTC</span>
          <span
            className="text-sm font-bold"
            style={{
              background: 'linear-gradient(135deg, #6B4FE0, #C084FC)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {facture.montant}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div
        className="mt-6 pt-4 text-center text-xs"
        style={{ borderTop: '1px solid rgba(107,79,224,0.1)', color: 'rgba(30,15,70,0.35)' }}
      >
        CUBI SAS · 75001 Paris · SIRET 832 000 001 00014 · contact@cubi.fr
      </div>
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-7 h-7 rounded-full border-2 animate-spin"
        style={{ borderColor: 'rgba(107,79,224,0.2)', borderTopColor: '#6B4FE0' }} />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function Facturation() {
  const [filter,     setFilter]     = useState('all')
  const [page,       setPage]       = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data: factures, loading, error, refetch } = useApi<Facture[]>(
    () => api.get<Facture[]>(ENDPOINTS.factures),
    []
  )
  const allFactures = factures ?? []

  const handleFilter = (f: string) => { setFilter(f); setPage(0) }

  const filtered =
    filter === 'all'
      ? allFactures
      : allFactures.filter((f) => f.statut === filter)

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const visible    = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)
  const selected   = allFactures.find((f) => f.id === selectedId) ?? null

  const enAttente = allFactures.filter((f) => f.statut === 'en_attente').length
  const impayees  = allFactures.filter((f) => f.statut === 'impayee').length

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
        title="Facturation"
        subtitle="Suivi des paiements et factures clients"
        actions={<ExportButton filename="facturation" />}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <MetricCard label="MRR estimé"           value="58 320 €" sublabel="ce mois"             />
        <MetricCard label="Factures en attente"  value={enAttente} sublabel="à traiter"           />
        <MetricCard label="Impayés"              value={impayees}  sublabel="intervention requise" />
        <MetricCard label="Échéances 7 jours"    value={2}         sublabel="à anticiper"          />
      </div>

      {/* Filters */}
      <FilterPills options={FILTERS} value={filter} onChange={handleFilter} />

      <div className="flex items-center mt-5 mb-4">
        <span className="text-sm font-semibold" style={{ color: 'rgba(30,15,70,0.6)' }}>
          {filtered.length} facture{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2.5">
        {visible.map((f) => (
          <FactureRow key={f.id} facture={f} onView={() => setSelectedId(f.id)} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <DotsPagination total={totalPages} current={page} onChange={setPage} showLabel />
        </div>
      )}

      {/* Invoice modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelectedId(null)}
        title="Aperçu de la facture"
        size="lg"
      >
        {selected && <InvoiceModal facture={selected} />}
      </Modal>
    </div>
  )
}
