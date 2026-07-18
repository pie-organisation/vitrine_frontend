import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, User } from 'lucide-react'
import { Logo } from '../ui/Logo'
import { Button } from '../ui/Button'

const NAV_LINKS = [
  { to: '/', label: 'Accueil' },
  { to: '/offres', label: 'Offres' },
  { to: '/comment-ca-marche', label: 'Comment ça marche' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
]

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-3 z-40 overflow-x-clip">
      <div className="container-page">
        {/* The whole header is one floating pill — logo, nav and CTA share the same background */}
        <div className="header-pill flex items-center justify-between h-[64px] px-3 sm:px-4">
          <Link to="/" className="no-underline shrink-0 pl-2">
            <Logo size="sm" />
          </Link>

          {/* Desktop nav — only shown once there's enough room for every label */}
          <nav className="hidden lg:flex nav-pill-group">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => `nav-pill-item ${isActive ? 'active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:block shrink-0">
            <Link to="/login" className="no-underline">
              <Button fullWidth={false}>Se connecter</Button>
            </Link>
          </div>

          {/* Compact mobile/tablet bar: menu toggle + direct login icon (never wraps, never overflows) */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            <Link
              to="/login"
              aria-label="Se connecter"
              className="w-9 h-9 flex items-center justify-center rounded-full no-underline shrink-0"
              style={{ background: 'color-mix(in srgb, var(--color-cubi-violet) 8%, transparent)', color: 'var(--color-cubi-violet)' }}
            >
              <User size={16} />
            </Link>
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full border-none cursor-pointer shrink-0"
              style={{ background: 'color-mix(in srgb, var(--color-cubi-violet) 8%, transparent)', color: 'var(--color-cubi-violet)' }}
              onClick={() => setOpen((v) => !v)}
              aria-label="Ouvrir le menu"
            >
              {open ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>

        {/* Mobile/tablet nav dropdown — its own pill, right below the header */}
        {open && (
          <nav className="header-pill lg:hidden flex flex-col gap-1 p-3 mt-2">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setOpen(false)}
                className="px-3.5 py-2.5 rounded-full text-sm font-semibold no-underline"
                style={({ isActive }) => ({
                  color: isActive ? '#fff' : 'color-mix(in srgb, var(--color-cubi-ink) 65%, transparent)',
                  background: isActive ? 'linear-gradient(135deg, var(--color-cubi-ink), #3a2170)' : 'transparent',
                  fontFamily: 'var(--font-sans)',
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
