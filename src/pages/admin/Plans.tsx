import { useState } from 'react'
import { Plus, Pencil, Copy, Trash2 } from 'lucide-react'
import { PageHeader }    from '../../components/ui/PageHeader'
import { FilterPills }   from '../../components/ui/FilterPills'
import { ListCard }      from '../../components/ui/ListCard'
import { Badge }         from '../../components/ui/Badge'
import { DotsPagination } from '../../components/ui/DotsPagination'
import { Modal }          from '../../components/ui/Modal'
import { FilterPills as ModalFilterPills } from '../../components/ui/FilterPills'
import { Input }          from '../../components/ui/Input'
import { useApi }        from '../../hooks/useApi'
import { api, ENDPOINTS } from '../../api/client'
import type { Plan, PlanStatus } from '../../mocks/data'

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS: Record<PlanStatus, { label: string; variant: 'green' | 'yellow' | 'neutral' }> = {
  actif:    { label: 'Actif',     variant: 'green'   },
  brouillon:{ label: 'Brouillon', variant: 'yellow'  },
  archive:  { label: 'Archivé',   variant: 'neutral' },
}

// ── Plan row card ─────────────────────────────────────────────────────────────

function PlanRow({
  plan,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  plan: Plan
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  const st = STATUS[plan.statut]
  const sessionsLabel = plan.sessionsMax
    ? `${plan.sessionsMin} – ${plan.sessionsMax} sessions/mois`
    : `À partir de ${plan.sessionsMin} sessions/mois (illimité)`

  return (
    <ListCard>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        {/* Left */}
        <div className="flex items-start gap-4 min-w-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center font-display font-extrabold text-lg shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6B4FE0 0%, #C084FC 55%, #E879F9 100%)',
              color: '#fff',
            }}
          >
            {plan.id.replace('p', '')}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-display font-bold text-sm" style={{ color: '#1a1040' }}>
                {plan.nom}
              </span>
              <Badge variant={st.variant}>{st.label}</Badge>
            </div>
            <p className="text-xs" style={{ color: 'rgba(30,15,70,0.45)' }}>{plan.description}</p>
            <div className="flex flex-wrap gap-3 mt-2">
              <span className="text-xs font-semibold" style={{ color: '#6B4FE0' }}>{plan.tarif}</span>
              <span className="text-xs" style={{ color: 'rgba(30,15,70,0.4)' }}>·</span>
              <span className="text-xs" style={{ color: 'rgba(30,15,70,0.4)' }}>{sessionsLabel}</span>
              <span className="text-xs" style={{ color: 'rgba(30,15,70,0.4)' }}>·</span>
              <span className="text-xs" style={{ color: 'rgba(30,15,70,0.4)' }}>
                {plan.nbOrganisations} organisation{plan.nbOrganisations !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg border-none cursor-pointer transition-colors"
            style={{ background: 'rgba(107,79,224,0.07)', color: '#6B4FE0' }}
            onClick={onEdit}
            title="Modifier"
          >
            <Pencil size={14} />
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg border-none cursor-pointer transition-colors"
            style={{ background: 'rgba(107,79,224,0.07)', color: '#6B4FE0' }}
            onClick={onDuplicate}
            title="Dupliquer"
          >
            <Copy size={14} />
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg border-none cursor-pointer transition-colors"
            style={{ background: 'rgba(239,68,68,0.07)', color: '#dc2626' }}
            onClick={onDelete}
            title="Supprimer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </ListCard>
  )
}

// ── Edit modal ────────────────────────────────────────────────────────────────

const EDIT_FILTERS = [
  { value: 'general',  label: 'Général'       },
  { value: 'sessions', label: 'Sessions'      },
  { value: 'tarif',    label: 'Tarification'  },
]

function EditPlanModal({ plan, onClose }: { plan: Plan; onClose: () => void }) {
  const [section, setSection] = useState('general')

  return (
    <>
      <ModalFilterPills options={EDIT_FILTERS} value={section} onChange={setSection} />

      <div className="flex flex-col gap-4 mt-6">
        {section === 'general' && (
          <>
            <Input label="Nom du plan"   defaultValue={plan.nom}         />
            <Input label="Description"   defaultValue={plan.description} />
          </>
        )}
        {section === 'sessions' && (
          <div className="grid grid-cols-2 gap-3">
            <Input label="Sessions min / mois"  defaultValue={String(plan.sessionsMin)}        />
            <Input label="Sessions max / mois"  defaultValue={plan.sessionsMax ? String(plan.sessionsMax) : '—'} />
          </div>
        )}
        {section === 'tarif' && (
          <>
            <Input label="Tarif"       defaultValue={plan.tarif} />
            <Input label="Description (affichée aux clients)" defaultValue={plan.description} />
          </>
        )}
      </div>

      <div className="flex gap-3 mt-7">
        <button className="btn-primary flex-1" onClick={async () => { await api.patch(ENDPOINTS.plan(plan.id), { section }); onClose() }}>
          Enregistrer
        </button>
        <button className="btn-action flex-1" onClick={onClose}>Annuler</button>
      </div>
    </>
  )
}

// ── Filter options ─────────────────────────────────────────────────────────────

const FILTERS = [
  { value: 'all',       label: 'Tous'      },
  { value: 'actif',     label: 'Actifs'    },
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'archive',   label: 'Archivés'  },
]

const PER_PAGE = 5

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

export function Plans() {
  const [filter,  setFilter]  = useState('all')
  const [page,    setPage]    = useState(0)
  const [editId,  setEditId]  = useState<string | null>(null)

  const { data: plans, loading, error, refetch } = useApi<Plan[]>(
    () => api.get<Plan[]>(ENDPOINTS.plans),
    []
  )
  const allPlans = plans ?? []

  const handleFilter = (f: string) => { setFilter(f); setPage(0) }

  const filtered = filter === 'all'
    ? allPlans
    : allPlans.filter((p) => p.statut === filter)

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const visible    = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)
  const editPlan   = allPlans.find((p) => p.id === editId) ?? null

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
        title="Configurations plans"
        subtitle="Licences et tarifs disponibles"
        actions={
          <button
            className="btn-primary !w-auto flex items-center gap-1.5 text-sm !py-2.5 !px-4"
            onClick={() => api.post(ENDPOINTS.plans, {}).then(refetch)}
          >
            <Plus size={15} />
            Nouveau plan
          </button>
        }
      />

      {/* Filters */}
      <FilterPills options={FILTERS} value={filter} onChange={handleFilter} />

      {/* Count */}
      <div className="flex items-center justify-between mt-5 mb-5">
        <span className="text-sm font-semibold" style={{ color: 'rgba(30,15,70,0.6)' }}>
          {filtered.length} plan{filtered.length !== 1 ? 's' : ''} configuré{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2.5">
        {visible.map((plan) => (
          <PlanRow
            key={plan.id}
            plan={plan}
            onEdit={() => setEditId(plan.id)}
            onDuplicate={() => api.post(ENDPOINTS.plans, { copyOf: plan.id }).then(refetch)}
            onDelete={() => api.delete(ENDPOINTS.plan(plan.id)).then(refetch)}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <DotsPagination total={totalPages} current={page} onChange={setPage} showLabel />
        </div>
      )}

      {/* Edit modal */}
      <Modal
        isOpen={!!editPlan}
        onClose={() => setEditId(null)}
        title="Modifier le plan"
      >
        {editPlan && <EditPlanModal plan={editPlan} onClose={() => setEditId(null)} />}
      </Modal>
    </div>
  )
}
