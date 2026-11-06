import { Link } from 'react-router-dom'
import { DotGridBackground } from '../components/ui/DotGridBackground'
import { DecorativeOrbs }    from '../components/ui/DecorativeOrbs'
import { Logo }              from '../components/ui/Logo'

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <DotGridBackground grid/>
      <DecorativeOrbs />

      <header className="relative z-10 px-8 py-6">
        <Logo />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center relative z-10">
        {/* 404 number */}
        <div
          className="font-display font-extrabold leading-none mb-4 select-none"
          style={{
            fontSize: 'clamp(80px, 18vw, 160px)',
            background: 'linear-gradient(135deg, #6B4FE0 0%, #9333EA 55%, #B42FC4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          404
        </div>

        {/* Message */}
        <h1
          className="font-display font-extrabold text-3xl mb-3"
          style={{ color: '#1a1040', letterSpacing: '-1px' }}
        >
          Page introuvable
        </h1>
        <p className="text-sm mb-8 max-w-xs" style={{ color: 'rgba(30,15,70,0.7)' }}>
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            to="/"
            className="no-underline font-semibold text-sm px-6 py-3 rounded-xl text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #6B4FE0, #9333EA)' }}
          >
            Retour à l'accueil
          </Link>
          <Link
            to="/login"
            className="no-underline font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
            style={{
              background: 'rgba(107,79,224,0.07)',
              color: '#6B4FE0',
              border: '1px solid rgba(107,79,224,0.35)',
            }}
          >
            Page de connexion
          </Link>
        </div>
      </main>
    </div>
  )
}
