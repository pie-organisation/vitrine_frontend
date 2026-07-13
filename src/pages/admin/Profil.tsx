import { useState } from 'react'
import { Camera } from 'lucide-react'
import { PageHeader }  from '../../components/ui/PageHeader'
import { SectionCard } from '../../components/ui/SectionCard'
import { Input }       from '../../components/ui/Input'
import { useAuth }     from '../../contexts/AuthContext'
import { api, ENDPOINTS } from '../../api/client'

// ── Inline Switch ─────────────────────────────────────────────────────────────

function Switch({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id?: string }) {
  return (
    <button
      role="switch"
      id={id}
      aria-checked={checked}
      className="relative inline-flex items-center rounded-full border-none cursor-pointer transition-all duration-200 shrink-0"
      style={{
        width: '36px',
        height: '20px',
        background: checked ? 'linear-gradient(135deg, #6B4FE0, #C084FC)' : 'rgba(107,79,224,0.15)',
      }}
      onClick={() => onChange(!checked)}
    >
      <span
        className="absolute rounded-full bg-white transition-all duration-200"
        style={{
          width: '14px',
          height: '14px',
          left: checked ? '19px' : '3px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        }}
      />
    </button>
  )
}

// ── Toggle row ────────────────────────────────────────────────────────────────

function ToggleRow({ id, label, description, checked, onChange }: {
  id: string
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5" style={{ borderBottom: '1px solid rgba(107,79,224,0.06)' }}>
      <div>
        <label
          htmlFor={id}
          className="text-sm font-semibold cursor-pointer"
          style={{ color: '#1a1040', fontFamily: 'var(--font-sans)', display: 'block' }}
        >
          {label}
        </label>
        <span className="text-xs" style={{ color: 'rgba(30,15,70,0.45)' }}>{description}</span>
      </div>
      <Switch id={id} checked={checked} onChange={onChange} />
    </div>
  )
}

// ── Role labels ───────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super admin',
  support:     'Support',
  lecture:     'Lecture seule',
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function Profil() {
  const { user, updateUser } = useAuth()
  const admin = user ?? { prenom: '', nom: '', email: '', role: '', initials: '' }
  const roleLabel = ROLE_LABELS[admin.role] ?? admin.role

  // Personal info form
  const [prenom, setPrenom] = useState(admin.prenom)
  const [nom,    setNom]    = useState(admin.nom)
  const [email,  setEmail]  = useState(admin.email)
  const [savingInfo, setSavingInfo] = useState(false)
  const [infoError,  setInfoError]  = useState<string | null>(null)
  const [infoSaved,  setInfoSaved]  = useState(false)

  const handleSaveInfo = async () => {
    setSavingInfo(true); setInfoError(null); setInfoSaved(false)
    try {
      await api.patch(ENDPOINTS.me, { prenom, nom, email })
      updateUser({ prenom, nom, email })
      setInfoSaved(true)
    } catch (e) {
      setInfoError(e instanceof Error ? e.message : 'Erreur lors de la sauvegarde.')
    } finally {
      setSavingInfo(false)
    }
  }

  // Password form
  const [currentPw, setCurrentPw] = useState('')
  const [newPw,     setNewPw]     = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [savingPw, setSavingPw] = useState(false)
  const [pwError,  setPwError]  = useState<string | null>(null)
  const [pwSaved,  setPwSaved]  = useState(false)

  const handleChangePassword = async () => {
    setPwError(null); setPwSaved(false)
    if (newPw.length < 8) { setPwError('Le nouveau mot de passe doit contenir au moins 8 caractères.'); return }
    if (newPw !== confirmPw) { setPwError('Les mots de passe ne correspondent pas.'); return }
    setSavingPw(true)
    try {
      await api.post(ENDPOINTS.mePassword, {
        mot_de_passe_actuel: currentPw,
        nouveau_mot_de_passe: newPw,
      })
      setPwSaved(true)
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (e) {
      setPwError(e instanceof Error ? e.message : 'Erreur lors du changement de mot de passe.')
    } finally {
      setSavingPw(false)
    }
  }

  // Security toggles
  const [twoFA,      setTwoFA]      = useState(false)

  // Notification toggles
  const [notifDemande,  setNotifDemande]  = useState(true)
  const [notifImpaye,   setNotifImpaye]   = useState(true)
  const [notifAnomalie, setNotifAnomalie] = useState(true)
  const [notifRapport,  setNotifRapport]  = useState(false)

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Mon profil"
        subtitle="Paramètres de votre compte administrateur CUBI"
      />

      {/* ── Informations personnelles ────────────────────────────────────────── */}
      <SectionCard title="Informations personnelles" className="mb-5">
        {/* Avatar */}
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center font-display font-extrabold text-xl"
              style={{ background: 'linear-gradient(135deg, #6B4FE0, #C084FC)', color: '#fff' }}
            >
              {admin.initials}
            </div>
            <button
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-none cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #6B4FE0, #C084FC)', color: '#fff' }}
              onClick={() => console.log('upload-avatar')}
              title="Changer l'avatar"
            >
              <Camera size={11} />
            </button>
          </div>
          <div>
            <div className="font-display font-bold text-sm" style={{ color: '#1a1040' }}>
              {admin.prenom} {admin.nom}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(30,15,70,0.45)' }}>{roleLabel}</div>
            <button
              className="text-xs mt-2 font-semibold border-none bg-transparent cursor-pointer p-0"
              style={{ color: '#6B4FE0', fontFamily: 'var(--font-sans)' }}
              onClick={() => console.log('upload-avatar')}
            >
              Changer l'avatar
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
          <Input label="Nom"    value={nom}    onChange={(e) => setNom(e.target.value)}    />
          <div className="sm:col-span-2">
            <Input label="Adresse e-mail" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </div>
          <div className="sm:col-span-2">
            <Input label="Rôle" defaultValue={roleLabel} disabled />
          </div>
        </div>

        {infoError && (
          <div className="text-xs px-3 py-2 rounded-xl mt-4" style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626' }}>
            {infoError}
          </div>
        )}
        {infoSaved && (
          <div className="text-xs px-3 py-2 rounded-xl mt-4" style={{ background: 'rgba(34,197,94,0.08)', color: '#15803d' }}>
            Informations mises à jour.
          </div>
        )}

        <div className="flex justify-end mt-5">
          <button
            className="btn-primary !w-auto !py-2.5 !px-5 text-sm"
            onClick={handleSaveInfo}
            disabled={savingInfo}
          >
            {savingInfo ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
        </div>
      </SectionCard>

      {/* ── Sécurité ─────────────────────────────────────────────────────────── */}
      <SectionCard title="Sécurité" className="mb-5">
        <div className="flex flex-col gap-4 mb-5">
          <Input label="Mot de passe actuel"       type="password" placeholder="••••••••" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
          <Input label="Nouveau mot de passe"      type="password" placeholder="••••••••" value={newPw}     onChange={(e) => setNewPw(e.target.value)}     />
          <Input label="Confirmer le mot de passe" type="password" placeholder="••••••••" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
        </div>

        {pwError && (
          <div className="text-xs px-3 py-2 rounded-xl mb-4" style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626' }}>
            {pwError}
          </div>
        )}
        {pwSaved && (
          <div className="text-xs px-3 py-2 rounded-xl mb-4" style={{ background: 'rgba(34,197,94,0.08)', color: '#15803d' }}>
            Mot de passe mis à jour.
          </div>
        )}

        <div className="flex justify-end mb-6">
          <button
            className="btn-action !w-auto !py-2.5 !px-5 text-sm"
            onClick={handleChangePassword}
            disabled={savingPw || !currentPw || !newPw || !confirmPw}
          >
            {savingPw ? 'Modification…' : 'Modifier le mot de passe'}
          </button>
        </div>

        <div
          className="flex items-center justify-between py-3.5 px-4 rounded-xl"
          style={{ background: 'rgba(107,79,224,0.04)', border: '1px solid rgba(107,79,224,0.1)' }}
        >
          <div>
            <div className="text-sm font-semibold" style={{ color: '#1a1040' }}>
              Authentification à deux facteurs (2FA)
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(30,15,70,0.45)' }}>
              {twoFA
                ? 'Activée — votre compte est protégé par une 2FA'
                : "Désactivée — protégez votre compte avec une application d'authentification"}
            </div>
          </div>
          <Switch checked={twoFA} onChange={setTwoFA} />
        </div>
      </SectionCard>

      {/* ── Notifications ────────────────────────────────────────────────────── */}
      <SectionCard title="Notifications par e-mail">
        <div className="-mb-1">
          <ToggleRow
            id="notif-demande"
            label="Nouvelle demande d'inscription"
            description="Recevoir un e-mail à chaque nouvelle demande en attente"
            checked={notifDemande}
            onChange={setNotifDemande}
          />
          <ToggleRow
            id="notif-impaye"
            label="Facture impayée"
            description="Alerte lorsqu'une organisation a une facture en retard"
            checked={notifImpaye}
            onChange={setNotifImpaye}
          />
          <ToggleRow
            id="notif-anomalie"
            label="Anomalie de session"
            description="Notification en cas de comportement suspect détecté"
            checked={notifAnomalie}
            onChange={setNotifAnomalie}
          />
          <div className="flex items-center justify-between gap-4 py-3.5">
            <div>
              <label
                htmlFor="notif-rapport"
                className="text-sm font-semibold cursor-pointer"
                style={{ color: '#1a1040', fontFamily: 'var(--font-sans)', display: 'block' }}
              >
                Rapport mensuel
              </label>
              <span className="text-xs" style={{ color: 'rgba(30,15,70,0.45)' }}>
                Résumé mensuel automatique des métriques clés
              </span>
            </div>
            <Switch id="notif-rapport" checked={notifRapport} onChange={setNotifRapport} />
          </div>
        </div>

        <div className="flex justify-end mt-4 pt-4" style={{ borderTop: '1px solid rgba(107,79,224,0.06)' }}>
          <button
            className="btn-primary !w-auto !py-2.5 !px-5 text-sm"
            onClick={() => console.log('save-notifications', { notifDemande, notifImpaye, notifAnomalie, notifRapport })}
          >
            Sauvegarder les préférences
          </button>
        </div>
      </SectionCard>
    </div>
  )
}
