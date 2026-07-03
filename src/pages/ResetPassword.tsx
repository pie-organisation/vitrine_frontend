import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { DotGridBackground } from '../components/ui/DotGridBackground'
import { DecorativeOrbs }   from '../components/ui/DecorativeOrbs'
import { Logo }             from '../components/ui/Logo'
import { Input }            from '../components/ui/Input'
import { Button }           from '../components/ui/Button'
import { Card }             from '../components/ui/Card'
import { api, ENDPOINTS }   from '../api/client'

export function ResetPassword() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [token,    setToken]    = useState(params.get('token') ?? '')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [success,  setSuccess]  = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (!token.trim()) {
      setError('Token manquant. Utilisez le lien reçu par email.')
      return
    }

    setLoading(true)
    try {
      await api.post(ENDPOINTS.motDePasseReset, {
        token_temporaire:       token.trim(),
        nouveau_mot_de_passe:   password,
      })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lien invalide ou expiré.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DotGridBackground />
      <DecorativeOrbs />

      <header className="relative z-10 px-8 py-6">
        <Logo />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <Card className="w-full max-w-md">

          {success ? (
            <div className="text-center py-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(34,197,94,0.1)' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="font-display font-bold text-xl mb-2" style={{ color: '#1a1040' }}>
                Mot de passe défini !
              </h2>
              <p className="text-sm" style={{ color: 'rgba(30,15,70,0.5)' }}>
                Redirection vers la connexion dans 3 secondes…
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="font-display font-extrabold text-3xl mb-2" style={{ color: '#1a1040', letterSpacing: '-1px' }}>
                  Définir mon mot de passe
                </h1>
                <p className="text-sm" style={{ color: 'rgba(30,15,70,0.5)' }}>
                  Créez votre mot de passe définitif pour accéder à CUBI.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Token — pré-rempli si venu par email link, sinon saisie manuelle */}
                {!params.get('token') && (
                  <Input
                    label="Token reçu par email"
                    placeholder="Collez le token ici…"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                  />
                )}

                <Input
                  label="Nouveau mot de passe"
                  type="password"
                  placeholder="8 caractères minimum"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Input
                  label="Confirmer le mot de passe"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />

                {error && (
                  <div
                    className="rounded-xl px-4 py-3 text-sm"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626' }}
                  >
                    {error}
                  </div>
                )}

                <div className="mt-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Enregistrement…' : 'Définir mon mot de passe'}
                  </Button>
                </div>
              </form>

              <p className="mt-6 text-center text-sm" style={{ color: 'rgba(30,15,70,0.45)' }}>
                <Link to="/login" className="font-semibold hover:opacity-80" style={{ color: '#6B4FE0' }}>
                  ← Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </Card>
      </main>
    </div>
  )
}
