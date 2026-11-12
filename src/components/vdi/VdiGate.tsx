import { useState } from 'react'
import { MonitorOff, MonitorCog, LogIn } from 'lucide-react'
import { Spinner, ErrorState, Notice } from '../ui/AsyncState'
import { useVdi } from '../../contexts/VdiContext'

/** Module non branché, connexion à l'API Go, chargement ou erreur : sinon affiche la page. */
export function VdiGate({ children }: { children: React.ReactNode }) {
  const { configured, connected, loading, error, refresh, orgId } = useVdi()

  if (!configured) return <VdiNotConnected />
  if (!connected) return <VdiLogin />
  if (loading && !orgId) return <Spinner label="Chargement des postes de travail…" />
  if (error && !orgId) return <ErrorState message={error} onRetry={() => void refresh()} />
  return <>{children}</>
}

export function VdiNotConnected({ compact }: { compact?: boolean }) {
  return (
    <div className={`section-card flex flex-col items-center text-center gap-3 ${compact ? 'py-6' : 'py-14'}`}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, rgba(107,79,224,0.1), rgba(232,121,249,0.1))', color: '#6B4FE0' }}>
        <MonitorOff size={22} />
      </div>
      <p className="font-display font-bold text-base" style={{ color: '#1a1040' }}>Postes de travail bientôt disponibles</p>
      <p className="text-sm max-w-md" style={{ color: 'rgba(30,15,70,0.65)' }}>
        Groupes, machines virtuelles et logiciels apparaîtront ici dès que le service sera relié à votre espace.
      </p>
    </div>
  )
}

/**
 * Connexion au service des postes de travail (même compte que la console Site-Pie).
 * Le jeton est gardé à part de la session Cubi et oublié à la déconnexion.
 */
export function VdiLogin({ compact }: { compact?: boolean }) {
  const { connect } = useVdi()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [busy,     setBusy]     = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await connect(email.trim(), password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible.')
      setBusy(false)
    }
  }

  return (
    <div className={`section-card ${compact ? '' : 'max-w-md mx-auto mt-6'}`}>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #6B4FE0, #9333EA)', color: '#fff' }}>
          <MonitorCog size={18} />
        </div>
        <div>
          <p className="font-display font-bold text-base" style={{ color: '#1a1040' }}>Connexion aux postes de travail</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(30,15,70,0.65)' }}>
            Utilisez votre compte de gestion des machines (le même que la console d'administration Cuby).
          </p>
        </div>
      </div>
      <form onSubmit={submit} className={compact ? 'grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end' : 'flex flex-col gap-3'}>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.7)' }}>E-mail</span>
          <input className="cubi-input" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.7)' }}>Mot de passe</span>
          <input className="cubi-input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button type="submit" disabled={busy}
          className={`btn-primary text-sm !py-2.5 flex items-center justify-center gap-1.5 ${compact ? '!w-auto !px-5' : ''}`}>
          <LogIn size={15} /> {busy ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
      {error && <div className="mt-3"><Notice tone="error">{error}</Notice></div>}
    </div>
  )
}
