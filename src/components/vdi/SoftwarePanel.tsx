import { useEffect, useState } from 'react'
import { Package, Play } from 'lucide-react'
import { Notice } from '../ui/AsyncState'
import { Badge } from '../ui/Badge'
import { vdiApi, JOB_TERMINE, type AppAction, type AppJob, type CatalogApp } from '../../api/vdi'

const ACTIONS: { value: AppAction; label: string }[] = [
  { value: 'install',   label: 'Installer' },
  { value: 'configure', label: 'Activer / saisir la licence' },
  { value: 'update',    label: 'Mettre à jour' },
  { value: 'uninstall', label: 'Désinstaller' },
]

/** Catalogue partagé entre les panneaux d'une même page. */
let catalogCache: Promise<CatalogApp[]> | null = null
export function loadCatalog(): Promise<CatalogApp[]> {
  catalogCache ??= vdiApi.catalog().catch((e) => { catalogCache = null; throw e })
  return catalogCache
}

/** Suit un job d'installation jusqu'à son état final (sondage toutes les 3 s). */
export function JobTracker({ jobId, onFinished }: { jobId: string; onFinished?: () => void }) {
  const [job, setJob] = useState<AppJob | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let stop = false
    let timer: ReturnType<typeof setTimeout>
    const tick = async () => {
      try {
        const j = await vdiApi.job(jobId)
        if (stop) return
        setJob(j)
        setError(null)
        if (JOB_TERMINE.test(j.status)) { onFinished?.(); return }
      } catch (e) {
        if (stop) return
        setError(e instanceof Error ? e.message : 'Suivi indisponible.')
      }
      timer = setTimeout(tick, 3000)
    }
    void tick()
    return () => { stop = true; clearTimeout(timer) }
  // onFinished volontairement hors dépendances : un nouveau job = un nouveau suivi
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId])

  const termine = job ? JOB_TERMINE.test(job.status) : false
  const echec = job ? /fail|error/i.test(job.status) : false
  const items = job?.items ?? []
  const ok = items.filter((i) => /done|success|ok|completed/i.test(i.status)).length

  return (
    <div className="rounded-xl p-3 text-xs flex flex-col gap-1.5"
      style={{ background: 'rgba(107,79,224,0.05)', border: '1px solid rgba(107,79,224,0.12)' }}
      aria-live="polite">
      <div className="flex items-center justify-between gap-2">
        <span style={{ color: 'rgba(30,15,70,0.7)' }}>Tâche <code>{jobId.slice(0, 8)}</code></span>
        {job
          ? <Badge variant={echec ? 'red' : termine ? 'green' : 'blue'} dot>{termine ? (echec ? 'Échec' : 'Terminé') : 'En cours'} · {job.status}</Badge>
          : <Badge variant="neutral">En attente</Badge>}
      </div>
      {items.length > 0 && (
        <span style={{ color: 'rgba(30,15,70,0.7)' }}>{ok}/{items.length} machine{items.length > 1 ? 's' : ''} traitée{ok > 1 ? 's' : ''}</span>
      )}
      {items.filter((i) => i.error).map((i) => (
        <span key={i.vmid} style={{ color: '#dc2626' }}>VM {i.vmid} : {i.error}</span>
      ))}
      {error && <span style={{ color: '#dc2626' }}>{error}</span>}
    </div>
  )
}

interface SoftwarePanelProps {
  /** Une machine précise, sinon tout le groupe */
  vmid?: number
  groupId?: string
  onDone?: () => void
}

export function SoftwarePanel({ vmid, groupId, onDone }: SoftwarePanelProps) {
  const [apps,    setApps]    = useState<CatalogApp[]>([])
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [appId,   setAppId]   = useState('')
  const [action,  setAction]  = useState<AppAction>('install')
  const [licence, setLicence] = useState('')
  const [busy,    setBusy]    = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [jobId,   setJobId]   = useState<string | null>(null)

  useEffect(() => {
    loadCatalog()
      .then((list) => { setApps(list); setAppId((cur) => cur || list[0]?.id || '') })
      .catch((e: unknown) => setLoadErr(e instanceof Error ? e.message : 'Catalogue indisponible.'))
  }, [])

  const selected = apps.find((a) => a.id === appId)
  const canConfigure = Boolean(selected?.actions?.configure || selected?.requires_license)
  const needsLicence = Boolean(selected?.requires_license) && (action === 'install' || action === 'configure')

  const launch = async () => {
    setError(null)
    if (!appId || (!vmid && !groupId)) return
    if (needsLicence && !licence.trim()) {
      setError(`${selected?.license_label || "Code d'activation"} requis.`)
      return
    }
    setBusy(true)
    try {
      const job = await vdiApi.launchApp(vmid ? { vmid } : { groupId: groupId as string }, {
        app_id: appId, action, ...(needsLicence ? { license_key: licence.trim() } : {}),
      })
      setJobId(job.id)
      setLicence('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lancement impossible.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="section-card flex flex-col gap-3">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6B4FE0' }}>Logithèque</div>
        <h3 className="font-display font-bold text-base flex items-center gap-2 mt-1" style={{ color: '#1a1040' }}>
          <Package size={16} style={{ color: '#6B4FE0' }} />
          {vmid ? 'Logiciel sur cette machine' : 'Logiciel sur tout le groupe'}
        </h3>
      </div>

      {loadErr ? <Notice tone="error">{loadErr}</Notice> : (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.7)' }}>Application</span>
            <select className="cubi-input" value={appId} onChange={(e) => { setAppId(e.target.value); setLicence('') }}>
              {apps.map((a) => <option key={a.id} value={a.id}>{a.name}{a.requires_license ? ' (licence)' : ''}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.7)' }}>Action</span>
            <select className="cubi-input" value={action} onChange={(e) => setAction(e.target.value as AppAction)}>
              {ACTIONS.filter((a) => a.value !== 'configure' || canConfigure).map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </label>
          {needsLicence && (
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.7)' }}>
                {selected?.license_label || "Code d'activation"}
              </span>
              <input className="cubi-input ph-no-capture" type="password" autoComplete="off" value={licence}
                onChange={(e) => setLicence(e.target.value)} placeholder="Collez la clé : elle n'est ni stockée ni journalisée" />
            </label>
          )}
          {error && <Notice tone="error">{error}</Notice>}
          <button type="button" className="btn-action self-start flex items-center gap-1.5" onClick={launch}
            disabled={busy || !appId} style={{ background: 'rgba(107,79,224,0.1)' }}>
            <Play size={14} /> {busy ? 'Lancement…' : 'Lancer'}
          </button>
          {jobId && <JobTracker key={jobId} jobId={jobId} onFinished={onDone} />}
        </>
      )}
    </div>
  )
}
