import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, KeyRound, Play, Check } from 'lucide-react'
import { PageHeader }  from '../../components/ui/PageHeader'
import { SectionCard } from '../../components/ui/SectionCard'
import { Spinner, ErrorState, EmptyState, Notice } from '../../components/ui/AsyncState'
import { VdiGate }  from '../../components/vdi/VdiGate'
import { JobTracker, loadCatalog } from '../../components/vdi/SoftwarePanel'
import { useVdi } from '../../contexts/VdiContext'
import { vdiApi, type AppAction, type CatalogApp } from '../../api/vdi'

export function Logiciels() {
  return <VdiGate><LogicielsContent /></VdiGate>
}

function AppCard({ app, selected, onSelect }: { app: CatalogApp; selected: boolean; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} aria-pressed={selected}
      className="text-left rounded-xl p-3.5 cursor-pointer transition-colors flex items-start gap-3 w-full"
      style={{
        background: selected ? 'rgba(107,79,224,0.08)' : '#fff',
        border: `1.5px solid ${selected ? '#6B4FE0' : 'rgba(107,79,224,0.14)'}`,
      }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: selected ? 'linear-gradient(135deg, #6B4FE0, #9333EA)' : 'rgba(107,79,224,0.08)', color: selected ? '#fff' : '#6B4FE0' }}>
        {selected ? <Check size={16} /> : app.requires_license ? <KeyRound size={16} /> : <Package size={16} />}
      </div>
      <div className="min-w-0">
        <div className="font-display font-bold text-sm" style={{ color: '#1a1040' }}>{app.name}</div>
        <div className="text-xs mt-0.5" style={{ color: 'rgba(30,15,70,0.62)' }}>
          {app.requires_license ? (app.license_label || "Code d'activation requis") : (app.description || 'Aucune clé requise')}
        </div>
      </div>
    </button>
  )
}

function LogicielsContent() {
  const { groupes, refresh } = useVdi()
  const [apps,    setApps]    = useState<CatalogApp[] | null>(null)
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [appId,   setAppId]   = useState('')
  const [groupChoice, setGroupId] = useState('')
  // Par défaut le premier groupe, y compris s'il arrive après le premier rendu
  const groupId = groupChoice || groupes[0]?.id || ''
  const [action,  setAction]  = useState<AppAction>('install')
  const [licence, setLicence] = useState('')
  const [busy,    setBusy]    = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [jobs,    setJobs]    = useState<{ id: string; label: string }[]>([])

  const charger = () => {
    setLoadErr(null)
    loadCatalog()
      .then((list) => { setApps(list); setAppId((cur) => cur || list[0]?.id || '') })
      .catch((e: unknown) => setLoadErr(e instanceof Error ? e.message : 'Catalogue indisponible.'))
  }
  useEffect(charger, [])

  const libres   = useMemo(() => (apps ?? []).filter((a) => !a.requires_license), [apps])
  const licences = useMemo(() => (apps ?? []).filter((a) => a.requires_license), [apps])
  const selected = apps?.find((a) => a.id === appId)
  const canConfigure = Boolean(selected?.actions?.configure || selected?.requires_license)
  const needsLicence = Boolean(selected?.requires_license) && (action === 'install' || action === 'configure')

  const launch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!groupId || !selected) return
    if (needsLicence && !licence.trim()) { setError(`${selected.license_label || "Code d'activation"} requis.`); return }
    setBusy(true)
    try {
      const job = await vdiApi.launchApp({ groupId }, { app_id: selected.id, action, ...(needsLicence ? { license_key: licence.trim() } : {}) })
      const gname = groupes.find((g) => g.id === groupId)?.name ?? 'groupe'
      setJobs((list) => [{ id: job.id, label: `${selected.name} · ${gname}` }, ...list].slice(0, 5))
      setLicence('')
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : 'Lancement impossible.')
    } finally {
      setBusy(false)
    }
  }

  if (loadErr) return <ErrorState message={loadErr} onRetry={charger} />
  if (!apps) return <Spinner label="Chargement du catalogue…" />

  return (
    <div>
      <PageHeader
        title="Logiciels"
        subtitle="Installez, mettez à jour ou retirez un logiciel sur toutes les machines d'un groupe en une fois."
      />

      {groupes.length === 0 && (
        <div className="mb-4">
          <Notice tone="info">Aucun groupe : <Link to="/school/groupes/nouveau" style={{ color: '#4c35b5' }}>créez un groupe</Link> pour déployer un logiciel.</Notice>
        </div>
      )}

      {apps.length === 0 ? <EmptyState title="Catalogue vide." /> : (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-5">
          <div className="flex flex-col gap-5">
            <SectionCard title={`Sans licence (${libres.length})`}>
              <p className="text-xs mb-3" style={{ color: 'rgba(30,15,70,0.62)' }}>Installables tout de suite, sans clé.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {libres.map((a) => <AppCard key={a.id} app={a} selected={a.id === appId} onSelect={() => { setAppId(a.id); setLicence('') }} />)}
              </div>
            </SectionCard>
            {licences.length > 0 && (
              <SectionCard title={`Avec licence (${licences.length})`}>
                <p className="text-xs mb-3" style={{ color: 'rgba(30,15,70,0.62)' }}>
                  Un code d'activation est demandé à l'installation. Il n'est ni stocké ni écrit dans les journaux.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {licences.map((a) => <AppCard key={a.id} app={a} selected={a.id === appId} onSelect={() => setAppId(a.id)} />)}
                </div>
              </SectionCard>
            )}
          </div>

          <div className="flex flex-col gap-5">
            <form onSubmit={launch} className="section-card flex flex-col gap-3 xl:sticky xl:top-0">
              <h3 className="font-display font-bold text-base" style={{ color: '#1a1040' }}>
                {selected ? selected.name : 'Choisissez un logiciel'}
              </h3>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.7)' }}>Groupe</span>
                <select className="cubi-input" value={groupId} onChange={(e) => setGroupId(e.target.value)} disabled={!groupes.length}>
                  {groupes.map((g) => <option key={g.id} value={g.id}>{g.name} ({g.users} élève{g.users > 1 ? 's' : ''})</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.7)' }}>Action</span>
                <select className="cubi-input" value={action} onChange={(e) => setAction(e.target.value as AppAction)}>
                  <option value="install">Installer</option>
                  {canConfigure && <option value="configure">Activer / saisir la licence</option>}
                  <option value="update">Mettre à jour</option>
                  <option value="uninstall">Désinstaller</option>
                </select>
              </label>
              {needsLicence && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.7)' }}>{selected?.license_label || "Code d'activation"}</span>
                  <input className="cubi-input ph-no-capture" type="password" autoComplete="off" value={licence}
                    onChange={(e) => setLicence(e.target.value)} placeholder="Collez la clé" />
                </label>
              )}
              {error && <Notice tone="error">{error}</Notice>}
              <button type="submit" className="btn-primary !py-2.5 text-sm flex items-center justify-center gap-1.5" disabled={busy || !groupId || !selected}>
                <Play size={15} /> {busy ? 'Lancement…' : 'Lancer sur le groupe'}
              </button>
            </form>

            {jobs.length > 0 && (
              <SectionCard title="Tâches en cours">
                <div className="flex flex-col gap-2">
                  {jobs.map((j) => (
                    <div key={j.id} className="flex flex-col gap-1">
                      <span className="text-xs font-semibold" style={{ color: '#1a1040' }}>{j.label}</span>
                      <JobTracker jobId={j.id} onFinished={() => void refresh()} />
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
