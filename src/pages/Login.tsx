import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { DotGridBackground } from '../components/ui/DotGridBackground'
import { DecorativeOrbs }   from '../components/ui/DecorativeOrbs'
import { Logo }             from '../components/ui/Logo'
import { Input }            from '../components/ui/Input'
import { Button }           from '../components/ui/Button'
import { Card }             from '../components/ui/Card'
import { useAuth }          from '../contexts/AuthContext'

export function Login() {
  const { login, isLoading, loginError } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = (location.state as { from?: { pathname: string } })?.from?.pathname

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const user = await login(email, password)
      navigate(from ?? (user.type === 'cubi' ? '/admin' : '/school'), { replace: true })
    } catch {
      // loginError is set in context
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DotGridBackground grid/>
      <DecorativeOrbs />

      <header className="relative z-10 px-8 py-6">
        <Logo />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <Card className="w-full max-w-md">
          <div className="mb-8">
            <h1
              className="font-display font-extrabold text-4xl mb-2"
              style={{ color: '#1a1040', letterSpacing: '-1.5px' }}
            >
              Connexion
            </h1>
            <p className="text-sm" style={{ color: 'rgba(30,15,70,0.5)' }}>
              Accédez à votre espace CUBI
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="votre@email.fr"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div>
              <Input
                label="Mot de passe"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="text-right mt-1.5">
                <Link
                  to="/mot-de-passe-oublie"
                  className="text-xs font-semibold no-underline transition-opacity hover:opacity-80"
                  style={{ color: '#6B4FE0' }}
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            {loginError && (
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626' }}
              >
                {loginError}
              </div>
            )}

            <div className="mt-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Connexion…' : 'Se connecter'}
              </Button>
            </div>
          </form>

          <p className="mt-7 text-center text-sm" style={{ color: 'rgba(30,15,70,0.45)' }}>
            Pas encore de compte ?
            <br />
            <Link
              to="/inscription"
              className="font-semibold transition-opacity hover:opacity-80"
              style={{ color: '#6B4FE0' }}
            >
              Faire une demande d'inscription
            </Link>
          </p>
        </Card>
      </main>
    </div>
  )
}
