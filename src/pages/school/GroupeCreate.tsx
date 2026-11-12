import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Notice } from '../../components/ui/AsyncState'
import { VdiGate } from '../../components/vdi/VdiGate'
import { MembersInput } from '../../components/vdi/MembersInput'
import { MemberResults } from '../../components/vdi/MemberResults'
import { useVdi } from '../../contexts/VdiContext'
import { vdiApi, type MemberInput, type MemberResult } from '../../api/vdi'
import { invalidMembers } from '../../lib/groupImport'

export function GroupeCreate() {
  return <VdiGate><GroupeCreateContent /></VdiGate>
}

function GroupeCreateContent() {
  const navigate = useNavigate()
  const { orgId, refresh } = useVdi()
  const [name,    setName]    = useState('')
  const [niveau,  setNiveau]  = useState('')
  const [members, setMembers] = useState<MemberInput[]>([])
  const [busy,    setBusy]    = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [created, setCreated] = useState<{ id: string; name: string; results: MemberResult[] } | null>(null)

  const invalides = invalidMembers(members)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim()) { setError('Le nom du groupe est obligatoire.'); return }
    if (invalides.length) { setError('Corrigez les e-mails invalides avant de créer le groupe.'); return }
    setBusy(true)
    try {
      const res = await vdiApi.createGroup(orgId, { name: name.trim(), niveau: niveau.trim() || undefined, members })
      setCreated({ id: res.id, name: res.name, results: res.members ?? [] })
      await refresh()
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : 'La création a échoué.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <nav className="flex items-center gap-1 text-xs mb-3" style={{ color: 'rgba(30,15,70,0.62)' }}>
        <Link to="/school/groupes" className="no-underline" style={{ color: '#6B4FE0' }}>Groupes</Link>
        <ChevronRight size={12} /> <span>Nouveau</span>
      </nav>
      <PageHeader title="Créer un groupe" subtitle="Saisie à la main ou import Excel / CSV de vos élèves." />

      {created ? (
        <div className="flex flex-col gap-4">
          {(() => {
            const c = created.results.filter((r) => r.created).length
            const u = created.results.filter((r) => r.updated).length
            const f = created.results.filter((r) => r.error).length
            return (
              <Notice tone={f ? 'info' : 'success'}>
                Groupe « {created.name} » créé
                {created.results.length ? ` : ${c} compte${c > 1 ? 's' : ''} créé${c > 1 ? 's' : ''}, ${u} rattaché${u > 1 ? 's' : ''}, ${f} erreur${f > 1 ? 's' : ''}.` : ' (vide).'}
              </Notice>
            )
          })()}
          <MemberResults results={created.results} filename={`comptes-${created.name}.csv`} />
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-primary !w-auto !py-2.5 !px-4 text-sm" onClick={() => navigate(`/school/groupes/${created.id}`)}>
              Ouvrir le groupe
            </button>
            <Link to="/school/groupes" className="btn-action no-underline">Retour aux groupes</Link>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="section-card flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.7)' }}>Nom du groupe *</span>
              <input className="cubi-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : BTS SIO 1re année" required />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.7)' }}>Niveau (optionnel)</span>
              <input className="cubi-input" value={niveau} onChange={(e) => setNiveau(e.target.value)} placeholder="L1, M2…" />
            </label>
          </div>

          <MembersInput disabled={busy} onChange={(list, fileName) => {
            setMembers(list)
            if (fileName && !name.trim()) setName(fileName.replace(/\.(xlsx|xls|csv|tsv|txt)$/i, ''))
          }} />

          {error && <Notice tone="error">{error}</Notice>}
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn-primary !w-auto !py-2.5 !px-5 text-sm" disabled={busy || !name.trim()}>
              {busy ? 'Création…' : members.length ? `Créer le groupe et ${members.length} compte${members.length > 1 ? 's' : ''}` : 'Créer le groupe vide'}
            </button>
            <Link to="/school/groupes" className="btn-action no-underline">Annuler</Link>
          </div>
        </form>
      )}
    </div>
  )
}
