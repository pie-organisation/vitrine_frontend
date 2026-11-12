import { useState } from 'react'
import { FileSpreadsheet, Download } from 'lucide-react'
import { parseMembersFile, parseMembersTextarea, invalidMembers, downloadTemplate } from '../../lib/groupImport'
import type { MemberInput } from '../../api/vdi'

/**
 * Saisie des élèves : fichier Excel/CSV (prioritaire) ou liste « email;nom;prénom » à la main.
 * Renvoie la liste analysée à chaque changement.
 */
export function MembersInput({ onChange, disabled }: { onChange: (members: MemberInput[], fileName?: string) => void; disabled?: boolean }) {
  const [fromFile,  setFromFile]  = useState<MemberInput[] | null>(null)
  const [fileLabel, setFileLabel] = useState('')
  const [text,      setText]      = useState('')
  const [error,     setError]     = useState<string | null>(null)

  const members = fromFile ?? parseMembersTextarea(text)
  const invalides = invalidMembers(members)

  const onFile = async (file: File | null) => {
    setError(null)
    if (!file) { setFromFile(null); setFileLabel(''); onChange(parseMembersTextarea(text)); return }
    try {
      const list = await parseMembersFile(file)
      setFromFile(list)
      setFileLabel(`${file.name} — ${list.length} élève${list.length > 1 ? 's' : ''}`)
      onChange(list, file.name)
    } catch (e) {
      setFromFile(null)
      setFileLabel('')
      setError(e instanceof Error ? e.message : 'Fichier illisible.')
      onChange(parseMembersTextarea(text))
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.7)' }}>Fichier Excel ou CSV (colonnes email, nom, prénom)</span>
        <button type="button" className="text-xs font-semibold border-none bg-transparent cursor-pointer flex items-center gap-1 p-0"
          style={{ color: '#6B4FE0' }} onClick={downloadTemplate}>
          <Download size={12} /> Modèle CSV
        </button>
      </div>
      <label className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer"
        style={{ border: '1.5px dashed rgba(107,79,224,0.35)', background: 'rgba(107,79,224,0.03)', opacity: disabled ? 0.6 : 1 }}>
        <FileSpreadsheet size={18} style={{ color: '#6B4FE0' }} />
        <span className="text-sm flex-1 min-w-0 truncate" style={{ color: fileLabel ? '#1a1040' : 'rgba(30,15,70,0.6)' }}>
          {fileLabel || 'Choisir un fichier .xlsx, .xls ou .csv'}
        </span>
        <input type="file" className="sr-only" accept=".xlsx,.xls,.csv,.tsv,.txt" disabled={disabled}
          onChange={(e) => void onFile(e.target.files?.[0] ?? null)} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.7)' }}>
          Ou à la main, une ligne par élève : email;nom;prénom
        </span>
        <textarea className="cubi-input resize-y font-mono text-xs" rows={6} value={text}
          disabled={disabled || fromFile !== null}
          onChange={(e) => { setText(e.target.value); onChange(parseMembersTextarea(e.target.value)) }}
          placeholder={'eleve1@ecole.fr;Dupont;Alice\neleve2@ecole.fr;Martin;Bob'} />
        {fromFile && <span className="text-[11px]" style={{ color: 'rgba(30,15,70,0.55)' }}>Le fichier est prioritaire : retirez-le pour saisir à la main.</span>}
      </label>

      {error && <p className="text-xs" style={{ color: '#dc2626' }}>{error}</p>}
      {members.length > 0 && (
        <p className="text-xs" style={{ color: invalides.length ? '#b45309' : 'rgba(30,15,70,0.65)' }}>
          {members.length} élève{members.length > 1 ? 's' : ''} détecté{members.length > 1 ? 's' : ''}
          {invalides.length > 0 && ` · ${invalides.length} e-mail${invalides.length > 1 ? 's' : ''} invalide${invalides.length > 1 ? 's' : ''} (${invalides.slice(0, 3).map((m) => m.email || 'vide').join(', ')}${invalides.length > 3 ? '…' : ''})`}
        </p>
      )}
    </div>
  )
}
