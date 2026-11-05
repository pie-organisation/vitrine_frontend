import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { Logo }   from '../components/ui/Logo'
import { Button } from '../components/ui/Button'
import { DarkDotGrid, DarkInput } from './AdminLogin'

// Mot de passe oublié pour l'équipe Cubi (table utilisateur_cubi),
// distinct de la page client /mot-de-passe-oublie (table utilisateur).
export function AdminMotDePasseOublie() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))
    console.log('admin-forgot-password:', data)
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
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: 'rgba(192,132,252,0.12)', border: '1px solid rgba(192,132,252,0.3)' }}
          >
            <Mail size={22} style={{ color: '#C084FC' }} />
          </div>

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
              Mot de passe oublié
            </h1>
            <p className="text-sm" style={{ color: 'rgba(232,225,255,0.55)' }}>
              Renseignez votre e-mail Cubi et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <DarkInput
              label="Email"
              name="email"
              type="email"
              placeholder="prenom.nom@cubi.fr"
              autoComplete="email"
              required
            />
            <div className="mt-2">
              <Button type="submit">Envoyer le lien de réinitialisation</Button>
            </div>
          </form>

          <p className="mt-7 text-center text-sm">
            <Link
              to="/admin/login"
              className="font-semibold transition-opacity hover:opacity-80"
              style={{ color: '#C084FC' }}
            >
              ← Retour à la connexion admin
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
