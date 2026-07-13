import { useState, useMemo } from 'react'
import {
  Plus, X, ChevronRight, Trash2, Pencil,
  UserPlus, Upload, FileSpreadsheet, ArrowLeft, User,
  Search, Download, CheckSquare, Square, RefreshCw,
} from 'lucide-react'
import { Modal }          from '../../components/ui/Modal'
import { Input }          from '../../components/ui/Input'
import { Badge }          from '../../components/ui/Badge'
import { DotsPagination } from '../../components/ui/DotsPagination'
import { useApi }         from '../../hooks/useApi'
import { api, ENDPOINTS } from '../../api/client'
import type {
  SchoolAccount,
  SchoolOrg,
  AccountType,
  AccountStatut,
} from '../../mocks/schoolData'

// ── Constantes ────────────────────────────────────────────────────────────────

const PER_PAGE = 6

const TABS: { value: AccountType; label: string }[] = [
  { value: 'admin',     label: 'Compte Admin'     },
  { value: 'scolarite', label: 'Compte Scolarité' },
  { value: 'eleve',     label: 'Compte Élève'     },
]

const TYPE_COLOR: Record<AccountType, string> = {
  admin:     'linear-gradient(135deg, #6B4FE0, #C084FC)',
  scolarite: 'linear-gradient(135deg, #0284c7, #38BDF8)',
  eleve:     'linear-gradient(135deg, #C084FC, #E879F9)',
}

const TYPE_BADGE: Record<AccountType, { label: string; variant: 'violet' | 'blue' | 'neutral' }> = {
  admin:     { label: 'Admin',     variant: 'violet'  },
  scolarite: { label: 'Scolarité', variant: 'blue'    },
  eleve:     { label: 'Élève',     variant: 'neutral' },
}

const ROLE_TABS: { value: AccountType; label: string }[] = [
  { value: 'admin',     label: 'Admin'     },
  { value: 'scolarite', label: 'Scolarité' },
  { value: 'eleve',     label: 'Élève'     },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ── Password strength ─────────────────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  let score = 0
  if (password.length >= 8)         score++
  if (password.length >= 12)        score++
  if (/[A-Z]/.test(password))       score++
  if (/[0-9]/.test(password))       score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const level =
    score <= 1 ? { label: 'Très faible', color: '#EF4444', pct: 20  } :
    score <= 2 ? { label: 'Faible',      color: '#F97316', pct: 40  } :
    score <= 3 ? { label: 'Moyen',       color: '#F59E0B', pct: 60  } :
    score <= 4 ? { label: 'Fort',        color: '#10B981', pct: 80  } :
                 { label: 'Très fort',   color: '#6B4FE0', pct: 100 }

  return (
    <div className="mt-1.5">
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(107,79,224,0.08)' }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${level.pct}%`, background: level.color }}
        />
      </div>
      <p className="text-[10px] mt-1 font-semibold" style={{ color: level.color }}>{level.label}</p>
    </div>
  )
}

// ── Status dot + toggle ───────────────────────────────────────────────────────

function StatusToggle({ statut, onChange }: { statut: AccountStatut; onChange: (s: AccountStatut) => void }) {
  const on = statut === 'actif'
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(on ? 'inactif' : 'actif')}
      className="relative flex-shrink-0 border-none cursor-pointer transition-colors duration-200"
      style={{
        width: 36, height: 20, borderRadius: 10,
        background: on ? 'linear-gradient(135deg, #6B4FE0, #C084FC)' : 'rgba(30,15,70,0.18)',
        boxShadow: on ? '0 2px 8px rgba(107,79,224,0.35)' : 'none',
        padding: 0,
      }}
    >
      <span
        className="absolute top-0.5 transition-all duration-200"
        style={{
          left: on ? 18 : 2,
          width: 16, height: 16, borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        }}
      />
    </button>
  )
}

// ── AccountRow ────────────────────────────────────────────────────────────────

function AccountRow({ account, selected, checked, statut, onSelect, onCheck }: {
  account: SchoolAccount
  selected: boolean
  checked: boolean
  statut: AccountStatut
  onSelect: () => void
  onCheck: (e: React.MouseEvent) => void
}) {
  const initials = `${account.prenom[0]}${account.nom[0]}`
  const isActif  = statut === 'actif'

  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-150"
      style={{
        background: selected ? 'rgba(107,79,224,0.07)' : checked ? 'rgba(107,79,224,0.04)' : 'rgba(255,255,255,0.85)',
        border: `1px solid ${selected ? 'rgba(107,79,224,0.25)' : checked ? 'rgba(107,79,224,0.2)' : 'rgba(107,79,224,0.08)'}`,
        boxShadow: selected ? '0 2px 12px rgba(107,79,224,0.1)' : '0 1px 4px rgba(107,79,224,0.04)',
      }}
    >
      {/* Checkbox */}
      <button
        onClick={onCheck}
        className="w-5 h-5 flex items-center justify-center border-none bg-transparent cursor-pointer shrink-0 p-0"
        style={{ color: checked ? '#6B4FE0' : 'rgba(107,79,224,0.25)' }}
      >
        {checked ? <CheckSquare size={16} /> : <Square size={16} />}
      </button>

      {/* Clickable row body */}
      <button
        onClick={onSelect}
        className="flex items-center gap-3 flex-1 min-w-0 border-none bg-transparent cursor-pointer p-0 text-left"
      >
        {/* Avatar + status dot */}
        <div className="relative shrink-0">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm text-white"
            style={{ background: TYPE_COLOR[account.type], opacity: isActif ? 1 : 0.5 }}
          >
            {initials}
          </div>
          <span
            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
            style={{ background: isActif ? '#10B981' : 'rgba(30,15,70,0.25)' }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div
            className="font-display font-bold text-sm truncate"
            style={{ color: isActif ? '#1a1040' : 'rgba(30,15,70,0.4)' }}
          >
            {account.prenom} {account.nom}
          </div>
          <div className="text-xs truncate mt-0.5" style={{ color: 'rgba(30,15,70,0.42)' }}>
            {account.email}
          </div>
        </div>

        {!isActif && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
            style={{ background: 'rgba(30,15,70,0.07)', color: 'rgba(30,15,70,0.4)' }}
          >
            Inactif
          </span>
        )}

        <ChevronRight size={14} style={{ color: 'rgba(107,79,224,0.35)', flexShrink: 0 }} />
      </button>
    </div>
  )
}

// ── DetailPanel ───────────────────────────────────────────────────────────────

function DetailPanel({ account, statut, onEdit, onDelete, onClose, onToggleStatus }: {
  account: SchoolAccount
  statut: AccountStatut
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
  onToggleStatus: (s: AccountStatut) => void
}) {
  const initials = `${account.prenom[0]}${account.nom[0]}`
  const tb = TYPE_BADGE[account.type]
  const isActif = statut === 'actif'

  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.95)',
        border: '1px solid rgba(107,79,224,0.12)',
        boxShadow: '0 8px 32px rgba(107,79,224,0.1)',
      }}
    >
      <div className="px-5 pt-6 pb-8 text-center relative" style={{ background: 'linear-gradient(135deg, #EEE6FF 0%, #FAE8FF 100%)' }}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg border-none cursor-pointer"
          style={{ background: 'rgba(107,79,224,0.1)', color: '#6B4FE0' }}
        >
          <X size={14} />
        </button>
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center font-display font-extrabold text-xl text-white mx-auto mb-3"
          style={{ background: TYPE_COLOR[account.type], boxShadow: '0 8px 24px rgba(107,79,224,0.25)', opacity: isActif ? 1 : 0.5 }}
        >
          {initials}
        </div>
        <div className="font-display font-extrabold text-lg leading-tight" style={{ color: '#1a1040' }}>
          {account.prenom} {account.nom}
        </div>
        <div className="mt-1.5"><Badge variant={tb.variant}>{tb.label}</Badge></div>
      </div>

      <div className="flex-1 px-5 py-4 flex flex-col gap-0">
        {/* Statut toggle */}
        <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid rgba(107,79,224,0.07)' }}>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(107,79,224,0.5)' }}>Statut</div>
            <div className="text-sm font-semibold" style={{ color: isActif ? '#10B981' : 'rgba(30,15,70,0.4)' }}>
              {isActif ? 'Actif' : 'Inactif'}
            </div>
          </div>
          <StatusToggle statut={statut} onChange={onToggleStatus} />
        </div>

        {[
          { label: 'E-mail',              value: account.email,             mono: false },
          { label: 'Licence CUBI',        value: account.licenceCubi,       mono: true  },
          { label: 'Dernière connexion',  value: account.derniereConnexion, mono: false },
        ].map(({ label, value, mono }) => (
          <div key={label} className="py-3" style={{ borderBottom: '1px solid rgba(107,79,224,0.07)' }}>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(107,79,224,0.5)' }}>{label}</div>
            <div className="text-sm font-medium break-all" style={{ color: '#1a1040', fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="px-5 pb-5 flex flex-col gap-2">
        <button className="btn-primary text-sm !py-2.5" onClick={onEdit}>
          <span className="flex items-center justify-center gap-2"><Pencil size={14} /> Modifier le compte</span>
        </button>
        <button className="btn-danger text-sm !py-2.5" onClick={onDelete}>
          <span className="flex items-center justify-center gap-2"><Trash2 size={14} /> Supprimer le compte</span>
        </button>
      </div>
    </div>
  )
}

// ── EditModal ─────────────────────────────────────────────────────────────────

function EditModal({ account, onClose, onSaved }: { account: SchoolAccount; onClose: () => void; onSaved: () => void }) {
  const [role,  setRole]  = useState<AccountType>(account.type)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true); setError(null)
    api.patch(ENDPOINTS.schoolCompte(account.id), { role })
      .then(() => { onSaved(); onClose() })
      .catch((e) => {
        setSaving(false)
        setError(e instanceof Error ? e.message : "Erreur lors de l'enregistrement.")
      })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(107,79,224,0.5)' }}>Rôle</p>
        <div className="flex gap-2">
          {ROLE_TABS.map((r) => (
            <button key={r.value} onClick={() => setRole(r.value)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold border-none cursor-pointer transition-all"
              style={{ background: role === r.value ? 'linear-gradient(135deg, #6B4FE0, #C084FC)' : 'rgba(107,79,224,0.07)', color: role === r.value ? '#fff' : '#6B4FE0', fontFamily: 'var(--font-sans)' }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="NOM"    defaultValue={account.nom}    />
        <Input label="Prénom" defaultValue={account.prenom} />
      </div>
      <Input label="E-mail" defaultValue={account.email} type="email" />
      <Input label="Licence CUBI" defaultValue={account.licenceCubi} disabled />
      <Input label="Nouveau mot de passe" type="password" placeholder="Laisser vide pour ne pas changer" />
      {error && (
        <div className="text-xs px-3 py-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626' }}>
          {error}
        </div>
      )}
      <div className="flex gap-3 mt-2">
        <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        <button className="btn-action flex-1" onClick={onClose}>Annuler</button>
      </div>
    </div>
  )
}

// ── DeleteModal ───────────────────────────────────────────────────────────────

function DeleteModal({ account, onClose, onDeleted }: { account: SchoolAccount; onClose: () => void; onDeleted: () => void }) {
  const [error,    setError]    = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = () => {
    setDeleting(true); setError(null)
    api.delete(ENDPOINTS.schoolCompte(account.id))
      .then(() => { onDeleted(); onClose() })
      .catch((e) => {
        setDeleting(false)
        setError(e instanceof Error ? e.message : 'Erreur lors de la suppression.')
      })
  }

  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.08)' }}>
        <Trash2 size={22} style={{ color: '#EF4444' }} />
      </div>
      <h3 className="font-display font-bold text-lg mb-2" style={{ color: '#1a1040' }}>Supprimer ce compte ?</h3>
      <p className="text-sm mb-6" style={{ color: 'rgba(30,15,70,0.5)' }}>
        Le compte de <strong>{account.prenom} {account.nom}</strong> sera définitivement supprimé. Cette action est irréversible.
      </p>
      {error && (
        <div className="text-xs px-3 py-2 rounded-xl mb-4" style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626' }}>
          {error}
        </div>
      )}
      <div className="flex gap-3">
        <button className="btn-action flex-1" onClick={onClose}>Annuler</button>
        <button className="btn-danger flex-1" onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Suppression…' : 'Supprimer'}
        </button>
      </div>
    </div>
  )
}

// ── BulkDeleteModal ───────────────────────────────────────────────────────────

function BulkDeleteModal({ count, onClose }: { count: number; onClose: () => void }) {
  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.08)' }}>
        <Trash2 size={22} style={{ color: '#EF4444' }} />
      </div>
      <h3 className="font-display font-bold text-lg mb-2" style={{ color: '#1a1040' }}>
        Supprimer {count} compte{count > 1 ? 's' : ''} ?
      </h3>
      <p className="text-sm mb-6" style={{ color: 'rgba(30,15,70,0.5)' }}>
        Cette action est irréversible. Les comptes sélectionnés seront définitivement supprimés.
      </p>
      <div className="flex gap-3">
        <button className="btn-action flex-1" onClick={onClose}>Annuler</button>
        <button className="btn-danger flex-1" onClick={onClose}>
          Supprimer {count} compte{count > 1 ? 's' : ''}
        </button>
      </div>
    </div>
  )
}

// ── BulkRoleModal ─────────────────────────────────────────────────────────────

function BulkRoleModal({ count, onClose }: { count: number; onClose: () => void }) {
  const [role, setRole] = useState<AccountType>('eleve')
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm" style={{ color: 'rgba(30,15,70,0.5)' }}>
        Choisissez le nouveau rôle pour les {count} compte{count > 1 ? 's' : ''} sélectionné{count > 1 ? 's' : ''}.
      </p>
      <div className="flex gap-2">
        {ROLE_TABS.map((r) => (
          <button key={r.value} onClick={() => setRole(r.value)}
            className="flex-1 py-2 rounded-xl text-sm font-semibold border-none cursor-pointer"
            style={{ background: role === r.value ? 'linear-gradient(135deg, #6B4FE0, #C084FC)' : 'rgba(107,79,224,0.07)', color: role === r.value ? '#fff' : '#6B4FE0', fontFamily: 'var(--font-sans)' }}>
            {r.label}
          </button>
        ))}
      </div>
      <div className="flex gap-3 mt-2">
        <button className="btn-primary flex-1" onClick={onClose}>Appliquer</button>
        <button className="btn-action flex-1" onClick={onClose}>Annuler</button>
      </div>
    </div>
  )
}

// ── ChoiceModal ───────────────────────────────────────────────────────────────

function ChoiceModal({ onManual, onImport, onClose }: {
  onManual: () => void; onImport: () => void; onClose: () => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm mb-2" style={{ color: 'rgba(30,15,70,0.5)' }}>
        Choisissez la méthode d'ajout des comptes.
      </p>
      <button onClick={onManual}
        className="flex items-start gap-4 p-4 rounded-2xl text-left border-none cursor-pointer"
        style={{ background: 'linear-gradient(135deg, rgba(107,79,224,0.06), rgba(232,121,249,0.06))', border: '1px solid rgba(107,79,224,0.15)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #6B4FE0, #C084FC)' }}>
          <UserPlus size={18} color="#fff" />
        </div>
        <div>
          <div className="font-display font-bold text-sm mb-0.5" style={{ color: '#1a1040' }}>Création manuelle</div>
          <div className="text-xs" style={{ color: 'rgba(30,15,70,0.45)' }}>Ajoutez plusieurs comptes individuellement avec prévisualisation en temps réel.</div>
        </div>
      </button>
      <button onClick={onImport}
        className="flex items-start gap-4 p-4 rounded-2xl text-left border-none cursor-pointer"
        style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(107,79,224,0.12)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(107,79,224,0.1)' }}>
          <Upload size={18} style={{ color: '#6B4FE0' }} />
        </div>
        <div>
          <div className="font-display font-bold text-sm mb-0.5" style={{ color: '#1a1040' }}>Import de fichier</div>
          <div className="text-xs" style={{ color: 'rgba(30,15,70,0.45)' }}>Importez un fichier CSV ou Excel pour créer plusieurs comptes en une seule opération.</div>
        </div>
      </button>
      <button className="btn-action !py-2.5 mt-1" onClick={onClose}>Annuler</button>
    </div>
  )
}

// ── ManualCreateView ──────────────────────────────────────────────────────────

interface FormData {
  type: AccountType; nom: string; prenom: string
  email: string; licence: string; password: string
}
const EMPTY_FORM: FormData = { type: 'eleve', nom: '', prenom: '', email: '', licence: '', password: '' }

function generateLicence(type: AccountType): string {
  const prefix = type === 'admin' ? 'ADM' : type === 'scolarite' ? 'SCO' : 'ELV'
  const num    = String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')
  return `CUBI-${prefix}-${num}`
}

function generatePassword(): string {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
  let pwd = ''
  for (let i = 0; i < 12; i++) pwd += charset[Math.floor(Math.random() * charset.length)]
  return pwd
}

function PendingRow({ item, index, onRemove }: {
  item: FormData; index: number; onRemove: () => void
}) {
  const initials = item.prenom && item.nom
    ? `${item.prenom[0]}${item.nom[0]}`
    : item.prenom?.[0] ?? item.nom?.[0] ?? '?'
  const tb = TYPE_BADGE[item.type]

  return (
    <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(107,79,224,0.1)', boxShadow: '0 1px 6px rgba(107,79,224,0.05)' }}>
      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
        style={{ background: 'rgba(107,79,224,0.1)', color: '#6B4FE0' }}>
        {index + 1}
      </span>
      <div className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-xs text-white shrink-0"
        style={{ background: TYPE_COLOR[item.type] }}>
        {initials.toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold truncate" style={{ color: '#1a1040' }}>{item.prenom} {item.nom}</span>
          <Badge variant={tb.variant}>{tb.label}</Badge>
        </div>
        <div className="text-xs truncate mt-0.5" style={{ color: 'rgba(30,15,70,0.4)' }}>{item.email || '—'}</div>
      </div>
      <button onClick={onRemove} className="w-6 h-6 flex items-center justify-center rounded-lg border-none cursor-pointer shrink-0"
        style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>
        <X size={12} />
      </button>
    </div>
  )
}

function ManualCreateView({ onBack, onSaved }: { onBack: () => void; onSaved: () => void }) {
  const [form,      setForm]      = useState<FormData>(EMPTY_FORM)
  const [pending,   setPending]   = useState<FormData[]>([])
  const [errors,    setErrors]    = useState<Partial<Record<keyof FormData, string>>>({})
  const [saving,    setSaving]    = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors((prev) => ({ ...prev, [key]: undefined }))
    setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (!form.nom.trim())    e.nom    = 'Obligatoire'
    if (!form.prenom.trim()) e.prenom = 'Obligatoire'
    if (form.email && !EMAIL_RE.test(form.email)) e.email = 'Format e-mail invalide'
    if (Object.keys(e).length > 0) { setErrors(e); return false }
    return true
  }

  const handleAdd = () => {
    if (!validate()) return
    const withLicence: FormData = form.licence
      ? form
      : { ...form, licence: generateLicence(form.type) }
    setPending((p) => [...p, withLicence])
    setForm(EMPTY_FORM)
    setErrors({})
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-semibold border-none bg-transparent cursor-pointer p-0" style={{ color: '#6B4FE0', fontFamily: 'var(--font-sans)' }}>
          <ArrowLeft size={13} /> Retour
        </button>
        <span className="text-xs" style={{ color: 'rgba(30,15,70,0.3)' }}>/</span>
        <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.5)' }}>Nouveau compte individuel</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

        {/* ── Formulaire ── */}
        <div className="rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(107,79,224,0.12)', boxShadow: '0 4px 24px rgba(107,79,224,0.07)', backdropFilter: 'blur(12px)' }}>
          <h2 className="font-display font-extrabold text-base mb-5" style={{ color: '#1a1040' }}>
            Nouveau compte individuel
          </h2>

          {/* Rôle */}
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: 'rgba(107,79,224,0.5)' }}>Rôle</p>
            <div className="flex gap-2">
              {ROLE_TABS.map((r) => (
                <button key={r.value} onClick={() => setForm((f) => ({ ...f, type: r.value }))}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold border-none cursor-pointer transition-all"
                  style={{ background: form.type === r.value ? 'linear-gradient(135deg, #6B4FE0, #C084FC)' : 'rgba(107,79,224,0.07)', color: form.type === r.value ? '#fff' : '#6B4FE0', fontFamily: 'var(--font-sans)', boxShadow: form.type === r.value ? '0 4px 12px rgba(107,79,224,0.25)' : 'none' }}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Champs */}
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input label="NOM" placeholder="Dupont" value={form.nom} onChange={set('nom')} />
                {errors.nom && <p className="text-[10px] mt-1" style={{ color: '#EF4444' }}>{errors.nom}</p>}
              </div>
              <div>
                <Input label="Prénom" placeholder="Marie" value={form.prenom} onChange={set('prenom')} />
                {errors.prenom && <p className="text-[10px] mt-1" style={{ color: '#EF4444' }}>{errors.prenom}</p>}
              </div>
            </div>
            <div>
              <Input label="Email de facturation (contact)" placeholder="marie@ecole.fr" type="email" value={form.email} onChange={set('email')} />
              {errors.email && <p className="text-[10px] mt-1" style={{ color: '#EF4444' }}>{errors.email}</p>}
            </div>

            {/* Licence avec générateur */}
            <div>
              <p className="text-xs font-semibold mb-1.5" style={{ color: 'rgba(30,15,70,0.6)' }}>Licence Cubi</p>
              <div className="flex gap-2">
                <input
                  value={form.licence}
                  onChange={set('licence')}
                  placeholder="CUBI-ELV-013"
                  className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'rgba(107,79,224,0.04)', border: '1px solid rgba(107,79,224,0.15)', color: '#1a1040', fontFamily: 'monospace' }}
                />
                <button
                  onClick={() => setForm((f) => ({ ...f, licence: generateLicence(f.type) }))}
                  title="Générer automatiquement"
                  className="px-3 rounded-xl border-none cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0"
                  style={{ background: 'rgba(107,79,224,0.1)', color: '#6B4FE0', fontFamily: 'var(--font-sans)' }}
                >
                  <RefreshCw size={12} /> Générer
                </button>
              </div>
            </div>

            {/* Mot de passe + force */}
            <div>
              <p className="text-xs font-semibold mb-1.5" style={{ color: 'rgba(30,15,70,0.6)' }}>Mot de passe temporaire</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Laisser vide pour générer automatiquement"
                  className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'rgba(107,79,224,0.04)', border: '1px solid rgba(107,79,224,0.15)', color: '#1a1040', fontFamily: 'monospace' }}
                />
                <button
                  onClick={() => setForm((f) => ({ ...f, password: generatePassword() }))}
                  title="Générer un mot de passe aléatoire"
                  className="px-3 rounded-xl border-none cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0"
                  style={{ background: 'rgba(107,79,224,0.1)', color: '#6B4FE0', fontFamily: 'var(--font-sans)' }}
                >
                  <RefreshCw size={12} /> Générer
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button className="btn-primary flex-1" onClick={handleAdd}>
              <span className="flex items-center justify-center gap-2"><Plus size={14} /> Ajouter</span>
            </button>
            <button className="btn-action" style={{ width: 'auto', padding: '0 18px' }} onClick={onBack}>Annuler</button>
          </div>
        </div>

        {/* ── Preview ── */}
        <div className="rounded-2xl p-6 flex flex-col"
          style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(107,79,224,0.1)', boxShadow: '0 4px 24px rgba(107,79,224,0.05)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-extrabold text-base" style={{ color: '#1a1040' }}>Comptes à ajouter</h2>
            {pending.length > 0 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'linear-gradient(135deg, #6B4FE0, #C084FC)', color: '#fff' }}>
                {pending.length}
              </span>
            )}
          </div>

          {pending.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10">
              <User size={36} strokeWidth={1.2} style={{ color: 'rgba(107,79,224,0.2)' }} />
              <p className="text-xs mt-3 font-medium text-center" style={{ color: 'rgba(30,15,70,0.3)' }}>
                Remplissez le formulaire et cliquez<br />sur "Ajouter" pour prévisualiser les comptes
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 flex-1">
              {pending.map((item, i) => (
                <PendingRow key={i} item={item} index={i} onRemove={() => setPending((p) => p.filter((_, idx) => idx !== i))} />
              ))}
            </div>
          )}

          {saveError && (
            <div className="rounded-xl px-3 py-2.5 text-xs mt-4"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626' }}>
              {saveError}
            </div>
          )}

          <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(107,79,224,0.08)' }}>
            <button
              className="btn-primary w-full"
              disabled={pending.length === 0 || saving}
              style={{ opacity: pending.length === 0 || saving ? 0.4 : 1 }}
              onClick={() => {
                setSaving(true); setSaveError(null)
                api.post(ENDPOINTS.schoolComptes, { comptes: pending })
                  .then(() => { onSaved(); onBack() })
                  .catch((e) => {
                    setSaving(false)
                    setSaveError(e instanceof Error ? e.message : "Erreur lors de la création des comptes.")
                  })
              }}
            >
              {saving ? 'Enregistrement…' : `Enregistrer ${pending.length > 0 ? `${pending.length} compte${pending.length > 1 ? 's' : ''}` : 'les comptes'}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── ImportView ────────────────────────────────────────────────────────────────

function ImportView({ onBack, onSaved }: { onBack: () => void; onSaved: () => void }) {
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-semibold border-none bg-transparent cursor-pointer p-0" style={{ color: '#6B4FE0', fontFamily: 'var(--font-sans)' }}>
          <ArrowLeft size={13} /> Retour
        </button>
        <span className="text-xs" style={{ color: 'rgba(30,15,70,0.3)' }}>/</span>
        <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.5)' }}>Import de fichier</span>
      </div>

      <div className="max-w-2xl">
        <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(107,79,224,0.12)', boxShadow: '0 4px 24px rgba(107,79,224,0.07)' }}>
          <h2 className="font-display font-extrabold text-base mb-1" style={{ color: '#1a1040' }}>Import de fichier</h2>
          <p className="text-xs mb-5" style={{ color: 'rgba(30,15,70,0.45)' }}>Importez un fichier CSV ou Excel (.xlsx) pour créer plusieurs comptes simultanément.</p>

          <div className="rounded-2xl flex flex-col items-center justify-center py-12 px-6 text-center cursor-pointer transition-all duration-200 mb-5"
            style={{ border: `2px dashed ${dragging ? '#6B4FE0' : 'rgba(107,79,224,0.25)'}`, background: dragging ? 'rgba(107,79,224,0.06)' : 'rgba(107,79,224,0.02)' }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) setFileName(f.name) }}
            onClick={() => document.getElementById('file-input-import')?.click()}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: dragging ? 'linear-gradient(135deg, #6B4FE0, #C084FC)' : 'rgba(107,79,224,0.1)' }}>
              <FileSpreadsheet size={22} style={{ color: dragging ? '#fff' : '#6B4FE0' }} />
            </div>
            {fileName ? (
              <>
                <p className="font-display font-bold text-sm mb-1" style={{ color: '#6B4FE0' }}>{fileName}</p>
                <p className="text-xs" style={{ color: 'rgba(30,15,70,0.4)' }}>Fichier prêt à être importé</p>
              </>
            ) : (
              <>
                <p className="font-display font-semibold text-sm mb-1" style={{ color: '#1a1040' }}>Glissez-déposez votre fichier ici</p>
                <p className="text-xs" style={{ color: 'rgba(30,15,70,0.4)' }}>ou <span style={{ color: '#6B4FE0', fontWeight: 600 }}>cliquez pour parcourir</span></p>
                <p className="text-[10px] mt-2" style={{ color: 'rgba(30,15,70,0.3)' }}>CSV ou Excel (.xlsx) — max 500 lignes</p>
              </>
            )}
            <input id="file-input-import" type="file" accept=".csv,.xlsx,.xls" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setFileName(f.name) }} />
          </div>

          <div className="flex items-center justify-between px-4 py-3 rounded-xl mb-5"
            style={{ background: 'rgba(107,79,224,0.04)', border: '1px solid rgba(107,79,224,0.1)' }}>
            <div>
              <div className="text-xs font-semibold" style={{ color: '#1a1040' }}>Modèle de fichier</div>
              <div className="text-[10px]" style={{ color: 'rgba(30,15,70,0.4)' }}>Téléchargez notre template avec les colonnes requises</div>
            </div>
            <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border-none cursor-pointer"
              style={{ background: 'rgba(107,79,224,0.1)', color: '#6B4FE0', fontFamily: 'var(--font-sans)' }}
              onClick={() => console.log('download-template')}>
              Télécharger
            </button>
          </div>

          {importError && (
            <div className="rounded-xl px-3 py-2.5 text-xs mb-4"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626' }}>
              {importError}
            </div>
          )}

          <div className="flex gap-3">
            <button className="btn-primary flex-1" disabled={!fileName} style={{ opacity: fileName ? 1 : 0.4 }}
              onClick={() => {
                setImportError(null)
                api.post(ENDPOINTS.schoolComptes, { fichier: fileName })
                  .then(() => { onSaved(); onBack() })
                  .catch((e) => setImportError(e instanceof Error ? e.message : "Erreur lors de l'import."))
              }}>
              Importer le fichier
            </button>
            <button className="btn-action" style={{ width: 'auto', padding: '0 18px' }} onClick={onBack}>Annuler</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────

type CreateMode = 'choice' | 'manual' | 'import' | null

export function Comptes() {
  const [tab,            setTab]           = useState<AccountType>('admin')
  const [detailId,       setDetailId]      = useState<string | null>(null)
  const [checkedIds,     setCheckedIds]    = useState<Set<string>>(new Set())
  const [statusMap,      setStatusMap]     = useState<Record<string, AccountStatut>>({})
  const [search,         setSearch]        = useState('')
  const [statusFilter,   setStatusFilter]  = useState<'all' | 'actif' | 'inactif'>('all')
  const [showEdit,       setShowEdit]      = useState(false)
  const [showDelete,     setShowDelete]    = useState(false)
  const [showBulkDelete, setShowBulkDelete]= useState(false)
  const [showBulkRole,   setShowBulkRole]  = useState(false)
  const [page,           setPage]          = useState(0)
  const [createMode,     setCreateMode]    = useState<CreateMode>(null)

  const { data: orgData } = useApi<SchoolOrg>(
    () => api.get<SchoolOrg>(ENDPOINTS.schoolOrg),
    []
  )
  const { data: allAccountsData, refetch: refetchAccounts } = useApi<SchoolAccount[]>(
    () => api.get<SchoolAccount[]>(ENDPOINTS.schoolComptes),
    []
  )
  const allAccountsRaw = allAccountsData ?? []

  const getStatut = (a: SchoolAccount): AccountStatut => statusMap[a.id] ?? a.statut

  // Filtrage
  const accounts = useMemo(() => {
    let list = allAccountsRaw.filter((a) => a.type === tab)
    if (statusFilter !== 'all') list = list.filter((a) => getStatut(a) === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((a) =>
        a.nom.toLowerCase().includes(q) ||
        a.prenom.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q)
      )
    }
    return list
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, statusFilter, search, statusMap, allAccountsRaw])

  const totalPages = Math.ceil(accounts.length / PER_PAGE)
  const visible    = accounts.slice(page * PER_PAGE, (page + 1) * PER_PAGE)
  const selected   = allAccountsRaw.find((a) => a.id === detailId) ?? null

  const handleTab = (t: AccountType) => { setTab(t); setDetailId(null); setCheckedIds(new Set()); setPage(0) }
  const handleSearch = (v: string) => { setSearch(v); setPage(0) }
  const handleStatusFilter = (v: 'all' | 'actif' | 'inactif') => { setStatusFilter(v); setPage(0) }

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    const pageIds = visible.map((a) => a.id)
    const allChecked = pageIds.every((id) => checkedIds.has(id))
    setCheckedIds((prev) => {
      const next = new Set(prev)
      allChecked ? pageIds.forEach((id) => next.delete(id)) : pageIds.forEach((id) => next.add(id))
      return next
    })
  }

  const handleToggleStatus = (id: string, statut: AccountStatut) => {
    setStatusMap((prev) => ({ ...prev, [id]: statut }))
    api.patch(ENDPOINTS.schoolCompte(id), { statut }).then(() => refetchAccounts())
  }

  const handleExport = () => {
    const list = accounts
    const csv = [
      ['Nom', 'Prénom', 'Email', 'Rôle', 'Licence', 'Statut', 'Dernière connexion'].join(','),
      ...list.map((a) =>
        [a.nom, a.prenom, a.email, a.type, a.licenceCubi, getStatut(a), a.derniereConnexion].join(',')
      ),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href     = url
    link.download = `comptes-${tab}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Modes création
  if (createMode === 'manual') return <ManualCreateView onBack={() => setCreateMode(null)} onSaved={refetchAccounts} />
  if (createMode === 'import') return <ImportView onBack={() => setCreateMode(null)} onSaved={refetchAccounts} />

  const allPageChecked = visible.length > 0 && visible.every((a) => checkedIds.has(a.id))

  return (
    <div>
      {/* Title */}
      <div className="mb-6">
        <h1 className="font-display font-extrabold text-2xl" style={{ color: '#1a1040', letterSpacing: '-0.5px' }}>
          {orgData?.nom ?? ''}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'rgba(30,15,70,0.45)' }}>Gestion des comptes utilisateurs</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {TABS.map((t) => {
          const count = allAccountsRaw.filter((a) => a.type === t.value).length
          return (
            <button key={t.value} onClick={() => handleTab(t.value)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-none cursor-pointer transition-all"
              style={{ background: tab === t.value ? 'linear-gradient(135deg, #6B4FE0, #C084FC)' : 'rgba(255,255,255,0.85)', color: tab === t.value ? '#fff' : 'rgba(30,15,70,0.55)', border: tab === t.value ? 'none' : '1px solid rgba(107,79,224,0.12)', fontFamily: 'var(--font-sans)', boxShadow: tab === t.value ? '0 4px 16px rgba(107,79,224,0.25)' : 'none' }}>
              {t.label}
              <span className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: tab === t.value ? 'rgba(255,255,255,0.25)' : 'rgba(107,79,224,0.1)', color: tab === t.value ? '#fff' : '#6B4FE0' }}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Recherche */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 min-w-[180px]"
          style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(107,79,224,0.12)' }}>
          <Search size={14} style={{ color: 'rgba(107,79,224,0.4)', flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Rechercher un compte..."
            className="flex-1 border-none outline-none bg-transparent text-sm"
            style={{ color: '#1a1040', fontFamily: 'var(--font-sans)' }}
          />
          {search && (
            <button onClick={() => handleSearch('')} className="border-none bg-transparent cursor-pointer p-0" style={{ color: 'rgba(107,79,224,0.4)' }}>
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filtre statut */}
        {(['all', 'actif', 'inactif'] as const).map((f) => (
          <button key={f} onClick={() => handleStatusFilter(f)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border-none cursor-pointer"
            style={{ background: statusFilter === f ? 'rgba(107,79,224,0.12)' : 'rgba(255,255,255,0.8)', color: statusFilter === f ? '#6B4FE0' : 'rgba(30,15,70,0.5)', border: `1px solid ${statusFilter === f ? 'rgba(107,79,224,0.2)' : 'rgba(107,79,224,0.08)'}`, fontFamily: 'var(--font-sans)' }}>
            {f === 'all' ? 'Tous' : f === 'actif' ? 'Actifs' : 'Inactifs'}
          </button>
        ))}

        {/* Exporter */}
        <button onClick={handleExport}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border-none cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.9)', color: '#6B4FE0', border: '1px solid rgba(107,79,224,0.15)', fontFamily: 'var(--font-sans)' }}>
          <Download size={13} /> Exporter
        </button>

        {/* Ajouter */}
        <button onClick={() => setCreateMode('choice')}
          className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border-none cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #6B4FE0, #C084FC)', color: '#fff', fontFamily: 'var(--font-sans)', boxShadow: '0 4px 12px rgba(107,79,224,0.3)' }}>
          <Plus size={13} /> Ajouter
        </button>
      </div>

      {/* Barre sélection groupée */}
      {checkedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl mb-3"
          style={{ background: 'rgba(107,79,224,0.06)', border: '1px solid rgba(107,79,224,0.18)' }}>
          <span className="text-sm font-semibold flex-1" style={{ color: '#6B4FE0' }}>
            {checkedIds.size} compte{checkedIds.size > 1 ? 's' : ''} sélectionné{checkedIds.size > 1 ? 's' : ''}
          </span>
          <button onClick={() => setShowBulkRole(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border-none cursor-pointer"
            style={{ background: 'rgba(107,79,224,0.1)', color: '#6B4FE0', fontFamily: 'var(--font-sans)' }}>
            <RefreshCw size={12} /> Changer le rôle
          </button>
          <button onClick={() => setShowBulkDelete(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border-none cursor-pointer"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontFamily: 'var(--font-sans)' }}>
            <Trash2 size={12} /> Supprimer
          </button>
          <button onClick={() => setCheckedIds(new Set())}
            className="w-6 h-6 flex items-center justify-center rounded-lg border-none cursor-pointer"
            style={{ background: 'rgba(107,79,224,0.08)', color: '#6B4FE0' }}>
            <X size={12} />
          </button>
        </div>
      )}

      {/* Sélectionner tout + compteur */}
      {visible.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <button onClick={toggleAll}
            className="flex items-center gap-1.5 text-xs font-semibold border-none bg-transparent cursor-pointer p-0"
            style={{ color: 'rgba(107,79,224,0.5)', fontFamily: 'var(--font-sans)' }}>
            {allPageChecked ? <CheckSquare size={14} style={{ color: '#6B4FE0' }} /> : <Square size={14} />}
            {allPageChecked ? 'Tout désélectionner' : 'Tout sélectionner'}
          </button>
          <span className="text-xs ml-auto" style={{ color: 'rgba(30,15,70,0.4)' }}>
            {accounts.length} résultat{accounts.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Split view */}
      <div className={`flex gap-4 items-start ${selected ? 'flex-col lg:flex-row' : ''}`}>
        <div className={selected ? 'w-full lg:flex-1' : 'w-full'}>
          <div className="flex flex-col gap-2">
            {visible.map((a) => (
              <AccountRow
                key={a.id}
                account={a}
                selected={detailId === a.id}
                checked={checkedIds.has(a.id)}
                statut={getStatut(a)}
                onSelect={() => setDetailId(a.id === detailId ? null : a.id)}
                onCheck={(e) => { e.stopPropagation(); toggleCheck(a.id) }}
              />
            ))}
            {visible.length === 0 && (
              <div className="rounded-2xl py-10 text-center text-sm"
                style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(107,79,224,0.08)', color: 'rgba(30,15,70,0.35)' }}>
                {search ? `Aucun résultat pour "${search}"` : 'Aucun compte dans cette catégorie.'}
              </div>
            )}
          </div>
          {totalPages > 1 && (
            <div className="mt-5">
              <DotsPagination total={totalPages} current={page} onChange={setPage} showLabel />
            </div>
          )}
        </div>

        {selected && (
          <>
            <div className="hidden lg:block" style={{ width: '280px', flexShrink: 0 }}>
              <DetailPanel
                account={selected}
                statut={getStatut(selected)}
                onEdit={() => setShowEdit(true)}
                onDelete={() => setShowDelete(true)}
                onClose={() => setDetailId(null)}
                onToggleStatus={(s) => handleToggleStatus(selected.id, s)}
              />
            </div>
            <div className="lg:hidden">
              <Modal isOpen onClose={() => setDetailId(null)} title="Détail du compte" size="md">
                <DetailPanel
                  account={selected}
                  statut={getStatut(selected)}
                  onEdit={() => setShowEdit(true)}
                  onDelete={() => setShowDelete(true)}
                  onClose={() => setDetailId(null)}
                  onToggleStatus={(s) => handleToggleStatus(selected.id, s)}
                />
              </Modal>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={createMode === 'choice'} onClose={() => setCreateMode(null)} title="Options d'ajout" size="md">
        <ChoiceModal onManual={() => setCreateMode('manual')} onImport={() => setCreateMode('import')} onClose={() => setCreateMode(null)} />
      </Modal>

      <Modal isOpen={showEdit && !!selected} onClose={() => setShowEdit(false)} title="Modifier le compte" size="md">
        {selected && <EditModal account={selected} onClose={() => setShowEdit(false)} onSaved={refetchAccounts} />}
      </Modal>

      <Modal isOpen={showDelete && !!selected} onClose={() => setShowDelete(false)} title="" size="md">
        {selected && <DeleteModal account={selected} onClose={() => { setShowDelete(false); setDetailId(null) }} onDeleted={refetchAccounts} />}
      </Modal>

      <Modal isOpen={showBulkDelete} onClose={() => setShowBulkDelete(false)} title="" size="md">
        <BulkDeleteModal count={checkedIds.size} onClose={() => { setShowBulkDelete(false); setCheckedIds(new Set()) }} />
      </Modal>

      <Modal isOpen={showBulkRole} onClose={() => setShowBulkRole(false)} title="Changer le rôle" size="md">
        <BulkRoleModal count={checkedIds.size} onClose={() => { setShowBulkRole(false); setCheckedIds(new Set()) }} />
      </Modal>
    </div>
  )
}
