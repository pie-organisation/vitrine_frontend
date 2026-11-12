import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronRight, Play, Square, Trash2, RefreshCw, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { PageHeader }  from '../../components/ui/PageHeader'
import { SectionCard } from '../../components/ui/SectionCard'
import { Modal }       from '../../components/ui/Modal'
import { Badge }       from '../../components/ui/Badge'
import { Spinner, ErrorState, Notice } from '../../components/ui/AsyncState'
import { VdiGate }       from '../../components/vdi/VdiGate'
import { VmStatusBadge } from '../../components/vdi/VmStatusBadge'
import { SoftwarePanel } from '../../components/vdi/SoftwarePanel'
import { useVdi } from '../../contexts/VdiContext'
import { vdiApi, displayName, type VmDetail, type VmSoftware, type VdiVm } from '../../api/vdi'

const fmt = (d?: string) => (d ? new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—')

/** Diagnostic rapide de la machine (repris de Site-Pie). */
function diagnostic(vm: VdiVm) {
  const notes: { tone: 'ok' | 'warn' | 'bad'; text: string }[] = []
  notes.push(vm.status === 'running' ? { tone: 'ok', text: 'Machine allumée' }
    : vm.status === 'stopped' ? { tone: 'warn', text: 'Machine éteinte' }
    : { tone: 'warn', text: `État : ${vm.status}` })
  notes.push(vm.ip ? { tone: 'ok', text: `Adresse IP ${vm.ip}` } : { tone: 'warn', text: "Pas d'adresse IP" })
  notes.push(vm.guacamole_connection_name || vm.guacamole_connection_id
    ? { tone: 'ok', text: 'Bureau à distance relié' }
    : { tone: 'warn', text: 'Pas de connexion bureau à distance' })
  if (vm.error) notes.push({ tone: 'bad', text: vm.error })
  return notes
}

const NOTE_ICON = { ok: CheckCircle2, warn: AlertTriangle, bad: XCircle }
const NOTE_COLOR = { ok: '#15803d', warn: '#b45309', bad: '#dc2626' }

export function MachineDetail() {
  return <VdiGate><MachineDetailContent /></VdiGate>
}

function MachineDetailContent() {
  const { vmid: param = '' } = useParams<{ vmid: string }>()
  const vmid = Number(param)
  const navigate = useNavigate()
  const { refresh } = useVdi()

  const [detail,   setDetail]   = useState<VmDetail | null>(null)
  const [software, setSoftware] = useState<VmSoftware[]>([])
  const [softErr,  setSoftErr]  = useState<string | null>(null)
  const [error,    setError]    = useState<string | null>(null)
  const [busy,     setBusy]     = useState<'start' | 'stop' | 'destroy' | null>(null)
  const [notice,   setNotice]   = useState<{ tone: 'success' | 'error'; text: string } | null>(null)
  const [confirmDestroy, setConfirmDestroy] = useState(false)

  const load = useCallback(async () => {
    if (!Number.isInteger(vmid) || vmid <= 0) { setError('Identifiant de machine invalide.'); return }
    setError(null)
    try {
      const [d, soft] = await Promise.all([
        vdiApi.vm(vmid),
        vdiApi.vmSoftware(vmid).then((s) => { setSoftErr(null); return s }).catch((e: unknown) => {
          setSoftErr(e instanceof Error ? e.message : 'Inventaire indisponible.')
          return [] as VmSoftware[]
        }),
      ])
      setDetail(d)
      setSoftware(soft)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Machine introuvable.')
    }
  }, [vmid])

  useEffect(() => { void load() }, [load])

  const act = async (action: 'start' | 'stop') => {
    setBusy(action)
    setNotice(null)
    try {
      await vdiApi.vmAction(vmid, action)
      setNotice({ tone: 'success', text: action === 'start' ? 'Démarrage demandé.' : 'Arrêt demandé.' })
      await Promise.all([load(), refresh()])
    } catch (e) {
      setNotice({ tone: 'error', text: e instanceof Error ? e.message : "L'action a échoué." })
    } finally {
      setBusy(null)
    }
  }

  const destroy = async () => {
    setBusy('destroy')
    try {
      await vdiApi.destroyVm(vmid)
      await refresh()
      navigate('/school/machines', { replace: true })
    } catch (e) {
      setConfirmDestroy(false)
      setNotice({ tone: 'error', text: e instanceof Error ? e.message : 'La suppression a échoué.' })
      setBusy(null)
    }
  }

  if (error) return <ErrorState message={error} onRetry={() => void load()} />
  if (!detail) return <Spinner />

  const { vm, user, groupe } = detail
  const running = vm.status === 'running'

  return (
    <div>
      <nav className="flex items-center gap-1 text-xs mb-3 flex-wrap" style={{ color: 'rgba(30,15,70,0.62)' }}>
        <Link to="/school/machines" className="no-underline" style={{ color: '#6B4FE0' }}>Machines</Link>
        {groupe?.id && <><ChevronRight size={12} /><Link to={`/school/groupes/${groupe.id}`} className="no-underline" style={{ color: '#6B4FE0' }}>{groupe.name}</Link></>}
        <ChevronRight size={12} /> <span>VM {vm.vmid}</span>
      </nav>

      <PageHeader
        title={vm.vm_name}
        subtitle={`VM ${vm.vmid}${user ? ` · ${displayName(user)}` : ''}`}
        actions={
          <>
            <VmStatusBadge status={vm.status} />
            <button type="button" className="btn-action flex items-center gap-1.5" onClick={() => void act('start')} disabled={busy !== null || running}>
              <Play size={14} /> {busy === 'start' ? 'Démarrage…' : 'Démarrer'}
            </button>
            <button type="button" className="btn-action flex items-center gap-1.5" onClick={() => void act('stop')} disabled={busy !== null || !running}>
              <Square size={14} /> {busy === 'stop' ? 'Arrêt…' : 'Arrêter'}
            </button>
            <button type="button" className="btn-danger flex items-center gap-1.5" onClick={() => setConfirmDestroy(true)} disabled={busy !== null}>
              <Trash2 size={14} /> Supprimer
            </button>
          </>
        }
      />

      {notice && <div className="mb-4"><Notice tone={notice.tone} onClose={() => setNotice(null)}>{notice.text}</Notice></div>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
        <SectionCard title="Machine">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {[
              ['VM', String(vm.vmid)], ['Adresse IP', vm.ip || '—'],
              ['Bureau à distance', vm.guacamole_connection_name || (vm.guacamole_connection_id ? String(vm.guacamole_connection_id) : '—')],
              ['Créée', fmt(vm.date_creation)], ['Modifiée', fmt(vm.date_modification)],
            ].map(([k, v]) => (
              <div key={k} className="min-w-0">
                <dt className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.62)' }}>{k}</dt>
                <dd className="font-medium break-words" style={{ color: '#1a1040' }}>{v}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-4 flex flex-col gap-1.5">
            {diagnostic(vm).map((n) => {
              const Icon = NOTE_ICON[n.tone]
              return (
                <li key={n.text} className="flex items-start gap-2 text-xs" style={{ color: NOTE_COLOR[n.tone] }}>
                  <Icon size={14} className="shrink-0 mt-px" /> {n.text}
                </li>
              )
            })}
          </ul>
        </SectionCard>

        <SectionCard title="Élève">
          {user ? (
            <dl className="flex flex-col gap-3 text-sm">
              <div><dt className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.62)' }}>Nom</dt><dd className="font-medium" style={{ color: '#1a1040' }}>{displayName(user)}</dd></div>
              <div><dt className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.62)' }}>E-mail</dt><dd className="font-medium break-all" style={{ color: '#1a1040' }}>{user.email}</dd></div>
              <div>
                <dt className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.62)' }}>Groupe</dt>
                <dd>{groupe?.id ? <Link to={`/school/groupes/${groupe.id}`} style={{ color: '#6B4FE0' }}>{groupe.name}</Link> : '—'}</dd>
              </div>
              <div><dt className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.62)' }}>Statut du compte</dt><dd>{user.statut ?? '—'}</dd></div>
            </dl>
          ) : (
            <p className="text-sm" style={{ color: 'rgba(30,15,70,0.62)' }}>Aucun élève rattaché.</p>
          )}
        </SectionCard>

        <SoftwarePanel vmid={vmid} onDone={() => void load()} />
      </div>

      <SectionCard
        title="Logiciels installés"
        action={<button type="button" className="btn-action flex items-center gap-1.5 text-xs" onClick={() => void load()}><RefreshCw size={13} /> Réanalyser</button>}
      >
        {softErr && <div className="mb-3"><Notice tone="error">{softErr}</Notice></div>}
        {software.length === 0 ? (
          <p className="text-sm" style={{ color: 'rgba(30,15,70,0.62)' }}>
            Aucun logiciel détecté{running ? '.' : ' : la machine est éteinte, démarrez-la pour analyser son contenu.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="text-left text-xs" style={{ color: 'rgba(30,15,70,0.62)' }}>
                  <th className="font-semibold py-2 pr-3">Application</th><th className="font-semibold py-2 pr-3">Installée</th>
                  <th className="font-semibold py-2 pr-3">Source</th><th className="font-semibold py-2">Dernière action</th>
                </tr>
              </thead>
              <tbody>
                {software.map((s) => (
                  <tr key={s.app_id} style={{ borderTop: '1px solid rgba(107,79,224,0.07)', color: '#1a1040' }}>
                    <td className="py-2.5 pr-3"><b>{s.name}</b><div className="text-xs" style={{ color: 'rgba(30,15,70,0.55)' }}>{s.app_id}</div></td>
                    <td className="py-2.5 pr-3"><Badge variant={s.installed ? 'green' : 'neutral'}>{s.installed ? 'Oui' : 'Non'}</Badge></td>
                    <td className="py-2.5 pr-3">{s.source}</td>
                    <td className="py-2.5">
                      {s.last_action ? `${s.last_action} (${s.last_status ?? '?'})` : '—'}
                      {s.hint && <div className="text-xs" style={{ color: 'rgba(30,15,70,0.55)' }}>{s.hint}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <Modal isOpen={confirmDestroy} onClose={() => busy === null && setConfirmDestroy(false)} title="Supprimer la machine" dismissable={busy === null}>
        <div className="flex flex-col gap-4">
          <p className="text-sm" style={{ color: 'rgba(30,15,70,0.8)' }}>
            La VM <strong>{vm.vmid}</strong>{user ? <> de <strong>{displayName(user)}</strong></> : null} sera détruite définitivement,
            avec tout son contenu. Le compte de l'élève est conservé.
          </p>
          <div className="flex gap-3">
            <button type="button" className="btn-action flex-1" onClick={() => setConfirmDestroy(false)} disabled={busy !== null}>Annuler</button>
            <button type="button" className="btn-danger flex-1" onClick={destroy} disabled={busy !== null}>
              {busy === 'destroy' ? 'Suppression…' : 'Supprimer définitivement'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
