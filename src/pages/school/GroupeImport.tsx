import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRight, Upload } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { ErrorState, Notice } from '../../components/ui/AsyncState'
import { VdiGate } from '../../components/vdi/VdiGate'
import { MembersInput } from '../../components/vdi/MembersInput'
import { MemberResults } from '../../components/vdi/MemberResults'
import { useVdi } from '../../contexts/VdiContext'
import { vdiApi, type MemberInput, type MemberResult } from '../../api/vdi'
import { invalidMembers } from '../../lib/groupImport'

export function GroupeImport() {
  return <VdiGate><GroupeImportContent /></VdiGate>
}

function GroupeImportContent() {
  const { groupId = '' } = useParams<{ groupId: string }>()
  const { orgId, groupById, refresh } = useVdi()
  const group = groupById.get(groupId)
  const [members, setMembers] = useState<MemberInput[]>([])
  const [busy,    setBusy]    = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [results, setResults] = useState<MemberResult[] | null>(null)
  const [round,   setRound]   = useState(0)

  if (!group) return <ErrorState message="Groupe introuvable." />

  const submit = async () => {
    setError(null)
    if (!members.length) { setError('Aucun élève à importer.'); return }
    if (invalidMembers(members).length) { setError("Corrigez les e-mails invalides avant l'import."); return }
    setBusy(true)
    try {
      const r = await vdiApi.addMembers(orgId, groupId, members)
      setResults(r.members ?? [])
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "L'import a échoué.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <nav className="flex items-center gap-1 text-xs mb-3" style={{ color: 'rgba(30,15,70,0.62)' }}>
        <Link to="/school/groupes" className="no-underline" style={{ color: '#6B4FE0' }}>Groupes</Link>
        <ChevronRight size={12} />
        <Link to={`/school/groupes/${groupId}`} className="no-underline" style={{ color: '#6B4FE0' }}>{group.name}</Link>
        <ChevronRight size={12} /> <span>Import</span>
      </nav>
      <PageHeader title="Importer des élèves" subtitle={`Ajout de comptes au groupe « ${group.name} ».`} />

      {results ? (
        <div className="flex flex-col gap-4">
          <MemberResults results={results} filename={`import-${group.name}.csv`} />
          <div className="flex flex-wrap gap-2">
            <Link to={`/school/groupes/${groupId}`} className="btn-primary !w-auto !py-2.5 !px-4 text-sm no-underline">Retour au groupe</Link>
            <button type="button" className="btn-action" onClick={() => { setResults(null); setMembers([]); setRound((n) => n + 1) }}>
              Importer d'autres élèves
            </button>
          </div>
        </div>
      ) : (
        <div className="section-card flex flex-col gap-5">
          <MembersInput key={round} disabled={busy} onChange={(list) => setMembers(list)} />
          {error && <Notice tone="error">{error}</Notice>}
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-primary !w-auto !py-2.5 !px-5 text-sm flex items-center gap-1.5"
              onClick={submit} disabled={busy || !members.length}>
              <Upload size={15} /> {busy ? 'Import…' : `Importer ${members.length || ''} élève${members.length > 1 ? 's' : ''}`}
            </button>
            <Link to={`/school/groupes/${groupId}`} className="btn-action no-underline">Annuler</Link>
          </div>
        </div>
      )}
    </div>
  )
}
