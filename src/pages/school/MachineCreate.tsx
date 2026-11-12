import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, MonitorPlay, Check, X, Loader2 } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Notice } from '../../components/ui/AsyncState'
import { VdiGate } from '../../components/vdi/VdiGate'
import { useVdi } from '../../contexts/VdiContext'
import { vdiApi, displayName, groupIdOf } from '../../api/vdi'

/** Nombre de créations envoyées en même temps à l'API (évite de saturer l'hyperviseur). */
const CONCURRENCE = 3

type Etat = { status: 'pending' | 'running' | 'done' | 'error'; vmid?: number; error?: string }

export function MachineCreate() {
  return <VdiGate><MachineCreateContent /></VdiGate>
}

function MachineCreateContent() {
  const navigate = useNavigate()
  const { groupes, users, vms, refresh } = useVdi()
  const [groupChoice, setGroupId] = useState('')
  const groupId = groupChoice || groupes[0]?.id || ''
  /** Élèves décochés (tout est coché par défaut). */
  const [exclus,  setExclus]  = useState<Set<string>>(new Set())
  const [etats,   setEtats]   = useState<Record<string, Etat> | null>(null)
  const [busy,    setBusy]    = useState(false)

  const sansMachine = useMemo(() => {
    const pris = new Set(vms.map((v) => v.user_id))
    return users.filter((u) => !pris.has(u.id) && groupIdOf(u) === groupId)
  }, [users, vms, groupId])

  const selection = sansMachine.filter((u) => !exclus.has(u.id))
  const toutCoche = selection.length === sansMachine.length

  const toggle = (id: string) => setExclus((prev) => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id); else next.add(id)
    return next
  })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selection.length) return
    const cibles = selection.map((u) => u.id)
    setBusy(true)
    setEtats(Object.fromEntries(cibles.map((id) => [id, { status: 'pending' }])))
    const set = (id: string, etat: Etat) => setEtats((prev) => ({ ...prev, [id]: etat }))

    // File d'attente traitée par quelques « ouvriers » en parallèle
    const file = [...cibles]
    const resultats: Record<string, Etat> = {}
    const ouvrier = async () => {
      for (let id = file.shift(); id; id = file.shift()) {
        set(id, { status: 'running' })
        try {
          const r = await vdiApi.createVm(id)
          resultats[id] = { status: 'done', vmid: r.vmid }
        } catch (err) {
          resultats[id] = { status: 'error', error: err instanceof Error ? err.message : 'Échec' }
        }
        set(id, resultats[id])
      }
    }
    await Promise.all(Array.from({ length: Math.min(CONCURRENCE, cibles.length) }, ouvrier))

    // Une seule machine créée avec succès : on ouvre directement sa fiche, comme avant
    const ok = Object.values(resultats).filter((r) => r.status === 'done')
    if (cibles.length === 1 && ok[0]?.vmid !== undefined) {
      await refresh()
      navigate(`/school/machines/${ok[0].vmid}`)
      return
    }
    setBusy(false)
    // Rafraîchi à la fin seulement : sinon les élèves servis disparaîtraient de la liste en cours de route
    await refresh()
  }

  const termine = etats !== null && !busy
  const nbOk  = etats ? Object.values(etats).filter((r) => r.status === 'done').length : 0
  const nbErr = etats ? Object.values(etats).filter((r) => r.status === 'error').length : 0
  const nbFait = nbOk + nbErr
  const total = etats ? Object.keys(etats).length : 0

  return (
    <div className="max-w-2xl">
      <nav className="flex items-center gap-1 text-xs mb-3" style={{ color: 'rgba(30,15,70,0.62)' }}>
        <Link to="/school/machines" className="no-underline" style={{ color: '#6B4FE0' }}>Machines</Link>
        <ChevronRight size={12} /> <span>Nouvelles</span>
      </nav>
      <PageHeader title="Créer des machines" subtitle="Un poste virtuel par élève qui n'en a pas encore. Cochez les élèves concernés." />

      {groupes.length === 0 ? (
        <Notice tone="info">
          Aucun groupe : <Link to="/school/groupes/nouveau" style={{ color: '#4c35b5' }}>créez d'abord un groupe d'élèves</Link>.
        </Notice>
      ) : etats ? (
        <div className="section-card flex flex-col gap-4">
          <Notice tone={!termine ? 'info' : nbErr ? 'error' : 'success'}>
            {!termine
              ? `Création en cours… ${nbFait} / ${total}`
              : `${nbOk} machine${nbOk > 1 ? 's' : ''} créée${nbOk > 1 ? 's' : ''}${nbErr ? `, ${nbErr} échec${nbErr > 1 ? 's' : ''}` : ''}.`}
          </Notice>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(107,79,224,0.1)' }}>
            <div className="h-full transition-all" style={{ width: `${total ? (nbFait / total) * 100 : 0}%`, background: nbErr ? '#f59e0b' : '#6B4FE0' }} />
          </div>
          <ul className="flex flex-col rounded-xl overflow-hidden max-h-96 overflow-y-auto m-0 p-0 list-none" style={{ border: '1px solid rgba(107,79,224,0.15)' }}>
            {Object.entries(etats).map(([id, etat], i) => {
              const u = users.find((x) => x.id === id)
              return (
                <li key={id} className="flex items-center gap-3 px-3 py-2 text-sm" style={{ borderTop: i ? '1px solid rgba(107,79,224,0.08)' : undefined }}>
                  <span className="flex-1 min-w-0 truncate" style={{ color: '#1a1040' }}>{u ? displayName(u) : id}</span>
                  {etat.status === 'pending' && <span className="text-xs" style={{ color: 'rgba(30,15,70,0.45)' }}>En attente</span>}
                  {etat.status === 'running' && <Loader2 size={14} className="animate-spin" style={{ color: '#6B4FE0' }} />}
                  {etat.status === 'done' && (
                    <Link to={`/school/machines/${etat.vmid}`} className="text-xs flex items-center gap-1 no-underline" style={{ color: '#15803d' }}>
                      <Check size={14} /> Machine {etat.vmid}
                    </Link>
                  )}
                  {etat.status === 'error' && (
                    <span className="text-xs flex items-center gap-1 min-w-0 truncate" style={{ color: '#dc2626' }} title={etat.error}>
                      <X size={14} /> {etat.error}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
          {termine && (
            <div className="flex flex-wrap gap-2">
              <Link to="/school/machines" className="btn-primary !w-auto !py-2.5 !px-4 text-sm no-underline">Voir les machines</Link>
              {nbErr > 0 && (
                <button type="button" className="btn-action" onClick={() => { setEtats(null); setExclus(new Set()) }}>
                  Réessayer les échecs
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="section-card flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.7)' }}>Groupe</span>
            <select className="cubi-input" value={groupId} onChange={(e) => { setGroupId(e.target.value); setExclus(new Set()) }}>
              {groupes.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </label>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.7)' }}>
                Élèves sans machine ({selection.length} / {sansMachine.length} sélectionné{selection.length > 1 ? 's' : ''})
              </span>
              {sansMachine.length > 1 && (
                <button type="button" className="text-xs font-semibold border-none bg-transparent cursor-pointer p-0" style={{ color: '#6B4FE0' }}
                  onClick={() => setExclus(toutCoche ? new Set(sansMachine.map((u) => u.id)) : new Set())}>
                  {toutCoche ? 'Tout décocher' : 'Tout cocher'}
                </button>
              )}
            </div>
            {sansMachine.length === 0 ? (
              <span className="text-xs" style={{ color: 'rgba(30,15,70,0.62)' }}>Tous les élèves de ce groupe ont déjà une machine.</span>
            ) : (
              <ul className="flex flex-col rounded-xl overflow-hidden max-h-96 overflow-y-auto m-0 p-0 list-none" style={{ border: '1px solid rgba(107,79,224,0.15)' }}>
                {sansMachine.map((u, i) => (
                  <li key={u.id} style={{ borderTop: i ? '1px solid rgba(107,79,224,0.08)' : undefined }}>
                    <label className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={!exclus.has(u.id)} onChange={() => toggle(u.id)} style={{ accentColor: '#6B4FE0' }} />
                      <span className="flex-1 min-w-0 truncate" style={{ color: '#1a1040' }}>{displayName(u)}</span>
                      <span className="text-xs min-w-0 truncate" style={{ color: 'rgba(30,15,70,0.55)' }}>{u.email}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn-primary !w-auto !py-2.5 !px-5 text-sm flex items-center gap-1.5" disabled={busy || !selection.length}>
              <MonitorPlay size={15} /> {selection.length > 1 ? `Créer ${selection.length} machines` : 'Créer la machine'}
            </button>
            <Link to="/school/machines" className="btn-action no-underline">Annuler</Link>
          </div>
        </form>
      )}
    </div>
  )
}
