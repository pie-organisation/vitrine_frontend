import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, MonitorPlay } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Notice } from '../../components/ui/AsyncState'
import { VdiGate } from '../../components/vdi/VdiGate'
import { useVdi } from '../../contexts/VdiContext'
import { vdiApi, displayName, groupIdOf } from '../../api/vdi'

export function MachineCreate() {
  return <VdiGate><MachineCreateContent /></VdiGate>
}

function MachineCreateContent() {
  const navigate = useNavigate()
  const { groupes, users, vms, refresh } = useVdi()
  const [groupChoice, setGroupId] = useState('')
  const groupId = groupChoice || groupes[0]?.id || ''
  const [userId,  setUserId]  = useState('')
  const [busy,    setBusy]    = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const sansMachine = useMemo(() => {
    const pris = new Set(vms.map((v) => v.user_id))
    return users.filter((u) => !pris.has(u.id) && groupIdOf(u) === groupId)
  }, [users, vms, groupId])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) { setError('Choisissez un élève.'); return }
    setBusy(true)
    setError(null)
    try {
      const r = await vdiApi.createVm(userId)
      await refresh()
      navigate(`/school/machines/${r.vmid}`)
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : 'La création a échoué.')
      setBusy(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <nav className="flex items-center gap-1 text-xs mb-3" style={{ color: 'rgba(30,15,70,0.62)' }}>
        <Link to="/school/machines" className="no-underline" style={{ color: '#6B4FE0' }}>Machines</Link>
        <ChevronRight size={12} /> <span>Nouvelle</span>
      </nav>
      <PageHeader title="Créer une machine" subtitle="Un poste virtuel pour un élève qui n'en a pas encore." />

      {groupes.length === 0 ? (
        <Notice tone="info">
          Aucun groupe : <Link to="/school/groupes/nouveau" style={{ color: '#4c35b5' }}>créez d'abord un groupe d'élèves</Link>.
        </Notice>
      ) : (
        <form onSubmit={submit} className="section-card flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.7)' }}>Groupe</span>
            <select className="cubi-input" value={groupId} onChange={(e) => { setGroupId(e.target.value); setUserId('') }}>
              {groupes.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.7)' }}>Élève sans machine</span>
            <select className="cubi-input" value={userId} onChange={(e) => setUserId(e.target.value)} disabled={sansMachine.length === 0}>
              <option value="">— Choisir —</option>
              {sansMachine.map((u) => <option key={u.id} value={u.id}>{displayName(u)} ({u.email})</option>)}
            </select>
            {sansMachine.length === 0 && (
              <span className="text-xs" style={{ color: 'rgba(30,15,70,0.62)' }}>Tous les élèves de ce groupe ont déjà une machine.</span>
            )}
          </label>
          {error && <Notice tone="error">{error}</Notice>}
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn-primary !w-auto !py-2.5 !px-5 text-sm flex items-center gap-1.5" disabled={busy || !userId}>
              <MonitorPlay size={15} /> {busy ? 'Création…' : 'Créer la machine'}
            </button>
            <Link to="/school/machines" className="btn-action no-underline">Annuler</Link>
          </div>
        </form>
      )}
    </div>
  )
}
