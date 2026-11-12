import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronRight, Upload, KeyRound, Power } from 'lucide-react'
import { PageHeader }  from '../../components/ui/PageHeader'
import { SectionCard } from '../../components/ui/SectionCard'
import { Modal }       from '../../components/ui/Modal'
import { ErrorState, Notice } from '../../components/ui/AsyncState'
import { VdiGate }       from '../../components/vdi/VdiGate'
import { VmStatusBadge } from '../../components/vdi/VmStatusBadge'
import { SoftwarePanel } from '../../components/vdi/SoftwarePanel'
import { MemberResults } from '../../components/vdi/MemberResults'
import { useVdi, useGroupMembers } from '../../contexts/VdiContext'
import { vdiApi, displayName, type MemberResult } from '../../api/vdi'

export function GroupeDetail() {
  return <VdiGate><GroupeDetailContent /></VdiGate>
}

function GroupeDetailContent() {
  const { groupId = '' } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const { groupById, userById, refresh, error } = useVdi()
  const { members, vms } = useGroupMembers(groupId)
  const group = groupById.get(groupId)

  const [busy,      setBusy]      = useState<'provision' | 'bootstrap' | null>(null)
  const [confirm,   setConfirm]   = useState(false)
  const [notice,    setNotice]    = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [passwords, setPasswords] = useState<MemberResult[] | null>(null)

  if (!group) return <ErrorState message="Groupe introuvable." />

  const allumees = vms.filter((v) => v.status === 'running').length
  const sansMachine = members.filter((m) => !vms.some((v) => v.user_id === m.id)).length

  const provision = async () => {
    setBusy('provision')
    setNotice(null)
    try {
      await vdiApi.provision(groupId)
      setConfirm(false)
      setNotice({ tone: 'success', text: 'Allumage lancé : les machines manquantes sont créées puis démarrées. Actualisez dans quelques instants.' })
      await refresh()
    } catch (e) {
      setConfirm(false)
      setNotice({ tone: 'error', text: e instanceof Error ? e.message : "L'allumage a échoué." })
    } finally {
      setBusy(null)
    }
  }

  const bootstrap = async () => {
    setBusy('bootstrap')
    setNotice(null)
    setPasswords(null)
    try {
      const r = await vdiApi.bootstrap(groupId)
      const created = Object.entries(r.passwords ?? {}).map(([email, password]) => ({ email, password, created: true }))
      setPasswords(created)
      setNotice({
        tone: created.length ? 'success' : 'info',
        text: created.length
          ? `${created.length} mot${created.length > 1 ? 's' : ''} de passe généré${created.length > 1 ? 's' : ''}.`
          : `Aucun nouveau mot de passe : tous les comptes sont déjà initialisés${r.existing?.length ? ` (${r.existing.length})` : ''}.`,
      })
    } catch (e) {
      setNotice({ tone: 'error', text: e instanceof Error ? e.message : 'La génération des comptes a échoué.' })
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      <nav className="flex items-center gap-1 text-xs mb-3" style={{ color: 'rgba(30,15,70,0.62)' }}>
        <Link to="/school/groupes" className="no-underline" style={{ color: '#6B4FE0' }}>Groupes</Link>
        <ChevronRight size={12} /> <span>{group.name}</span>
      </nav>

      <PageHeader
        title={group.name}
        subtitle={group.description || `${members.length} élève${members.length > 1 ? 's' : ''} · ${vms.length} machine${vms.length > 1 ? 's' : ''}`}
        actions={
          <>
            <Link to={`/school/groupes/${groupId}/importer`} className="btn-action no-underline flex items-center gap-1.5">
              <Upload size={14} /> Importer des élèves
            </Link>
            <button type="button" className="btn-action flex items-center gap-1.5" onClick={bootstrap} disabled={busy !== null}>
              <KeyRound size={14} /> {busy === 'bootstrap' ? 'Génération…' : 'Générer les comptes'}
            </button>
            <button type="button" className="btn-primary !w-auto !py-2 !px-4 text-sm flex items-center gap-1.5"
              onClick={() => setConfirm(true)} disabled={busy !== null || members.length === 0}>
              <Power size={14} /> Allumer les machines
            </button>
          </>
        }
      />

      {error && <div className="mb-4"><Notice tone="error">{error}</Notice></div>}
      {notice && <div className="mb-4"><Notice tone={notice.tone} onClose={() => setNotice(null)}>{notice.text}</Notice></div>}
      {passwords && passwords.length > 0 && (
        <div className="mb-5"><MemberResults results={passwords} filename={`comptes-${group.name}.csv`} /></div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-5 mb-5">
        <SectionCard title="Le groupe">
          <div className="grid grid-cols-3 gap-3">
            {[['Élèves', members.length], ['Machines', vms.length], ['Allumées', `${allumees}/${vms.length}`]].map(([k, v]) => (
              <div key={k} className="rounded-xl p-3" style={{ background: 'rgba(107,79,224,0.05)' }}>
                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6B4FE0' }}>{k}</div>
                <div className="font-display font-extrabold text-2xl mt-1" style={{ color: '#1a1040' }}>{v}</div>
              </div>
            ))}
          </div>
          {sansMachine > 0 && (
            <p className="text-xs mt-3" style={{ color: 'rgba(30,15,70,0.65)' }}>
              {sansMachine} élève{sansMachine > 1 ? 's' : ''} sans machine : « Allumer les machines » les crée.
            </p>
          )}
        </SectionCard>
        <SoftwarePanel groupId={groupId} onDone={() => void refresh()} />
      </div>

      <SectionCard title={`Machines du groupe (${vms.length})`} className="mb-5">
        {vms.length === 0 ? (
          <p className="text-sm" style={{ color: 'rgba(30,15,70,0.62)' }}>Aucune machine. Utilisez « Allumer les machines ».</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left text-xs" style={{ color: 'rgba(30,15,70,0.62)' }}>
                  <th className="font-semibold py-2 pr-3">Élève</th><th className="font-semibold py-2 pr-3">VM</th>
                  <th className="font-semibold py-2 pr-3">Nom</th><th className="font-semibold py-2 pr-3">IP</th><th className="font-semibold py-2">État</th>
                </tr>
              </thead>
              <tbody>
                {vms.map((vm) => {
                  const u = userById.get(vm.user_id)
                  return (
                    <tr key={vm.vmid} className="cursor-pointer hover:bg-[rgba(107,79,224,0.03)]" onClick={() => navigate(`/school/machines/${vm.vmid}`)}
                      style={{ borderTop: '1px solid rgba(107,79,224,0.07)', color: '#1a1040' }}>
                      <td className="py-2.5 pr-3">{u ? displayName(u) : '—'}</td>
                      <td className="py-2.5 pr-3 tabular-nums">{vm.vmid}</td>
                      <td className="py-2.5 pr-3">{vm.vm_name}</td>
                      <td className="py-2.5 pr-3 tabular-nums">{vm.ip || '—'}</td>
                      <td className="py-2.5"><VmStatusBadge status={vm.status} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard title={`Élèves (${members.length})`}>
        {members.length === 0 ? (
          <p className="text-sm" style={{ color: 'rgba(30,15,70,0.62)' }}>
            Aucun élève. <Link to={`/school/groupes/${groupId}/importer`} style={{ color: '#6B4FE0' }}>Importer des élèves</Link>
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="text-left text-xs" style={{ color: 'rgba(30,15,70,0.62)' }}>
                  <th className="font-semibold py-2 pr-3">Nom</th><th className="font-semibold py-2 pr-3">E-mail</th>
                  <th className="font-semibold py-2 pr-3">Rôle</th><th className="font-semibold py-2">Machine</th>
                </tr>
              </thead>
              <tbody>
                {members.map((u) => {
                  const vm = vms.find((v) => v.user_id === u.id)
                  return (
                    <tr key={u.id} style={{ borderTop: '1px solid rgba(107,79,224,0.07)', color: '#1a1040' }}>
                      <td className="py-2.5 pr-3">{displayName(u)}</td>
                      <td className="py-2.5 pr-3 break-all">{u.email}</td>
                      <td className="py-2.5 pr-3">{u.role ?? '—'}</td>
                      <td className="py-2.5">
                        {vm ? <Link to={`/school/machines/${vm.vmid}`} className="no-underline"><VmStatusBadge status={vm.status} vmid={vm.vmid} /></Link> : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <Modal isOpen={confirm} onClose={() => busy === null && setConfirm(false)} title="Allumer les machines du groupe" dismissable={busy === null}>
        <div className="flex flex-col gap-4">
          <p className="text-sm" style={{ color: 'rgba(30,15,70,0.8)' }}>
            Les machines des {members.length} élève{members.length > 1 ? 's' : ''} de « {group.name} » seront démarrées
            {sansMachine > 0 ? `, et ${sansMachine} machine${sansMachine > 1 ? 's' : ''} manquante${sansMachine > 1 ? 's' : ''} seront créées` : ''}.
          </p>
          <div className="flex gap-3">
            <button type="button" className="btn-action flex-1" onClick={() => setConfirm(false)} disabled={busy !== null}>Annuler</button>
            <button type="button" className="btn-action flex-1" onClick={provision} disabled={busy !== null} style={{ background: 'rgba(107,79,224,0.1)' }}>
              {busy === 'provision' ? 'Allumage…' : 'Allumer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
