import { Link, useNavigate } from 'react-router-dom'
import { Plus, Upload, Users, Monitor, ChevronRight } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { EmptyState, Notice } from '../../components/ui/AsyncState'
import { VdiGate } from '../../components/vdi/VdiGate'
import { useVdi } from '../../contexts/VdiContext'

export function Groupes() {
  return <VdiGate><GroupesContent /></VdiGate>
}

function GroupesContent() {
  const navigate = useNavigate()
  const { groupes, vms, users, error } = useVdi()

  return (
    <div>
      <PageHeader
        title="Groupes"
        subtitle="Un groupe rassemble des élèves : ouvrez-le pour piloter leurs machines et leurs logiciels."
        actions={
          <Link to="/school/groupes/nouveau" className="btn-primary !w-auto !py-2.5 !px-4 text-sm no-underline flex items-center gap-1.5">
            <Plus size={15} /> Créer un groupe
          </Link>
        }
      />

      {error && <div className="mb-4"><Notice tone="error">{error}</Notice></div>}

      {groupes.length === 0 ? (
        <EmptyState title="Aucun groupe pour le moment." hint="Créez un premier groupe, à la main ou à partir d'un fichier Excel ou CSV de vos élèves." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {groupes.map((g) => {
            const memberIds = new Set(users.filter((u) => (u.groupe_id || u.classe_id) === g.id).map((u) => u.id))
            const allumees = vms.filter((v) => memberIds.has(v.user_id) && v.status === 'running').length
            return (
              <article key={g.id} className="list-card clickable !p-5 flex flex-col gap-3" onClick={() => navigate(`/school/groupes/${g.id}`)}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6B4FE0' }}>Groupe</div>
                    <h2 className="font-display font-bold text-lg truncate" style={{ color: '#1a1040' }}>{g.name}</h2>
                  </div>
                  <ChevronRight size={16} style={{ color: 'rgba(107,79,224,0.5)' }} />
                </div>
                {g.description && <p className="text-xs" style={{ color: 'rgba(30,15,70,0.65)' }}>{g.description}</p>}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Users, label: 'Élèves', value: g.users },
                    { icon: Monitor, label: 'Machines', value: g.vms },
                    { icon: Monitor, label: 'Allumées', value: allumees },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-xl px-2.5 py-2" style={{ background: 'rgba(107,79,224,0.05)' }}>
                      <div className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: 'rgba(30,15,70,0.62)' }}>
                        <Icon size={11} /> {label}
                      </div>
                      <div className="font-display font-extrabold text-lg" style={{ color: '#1a1040' }}>{value}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Link to={`/school/groupes/${g.id}/importer`} className="btn-action no-underline flex items-center gap-1.5 text-xs">
                    <Upload size={13} /> Importer des élèves
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
