import { useState } from 'react'
import { UserPlus, MoreVertical, Shield, Headphones, Eye } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Badge }      from '../../components/ui/Badge'
import { Modal }      from '../../components/ui/Modal'
import { Input }      from '../../components/ui/Input'
import { useApi }        from '../../hooks/useApi'
import { api, ENDPOINTS } from '../../api/client'
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
  onRevoke,
}: {
  membre: MembreEquipe
  openMenuId: string | null
  onToggleMenu: (id: string | null) => void
  onRevoke: (id: string) => void
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

          {/* Kebab menu */}
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
                  onClick={() => { api.patch(ENDPOINTS.membreEquipe(membre.id), { action: 'modify-role' }); onToggleMenu(null) }}
                >
                  Modifier le rôle
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-xs font-medium border-none cursor-pointer"
                  style={{ background: 'transparent', color: '#dc2626', fontFamily: 'var(--font-sans)' }}
                  onClick={() => { onRevoke(membre.id); onToggleMenu(null) }}
                >
                  Révoquer l'accès
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Invite modal ──────────────────────────────────────────────────────────────

function InviteModal({ onClose, onInvited }: { onClose: () => void; onInvited: () => void }) {
  const [prenom,    setPrenom]    = useState('')
  const [nom,       setNom]       = useState('')
  const [email,     setEmail]     = useState('')
  const [role,      setRole]      = useState('admin')
  const [sending,   setSending]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [resetLink, setResetLink] = useState<string | null>(null)

  const handleSend = async () => {
    if (!prenom || !nom || !email) { setError('Tous les champs sont obligatoires.'); return }
    setSending(true); setError(null)
    try {
      const res = await api.post<{ utilisateur_id: string; reset_token?: string; reset_link: string }>(
        ENDPOINTS.adminUsers, { prenom, nom, email, role }
      )
      // Si email échoué → affiche le lien directement
      if (res.reset_token) {
        setResetLink(res.reset_link)
      } else {
        onInvited(); onClose()
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de l'invitation.")
    } finally {
      setSending(false)
    }
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
          <option value="admin">Admin</option>
          <option value="enseignant">Enseignant</option>
          <option value="eleve">Élève</option>
        </select>
      </div>

      {resetLink ? (
        /* Email non reçu → affiche le lien ici directement */
        <div className="flex flex-col gap-3">
          <div className="text-xs px-3 py-2 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', color: '#b45309', border: '1px solid rgba(245,158,11,0.2)' }}>
            Email non envoyé (SMTP non configuré). Transmets ce lien manuellement à l'utilisateur :
          </div>
          <div
            className="text-xs break-all p-3 rounded-xl font-mono select-all"
            style={{ background: 'rgba(107,79,224,0.06)', color: '#6B4FE0', border: '1px solid rgba(107,79,224,0.15)' }}
          >
            {resetLink}
          </div>
          <button className="btn-primary" onClick={() => { navigator.clipboard.writeText(resetLink); onInvited(); onClose() }}>
            Copier le lien et fermer
          </button>
        </div>
      ) : (
        <>
          {error && (
            <div className="text-xs px-3 py-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626' }}>
              {error}
            </div>
          )}
          <div className="text-xs p-3 rounded-xl" style={{ background: 'rgba(107,79,224,0.06)', color: 'rgba(30,15,70,0.55)' }}>
            Un email avec mot de passe temporaire + lien d'activation sera envoyé. Valable 48 h.
          </div>
          <div className="flex gap-3 mt-1">
            <button className="btn-primary flex-1" onClick={handleSend} disabled={sending}>
              {sending ? 'Envoi…' : "Envoyer l'invitation"}
            </button>
            <button className="btn-action flex-1" onClick={onClose}>Annuler</button>
          </div>
        </>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function Equipe() {
  const [showInvite, setShowInvite] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const { data: equipe, loading, error, refetch } = useApi<MembreEquipe[]>(
    () => api.get<MembreEquipe[]>(ENDPOINTS.equipe),
    []
  )
  const membres = equipe ?? []

  const handleRevoke = (id: string) => {
    api.delete(ENDPOINTS.membreEquipe(id)).then(refetch)
  }

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

      {/* Role summary */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {(['super_admin', 'support', 'lecture'] as RoleEquipe[]).map((r) => {
          const count = membres.filter((m) => m.role === r).length
          const meta  = ROLE_META[r]
          return (
            <div
              key={r}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm"
              style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(107,79,224,0.1)' }}
            >
              <Badge variant={meta.variant}>{meta.label}</Badge>
              <span className="font-bold text-sm" style={{ color: '#1a1040' }}>{count}</span>
            </div>
          )
        })}
      </div>

      {/* Member list */}
      <div className="flex flex-col gap-2.5" onClick={(e) => e.stopPropagation()}>
        {membres.map((m) => (
          <MembreRow
            key={m.id}
            membre={m}
            openMenuId={openMenuId}
            onToggleMenu={setOpenMenuId}
            onRevoke={handleRevoke}
          />
        ))}
      </div>

      {/* Invite modal */}
      <Modal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        title="Inviter un membre"
      >
        <InviteModal onClose={() => setShowInvite(false)} onInvited={refetch} />
      </Modal>
    </div>
  )
}
