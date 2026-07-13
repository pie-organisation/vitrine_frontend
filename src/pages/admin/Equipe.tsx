import { useState } from 'react'
import { UserPlus, MoreVertical, Shield, Headphones, Eye } from 'lucide-react'
import { PageHeader }  from '../../components/ui/PageHeader'
import { Badge }       from '../../components/ui/Badge'
import { Modal }       from '../../components/ui/Modal'
import { Input }       from '../../components/ui/Input'
import { FilterPills } from '../../components/ui/FilterPills'
import { useApi }        from '../../hooks/useApi'
import { api, ENDPOINTS } from '../../api/client'
import { useAuth }        from '../../contexts/AuthContext'
import type { MembreEquipe, RoleEquipe } from '../../mocks/data'

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLE_META: Record<RoleEquipe, { label: string; variant: 'violet' | 'blue' | 'neutral'; icon: React.ReactNode }> = {
  super_admin: { label: 'Super admin',   variant: 'violet',  icon: <Shield     size={11} /> },
  support:     { label: 'Support',       variant: 'blue',    icon: <Headphones size={11} /> },
  lecture:     { label: 'Lecture seule', variant: 'neutral', icon: <Eye        size={11} /> },
}

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-7 h-7 rounded-full border-2 animate-spin"
        style={{ borderColor: 'rgba(107,79,224,0.2)', borderTopColor: '#6B4FE0' }} />
    </div>
  )
}

// ── Member row ────────────────────────────────────────────────────────────────

function MembreRow({
  membre,
  openMenuId,
  onToggleMenu,
  onDelete,
  onEditRole,
  canManage,
}: {
  membre: MembreEquipe
  openMenuId: string | null
  onToggleMenu: (id: string | null) => void
  onDelete: (membre: MembreEquipe) => void
  onEditRole: (membre: MembreEquipe) => void
  canManage: boolean
}) {
  const role     = ROLE_META[membre.role]
  const initials = `${membre.prenom[0]}${membre.nom[0]}`
  const isOpen   = openMenuId === membre.id

  return (
    <div
      className="list-card"
      onClick={() => { if (isOpen) onToggleMenu(null) }}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Avatar + name */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm shrink-0"
            style={{ background: 'linear-gradient(135deg, #6B4FE0, #C084FC)', color: '#fff' }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <div className="font-display font-bold text-sm" style={{ color: '#1a1040' }}>
              {membre.prenom} {membre.nom}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(30,15,70,0.42)' }}>
              {membre.email}
            </div>
          </div>
        </div>

        {/* Role + kebab */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:block">
            <Badge variant={role.variant}>{role.label}</Badge>
          </span>
          <span className="text-xs hidden md:block" style={{ color: 'rgba(30,15,70,0.35)' }}>
            depuis {membre.dateAjout}
          </span>

          {/* Kebab menu — réservé aux super admins */}
          {canManage && (
            <div className="relative">
              <button
                className="w-7 h-7 flex items-center justify-center rounded-lg border-none cursor-pointer"
                style={{
                  background: isOpen ? 'rgba(107,79,224,0.12)' : 'rgba(107,79,224,0.06)',
                  color: '#6B4FE0',
                }}
                onClick={(e) => { e.stopPropagation(); onToggleMenu(isOpen ? null : membre.id) }}
              >
                <MoreVertical size={14} />
              </button>
              {isOpen && (
                <div
                  className="absolute right-0 top-8 rounded-xl py-1.5 z-10"
                  style={{
                    background: '#fff',
                    border: '1px solid rgba(107,79,224,0.12)',
                    boxShadow: '0 8px 24px rgba(107,79,224,0.12)',
                    minWidth: '160px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="w-full px-4 py-2 text-left text-xs font-medium border-none cursor-pointer"
                    style={{ background: 'transparent', color: '#1a1040', fontFamily: 'var(--font-sans)' }}
                    onClick={() => { onEditRole(membre); onToggleMenu(null) }}
                  >
                    Modifier le rôle
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-xs font-medium border-none cursor-pointer"
                    style={{ background: 'transparent', color: '#dc2626', fontFamily: 'var(--font-sans)' }}
                    onClick={() => { onDelete(membre); onToggleMenu(null) }}
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Invite modal ──────────────────────────────────────────────────────────────

function InviteModal({ onClose, onInvited }: { onClose: () => void; onInvited: () => void }) {
  const [prenom,  setPrenom]  = useState('')
  const [nom,     setNom]     = useState('')
  const [email,   setEmail]   = useState('')
  const [role,    setRole]    = useState('support')
  const [sending, setSending] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSend = async () => {
    if (!prenom || !nom || !email) { setError('Tous les champs sont obligatoires.'); return }
    setSending(true); setError(null)
    try {
      await api.post(ENDPOINTS.equipe, { prenom, nom, email, role })
      setSuccess(true)
      // Le rafraîchissement de la liste déclenche un état "loading" au niveau
      // de la page parente, qui démonterait cette modale si on l'appelait ici —
      // on le reporte donc à la fermeture (bouton "Fermer" ci-dessous).
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de l'invitation.")
    } finally {
      setSending(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-xs px-3 py-2 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)', color: '#15803d', border: '1px solid rgba(34,197,94,0.2)' }}>
          Invitation envoyée à {email}.
        </div>
        <button className="btn-primary" onClick={() => { onInvited(); onClose() }}>Fermer</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Prénom" placeholder="Marie" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
        <Input label="Nom"    placeholder="Dupont" value={nom}   onChange={(e) => setNom(e.target.value)}   />
      </div>
      <Input
        label="Email professionnel"
        type="email"
        placeholder="marie.dupont@cubi.fr"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.6)', fontFamily: 'var(--font-sans)' }}>
          Rôle
        </label>
        <select className="cubi-input" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="super_admin">Super admin</option>
          <option value="support">Support</option>
          <option value="lecture">Lecture seule</option>
        </select>
      </div>

      {error && (
        <div className="text-xs px-3 py-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626' }}>
          {error}
        </div>
      )}
      <div className="text-xs p-3 rounded-xl" style={{ background: 'rgba(107,79,224,0.06)', color: 'rgba(30,15,70,0.55)' }}>
        Un email avec un lien d'activation sera envoyé pour définir le mot de passe. Valable 48 h.
      </div>
      <div className="flex gap-3 mt-1">
        <button className="btn-primary flex-1" onClick={handleSend} disabled={sending}>
          {sending ? 'Envoi…' : "Envoyer l'invitation"}
        </button>
        <button className="btn-action flex-1" onClick={onClose}>Annuler</button>
      </div>
    </div>
  )
}

// ── Edit role modal ───────────────────────────────────────────────────────────

function EditRoleModal({
  membre,
  onClose,
  onSaved,
}: {
  membre: MembreEquipe
  onClose: () => void
  onSaved: () => void
}) {
  const [role,    setRole]    = useState<RoleEquipe>(membre.role)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true); setError(null)
    try {
      await api.patch(ENDPOINTS.membreEquipe(membre.id), { role })
      onSaved()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de la modification.")
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm" style={{ color: 'rgba(30,15,70,0.6)' }}>
        {membre.prenom} {membre.nom} — <span style={{ color: 'rgba(30,15,70,0.4)' }}>{membre.email}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.6)', fontFamily: 'var(--font-sans)' }}>
          Rôle
        </label>
        <select className="cubi-input" value={role} onChange={(e) => setRole(e.target.value as RoleEquipe)}>
          <option value="super_admin">Super admin</option>
          <option value="support">Support</option>
          <option value="lecture">Lecture seule</option>
        </select>
      </div>
      {error && (
        <div className="text-xs px-3 py-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626' }}>
          {error}
        </div>
      )}
      <div className="flex gap-3 mt-1">
        <button className="btn-primary flex-1" onClick={handleSave} disabled={saving || role === membre.role}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        <button className="btn-action flex-1" onClick={onClose}>Annuler</button>
      </div>
    </div>
  )
}

// ── Delete confirmation modal ────────────────────────────────────────────────

function ConfirmDeleteModal({
  membre,
  onClose,
  onDeleted,
}: {
  membre: MembreEquipe
  onClose: () => void
  onDeleted: () => void
}) {
  const [deleting, setDeleting] = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const handleDelete = async () => {
    setDeleting(true); setError(null)
    try {
      await api.delete(ENDPOINTS.membreEquipe(membre.id))
      onDeleted()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la suppression.')
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm" style={{ color: 'rgba(30,15,70,0.7)' }}>
        Supprimer définitivement <strong>{membre.prenom} {membre.nom}</strong> ({membre.email}) de l'équipe Cubi ?
        Cette action est irréversible.
      </div>
      {error && (
        <div className="text-xs px-3 py-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626' }}>
          {error}
        </div>
      )}
      <div className="flex gap-3 mt-1">
        <button className="btn-danger flex-1" onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Suppression…' : 'Supprimer'}
        </button>
        <button className="btn-action flex-1" onClick={onClose}>Annuler</button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function Equipe() {
  const { user } = useAuth()
  const canManage = user?.role === 'super_admin'

  const [showInvite,     setShowInvite]     = useState(false)
  const [openMenuId,     setOpenMenuId]     = useState<string | null>(null)
  const [editingRole,    setEditingRole]    = useState<MembreEquipe | null>(null)
  const [deletingMembre, setDeletingMembre] = useState<MembreEquipe | null>(null)
  const [roleFilter,     setRoleFilter]     = useState<'all' | RoleEquipe>('all')

  const { data: equipe, loading, error, refetch } = useApi<MembreEquipe[]>(
    () => api.get<MembreEquipe[]>(ENDPOINTS.equipe),
    []
  )
  const membres = equipe ?? []
  const filtered = membres.filter((m) => roleFilter === 'all' || m.role === roleFilter)

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-7 h-7 rounded-full border-2 animate-spin"
        style={{ borderColor: 'rgba(107,79,224,0.2)', borderTopColor: '#6B4FE0' }} />
    </div>
  )
  if (error) return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>Erreur de chargement</p>
      <p className="text-xs" style={{ color: 'rgba(30,15,70,0.5)' }}>{error}</p>
      <button onClick={refetch} className="text-xs font-semibold px-4 py-2 rounded-xl border-none cursor-pointer"
        style={{ background: 'rgba(107,79,224,0.1)', color: '#6B4FE0' }}>Réessayer</button>
    </div>
  )

  return (
    <div onClick={() => setOpenMenuId(null)}>
      <PageHeader
        title="Équipe CUBI"
        subtitle="Membres internes et leurs niveaux d'accès"
        actions={
          <button
            className="btn-primary !w-auto flex items-center gap-1.5 text-sm !py-2.5 !px-4"
            onClick={(e) => { e.stopPropagation(); setShowInvite(true) }}
          >
            <UserPlus size={15} />
            Inviter un membre
          </button>
        }
      />

      {/* Role filter */}
      <FilterPills
        options={[
          { value: 'all',          label: 'Tous',            count: membres.length },
          { value: 'super_admin',  label: ROLE_META.super_admin.label, count: membres.filter((m) => m.role === 'super_admin').length },
          { value: 'support',      label: ROLE_META.support.label,     count: membres.filter((m) => m.role === 'support').length },
          { value: 'lecture',      label: ROLE_META.lecture.label,     count: membres.filter((m) => m.role === 'lecture').length },
        ]}
        value={roleFilter}
        onChange={(v) => setRoleFilter(v as 'all' | RoleEquipe)}
      />

      {/* Member list */}
      <div className="flex flex-col gap-2.5 mt-5" onClick={(e) => e.stopPropagation()}>
        {filtered.map((m) => (
          <MembreRow
            key={m.id}
            membre={m}
            openMenuId={openMenuId}
            onToggleMenu={setOpenMenuId}
            onDelete={setDeletingMembre}
            onEditRole={setEditingRole}
            canManage={canManage}
          />
        ))}
        {filtered.length === 0 && (
          <div
            className="rounded-2xl py-12 text-center text-sm"
            style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(107,79,224,0.08)', color: 'rgba(30,15,70,0.35)' }}
          >
            Aucun membre dans cette catégorie.
          </div>
        )}
      </div>

      {/* Invite modal */}
      <Modal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        title="Inviter un membre"
        dismissable={false}
      >
        <InviteModal onClose={() => setShowInvite(false)} onInvited={refetch} />
      </Modal>

      {/* Edit role modal */}
      <Modal
        isOpen={!!editingRole}
        onClose={() => setEditingRole(null)}
        title="Modifier le rôle"
        dismissable={false}
      >
        {editingRole && (
          <EditRoleModal membre={editingRole} onClose={() => setEditingRole(null)} onSaved={refetch} />
        )}
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deletingMembre}
        onClose={() => setDeletingMembre(null)}
        title="Supprimer ce membre"
        dismissable={false}
      >
        {deletingMembre && (
          <ConfirmDeleteModal membre={deletingMembre} onClose={() => setDeletingMembre(null)} onDeleted={refetch} />
        )}
      </Modal>
    </div>
  )
}
