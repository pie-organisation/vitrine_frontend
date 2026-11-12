import { useRef, useState } from 'react'
import { FileSpreadsheet, Download, Plus, X } from 'lucide-react'
import { parseMembersFile, parseMembersText, isValidEmail, downloadTemplate } from '../../lib/groupImport'
import type { MemberInput } from '../../api/vdi'

const labelStyle = { color: 'rgba(30,15,70,0.7)' }

/**
 * Saisie des élèves : import d'un fichier Excel/CSV et/ou ajout un par un via un petit formulaire.
 * Les élèves s'accumulent dans une liste (retirables) ; la page parente valide le tout d'un coup.
 * Pas de <form> ici : le composant est utilisé à l'intérieur d'un formulaire (GroupeCreate).
 */
export function MembersInput({ onChange, disabled }: { onChange: (members: MemberInput[], fileName?: string) => void; disabled?: boolean }) {
  const [members, setMembers] = useState<MemberInput[]>([])
  const [draft,   setDraft]   = useState<MemberInput>({ prenom: '', nom: '', email: '' })
  const [formErr, setFormErr] = useState<string | null>(null)
  const [fileErr, setFileErr] = useState<string | null>(null)
  const [fileMsg, setFileMsg] = useState('')
  const [pasted,  setPasted]  = useState('')
  const firstField = useRef<HTMLInputElement>(null)

  const update = (list: MemberInput[], fileName?: string) => { setMembers(list); onChange(list, fileName) }
  const hasEmail = (list: MemberInput[], email: string) => list.some((m) => m.email.toLowerCase() === email.toLowerCase())

  const add = () => {
    const m = { prenom: draft.prenom.trim(), nom: draft.nom.trim(), email: draft.email.trim() }
    if (!m.email) { setFormErr("L'e-mail est obligatoire."); return }
    if (!isValidEmail(m.email)) { setFormErr('E-mail invalide.'); return }
    if (hasEmail(members, m.email)) { setFormErr('Cet élève est déjà dans la liste.'); return }
    setFormErr(null)
    update([...members, m])
    setDraft({ prenom: '', nom: '', email: '' })
    firstField.current?.focus()
  }

  const remove = (index: number) => update(members.filter((_, i) => i !== index))

  /** Ajoute une liste (fichier ou collage) en ignorant les doublons ; renvoie le message de bilan. */
  const addMany = (parsed: MemberInput[], source: string, fileName?: string) => {
    const next = [...members]
    let doublons = 0
    for (const m of parsed) {
      if (hasEmail(next, m.email)) doublons++
      else next.push(m)
    }
    const ajoutes = next.length - members.length
    setFileMsg(`${source} : ${ajoutes} élève${ajoutes > 1 ? 's' : ''} ajouté${ajoutes > 1 ? 's' : ''}${doublons ? `, ${doublons} doublon${doublons > 1 ? 's' : ''} ignoré${doublons > 1 ? 's' : ''}` : ''}.`)
    update(next, fileName)
  }

  const addPasted = () => {
    const parsed = parseMembersText(pasted)
    if (!parsed.length) return
    addMany(parsed, 'Liste collée')
    setPasted('')
  }

  const onFile = async (input: HTMLInputElement) => {
    const file = input.files?.[0]
    input.value = '' // permet de re-sélectionner le même fichier
    if (!file) return
    setFileErr(null)
    try {
      addMany(await parseMembersFile(file), file.name, file.name)
    } catch (e) {
      setFileMsg('')
      setFileErr(e instanceof Error ? e.message : 'Fichier illisible.')
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); add() } // sinon Entrée soumettrait le formulaire parent
  }

  const invalides = members.filter((m) => !isValidEmail(m.email)).length

  return (
    <div className="flex flex-col gap-4">
      {/* Ajout un par un */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold" style={labelStyle}>Ajouter un élève</span>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1.5fr_auto] gap-2" onKeyDown={onKeyDown}>
          <input ref={firstField} className="cubi-input" placeholder="Prénom" value={draft.prenom} disabled={disabled}
            onChange={(e) => setDraft({ ...draft, prenom: e.target.value })} />
          <input className="cubi-input" placeholder="Nom" value={draft.nom} disabled={disabled}
            onChange={(e) => setDraft({ ...draft, nom: e.target.value })} />
          <input className="cubi-input" type="email" placeholder="E-mail *" value={draft.email} disabled={disabled}
            onChange={(e) => { setDraft({ ...draft, email: e.target.value }); setFormErr(null) }} />
          <button type="button" className="btn-action flex items-center justify-center gap-1" onClick={add} disabled={disabled}>
            <Plus size={14} /> Ajouter
          </button>
        </div>
        {formErr && <p className="text-xs" style={{ color: '#dc2626' }}>{formErr}</p>}
      </div>

      {/* Import fichier */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold" style={labelStyle}>Ou importer un fichier Excel / CSV (colonnes email, nom, prénom)</span>
          <button type="button" className="text-xs font-semibold border-none bg-transparent cursor-pointer flex items-center gap-1 p-0"
            style={{ color: '#6B4FE0' }} onClick={downloadTemplate}>
            <Download size={12} /> Modèle CSV
          </button>
        </div>
        <label className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer"
          style={{ border: '1.5px dashed rgba(107,79,224,0.35)', background: 'rgba(107,79,224,0.03)', opacity: disabled ? 0.6 : 1 }}>
          <FileSpreadsheet size={18} style={{ color: '#6B4FE0' }} />
          <span className="text-sm flex-1 min-w-0 truncate" style={{ color: 'rgba(30,15,70,0.6)' }}>
            Choisir un fichier .xlsx, .xls ou .csv — les élèves s'ajoutent à la liste
          </span>
          <input type="file" className="sr-only" accept=".xlsx,.xls,.csv,.tsv,.txt" disabled={disabled}
            onChange={(e) => void onFile(e.currentTarget)} />
        </label>
        <details className="text-xs">
          <summary className="cursor-pointer font-semibold select-none" style={{ color: '#6B4FE0' }}>
            Ou coller une liste (une ligne par élève : email;nom;prénom)
          </summary>
          <div className="flex flex-col gap-2 mt-2">
            <textarea className="cubi-input resize-y font-mono text-xs" rows={5} value={pasted} disabled={disabled}
              onChange={(e) => setPasted(e.target.value)}
              placeholder={'eleve1@ecole.fr;Dupont;Alice\neleve2@ecole.fr;Martin;Bob'} />
            <button type="button" className="btn-action self-start flex items-center gap-1"
              disabled={disabled || !pasted.trim()} onClick={addPasted}>
              <Plus size={14} /> Ajouter à la liste
            </button>
          </div>
        </details>
        {fileErr && <p className="text-xs" style={{ color: '#dc2626' }}>{fileErr}</p>}
        {fileMsg && <p className="text-xs" style={{ color: 'rgba(30,15,70,0.65)' }}>{fileMsg}</p>}
      </div>

      {/* Liste à valider */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold" style={labelStyle}>
            Élèves à ajouter ({members.length})
            {invalides > 0 && <span style={{ color: '#b45309' }}> · {invalides} e-mail{invalides > 1 ? 's' : ''} invalide{invalides > 1 ? 's' : ''}</span>}
          </span>
          {members.length > 0 && (
            <button type="button" className="text-xs font-semibold border-none bg-transparent cursor-pointer p-0"
              style={{ color: 'rgba(30,15,70,0.55)' }} disabled={disabled} onClick={() => { update([]); setFileMsg('') }}>
              Tout retirer
            </button>
          )}
        </div>
        {members.length === 0 ? (
          <p className="text-xs rounded-xl px-4 py-3" style={{ color: 'rgba(30,15,70,0.5)', background: 'rgba(107,79,224,0.03)' }}>
            Aucun élève pour l'instant. Ajoutez-les avec le formulaire ou un fichier.
          </p>
        ) : (
          <ul className="flex flex-col rounded-xl overflow-hidden max-h-80 overflow-y-auto m-0 p-0 list-none"
            style={{ border: '1px solid rgba(107,79,224,0.15)' }}>
            {members.map((m, i) => {
              const ok = isValidEmail(m.email)
              return (
                <li key={`${m.email}-${i}`} className="flex items-center gap-3 px-3 py-2 text-sm"
                  style={{ borderTop: i ? '1px solid rgba(107,79,224,0.08)' : undefined, background: ok ? undefined : 'rgba(245,158,11,0.08)' }}>
                  <span className="flex-1 min-w-0 truncate" style={{ color: '#1a1040' }}>
                    {[m.prenom, m.nom].filter(Boolean).join(' ') || <em style={{ color: 'rgba(30,15,70,0.45)' }}>Sans nom</em>}
                  </span>
                  <span className="flex-[1.5] min-w-0 truncate text-xs" style={{ color: ok ? 'rgba(30,15,70,0.65)' : '#b45309' }}>
                    {m.email || 'e-mail manquant'}
                  </span>
                  <button type="button" aria-label={`Retirer ${m.email}`} disabled={disabled}
                    className="border-none bg-transparent cursor-pointer p-1 flex" style={{ color: 'rgba(30,15,70,0.45)' }}
                    onClick={() => remove(i)}>
                    <X size={14} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
