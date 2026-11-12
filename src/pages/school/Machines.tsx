import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, RefreshCw, Search } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { MetricCard } from '../../components/ui/MetricCard'
import { EmptyState, Notice } from '../../components/ui/AsyncState'
import { VdiGate }       from '../../components/vdi/VdiGate'
import { VmStatusBadge } from '../../components/vdi/VmStatusBadge'
import { useVdi } from '../../contexts/VdiContext'
import { displayName, groupIdOf } from '../../api/vdi'

export function Machines() {
  return <VdiGate><MachinesContent /></VdiGate>
}

function MachinesContent() {
  const navigate = useNavigate()
  const { vms, groupes, userById, groupById, refresh, loading, error } = useVdi()
  const [groupFilter, setGroupFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase()
    return vms
      .map((vm) => {
        const u = userById.get(vm.user_id)
        const gid = u ? groupIdOf(u) : ''
        return { vm, u, gid, gname: groupById.get(gid)?.name }
      })
      .filter(({ vm, u, gid }) => {
        if (groupFilter && gid !== groupFilter) return false
        if (statusFilter === 'running' && vm.status !== 'running') return false
        if (statusFilter === 'stopped' && vm.status === 'running') return false
        if (!query) return true
        return [String(vm.vmid), vm.vm_name, vm.ip, vm.status, u?.email, u ? displayName(u) : '']
          .filter(Boolean).join(' ').toLowerCase().includes(query)
      })
  }, [vms, userById, groupById, groupFilter, statusFilter, q])

  const allumees = vms.filter((v) => v.status === 'running').length
  const enErreur = vms.filter((v) => v.error || v.status === 'error').length

  return (
    <div>
      <PageHeader
        title="Machines"
        subtitle="Les postes virtuels de vos élèves. Ouvrez une fiche pour la démarrer, l'arrêter ou l'équiper."
        actions={
          <>
            <button type="button" className="btn-action flex items-center gap-1.5" onClick={() => void refresh()} disabled={loading}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : undefined} /> Actualiser
            </button>
            <Link to="/school/machines/nouvelle" className="btn-primary !w-auto !py-2 !px-4 text-sm no-underline flex items-center gap-1.5">
              <Plus size={15} /> Créer une machine
            </Link>
          </>
        }
      />

      {error && <div className="mb-4"><Notice tone="error">{error}</Notice></div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MetricCard label="Machines" value={vms.length} />
        <MetricCard label="Allumées" value={`${allumees}/${vms.length}`} />
        <MetricCard label="Groupes" value={groupes.length} />
        <MetricCard label="En erreur" value={enErreur} sublabel={enErreur ? 'à vérifier' : undefined} />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="flex items-center gap-2 px-3 rounded-xl flex-1"
          style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(107,79,224,0.12)' }}>
          <Search size={14} style={{ color: 'rgba(107,79,224,0.7)' }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="VM, élève, IP…"
            aria-label="Rechercher une machine"
            className="flex-1 border-none outline-none bg-transparent text-sm py-2.5" style={{ color: '#1a1040' }} />
        </div>
        <select className="cubi-input sm:max-w-[200px]" value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} aria-label="Filtrer par groupe">
          <option value="">Tous les groupes</option>
          {groupes.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <select className="cubi-input sm:max-w-[170px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filtrer par état">
          <option value="">Tous les états</option>
          <option value="running">Allumées</option>
          <option value="stopped">Éteintes</option>
        </select>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title={vms.length ? 'Aucune machine pour ces filtres.' : 'Aucune machine pour le moment.'}
          hint={vms.length ? undefined : "Créez une machine pour un élève, ou allumez celles d'un groupe entier depuis sa fiche."}
        />
      ) : (
        <div className="section-card !p-0 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-xs" style={{ color: 'rgba(30,15,70,0.62)', background: 'rgba(107,79,224,0.04)' }}>
                <th className="font-semibold py-3 px-4">VM</th>
                <th className="font-semibold py-3 pr-3">Nom</th>
                <th className="font-semibold py-3 pr-3">Élève</th>
                <th className="font-semibold py-3 pr-3">Groupe</th>
                <th className="font-semibold py-3 pr-3">IP</th>
                <th className="font-semibold py-3 pr-4">État</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ vm, u, gid, gname }) => (
                <tr key={vm.vmid} className="cursor-pointer hover:bg-[rgba(107,79,224,0.03)]"
                  onClick={() => navigate(`/school/machines/${vm.vmid}`)}
                  style={{ borderTop: '1px solid rgba(107,79,224,0.07)', color: '#1a1040' }}>
                  <td className="py-3 px-4 tabular-nums font-semibold">{vm.vmid}</td>
                  <td className="py-3 pr-3">{vm.vm_name}</td>
                  <td className="py-3 pr-3">
                    {u ? <>{displayName(u)}<div className="text-xs" style={{ color: 'rgba(30,15,70,0.55)' }}>{u.email}</div></> : '—'}
                  </td>
                  <td className="py-3 pr-3" onClick={(e) => e.stopPropagation()}>
                    {gid ? <Link to={`/school/groupes/${gid}`} style={{ color: '#6B4FE0' }}>{gname ?? 'Groupe'}</Link> : '—'}
                  </td>
                  <td className="py-3 pr-3 tabular-nums">{vm.ip || '—'}</td>
                  <td className="py-3 pr-4"><VmStatusBadge status={vm.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
