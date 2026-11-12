import { Link } from 'react-router-dom'
import { Monitor, UsersRound, Power, ChevronRight } from 'lucide-react'
import { useVdi } from '../../contexts/VdiContext'
import { VdiNotConnected, VdiLogin } from './VdiGate'

/** Résumé « Postes de travail » du tableau de bord école (équivalent des stats de Site-Pie). */
export function PostesSummary() {
  const { configured, connected, loading, error, groupes, vms, users, refresh, disconnect } = useVdi()

  if (!configured) return <div className="mb-5"><VdiNotConnected compact /></div>
  if (!connected) return <div className="mb-5"><VdiLogin compact /></div>

  const allumees = vms.filter((v) => v.status === 'running').length
  const avecVm = new Set(vms.map((v) => v.user_id))
  const sansMachine = users.filter((u) => !avecVm.has(u.id)).length

  const tiles = [
    { icon: UsersRound, label: 'Groupes',           value: groupes.length,           to: '/school/groupes'  },
    { icon: Monitor,    label: 'Machines',          value: vms.length,               to: '/school/machines' },
    { icon: Power,      label: 'Allumées',          value: `${allumees}/${vms.length}`, to: '/school/machines' },
    { icon: Monitor,    label: 'Élèves sans machine', value: sansMachine,           to: '/school/machines/nouvelle' },
  ]

  return (
    <div className="rounded-2xl p-5 mb-5"
      style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(107,79,224,0.1)', boxShadow: '0 2px 16px rgba(107,79,224,0.06)' }}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6B4FE0' }}>Postes de travail</p>
        <div className="flex items-center gap-4">
          <Link to="/school/groupes/nouveau" className="text-xs font-semibold no-underline" style={{ color: '#6B4FE0' }}>
            + Créer un groupe
          </Link>
          <button type="button" onClick={disconnect} className="text-xs border-none bg-transparent cursor-pointer p-0"
            style={{ color: 'rgba(30,15,70,0.55)' }}>
            Se déconnecter
          </button>
        </div>
      </div>
      {error ? (
        <div className="flex items-center justify-between gap-3 text-sm" style={{ color: '#dc2626' }}>
          <span>{error}</span>
          <button type="button" className="btn-action" onClick={() => void refresh()}>Réessayer</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" aria-busy={loading}>
          {tiles.map(({ icon: Icon, label, value, to }) => (
            <Link key={label} to={to} className="no-underline rounded-xl p-3 flex items-center gap-3 transition-colors hover:bg-[rgba(107,79,224,0.07)]"
              style={{ background: 'rgba(107,79,224,0.04)', border: '1px solid rgba(107,79,224,0.08)' }}>
              <Icon size={18} style={{ color: '#6B4FE0' }} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-display font-extrabold text-lg leading-tight" style={{ color: '#1a1040' }}>{loading ? '…' : value}</div>
                <div className="text-[11px] truncate" style={{ color: 'rgba(30,15,70,0.62)' }}>{label}</div>
              </div>
              <ChevronRight size={14} style={{ color: 'rgba(107,79,224,0.4)' }} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
