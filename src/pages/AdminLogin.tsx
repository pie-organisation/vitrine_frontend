import { useId, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Logo }    from '../components/ui/Logo'
import { Button }  from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'

function DarkDotGrid() {
  return (
    <div className="fixed inset-0 -z-20 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(circle at 50% 0%, #2a1968 0%, #1a1040 55%, #100a2b 100%)' }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(192,132,252,.4) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
    </div>
  )
}

function DarkInput({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold" style={{ color: 'rgba(232,225,255,0.65)' }}>
        {label}
      </label>
      <input
        id={id}
        className="admin-login-input"
        {...props}
      />
    </div>
  )
}

export function AdminLogin() {
  const { login, isLoading, loginError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname

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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <DarkDotGrid />

      <div
        className="fixed -top-40 -left-40 w-[560px] h-[560px] rounded-full pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(139,111,240,.35), transparent 70%)' }}
      />
      <div
        className="fixed -bottom-32 -right-32 w-[480px] h-[480px] rounded-full pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(232,121,249,.28), transparent 70%)' }}
      />

      <header className="relative z-10 px-8 py-6">
        <Logo />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div
          className="w-full max-w-md rounded-2xl p-8 sm:p-10"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid rgba(139,111,240,0.3)',
            boxShadow: '0 8px 48px rgba(107,79,224,0.35), 0 0 0 1px rgba(255,255,255,0.03) inset',
          }}
        >
          <div className="mb-8">
            <span
              className="inline-block text-[11px] font-bold uppercase tracking-widest mb-3 px-2.5 py-1 rounded-full"
              style={{ color: '#C084FC', background: 'rgba(192,132,252,0.12)', border: '1px solid rgba(192,132,252,0.3)' }}
            >
              Espace Cubi
            </span>
            <h1
              className="font-display font-extrabold text-4xl mb-2"
              style={{ color: '#fff', letterSpacing: '-1.5px' }}
            >
              Connexion admin
            </h1>
            <p className="text-sm" style={{ color: 'rgba(232,225,255,0.55)' }}>
              Réservé à l'équipe Cubi
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <DarkInput
              label="Email"
              name="email"
              type="email"
              placeholder="prenom.nom@cubi.fr"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div>
              <DarkInput
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
                  style={{ color: '#C084FC' }}
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            {loginError && (
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
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
        </div>
      </main>
    </div>
  )
}
