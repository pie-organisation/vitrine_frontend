import { Link } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import { DotGridBackground } from '../components/ui/DotGridBackground'
import { DecorativeOrbs }    from '../components/ui/DecorativeOrbs'
import { Logo }              from '../components/ui/Logo'
import { Input }             from '../components/ui/Input'
import { Button }            from '../components/ui/Button'
import { Card }              from '../components/ui/Card'

export function ReinitialiserMotDePasse() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))
    console.log('reset-password:', data)
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
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: 'linear-gradient(135deg, rgba(107,79,224,0.12), rgba(232,121,249,0.12))' }}
          >
            <KeyRound size={22} style={{ color: '#6B4FE0' }} />
          </div>

          {/* Title */}
          <div className="mb-8">
            <h1
              className="font-display font-extrabold text-4xl mb-2"
              style={{ color: '#1a1040', letterSpacing: '-1.5px' }}
            >
              Nouveau mot de passe
            </h1>
            <p className="text-sm" style={{ color: 'rgba(30,15,70,0.5)' }}>
              Choisissez un mot de passe fort d'au moins 8 caractères.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Nouveau mot de passe"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <Input
              label="Confirmer le mot de passe"
              name="password_confirm"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
            />
            <div className="mt-2">
              <Button type="submit">Mettre à jour le mot de passe</Button>
            </div>
          </form>

          <p className="mt-7 text-center text-sm" style={{ color: 'rgba(30,15,70,0.45)' }}>
            <Link
              to="/login"
              className="font-semibold transition-opacity hover:opacity-80"
              style={{ color: '#6B4FE0' }}
            >
              ← Retour à la connexion
            </Link>
          </p>
        </Card>
      </main>
    </div>
  )
}
