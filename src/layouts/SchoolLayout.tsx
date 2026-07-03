import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Receipt, Phone, LogOut, Menu, X, type LucideIcon } from 'lucide-react'
import { Logo } from '../components/ui/Logo'
import { useAuth } from '../contexts/AuthContext'
import { api, ENDPOINTS } from '../api/client'

interface SchoolOrgMin { nom: string; plan: string }

const NAV: { to: string; icon: LucideIcon; label: string }[] = [
  { to: '/school/dashboard',   icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/school/comptes',     icon: Users,           label: 'Comptes'         },
  { to: '/school/facturation', icon: Receipt,         label: 'Facturation'     },
  { to: '/school/contact',     icon: Phone,           label: 'Contact'         },
]

function NavItem({ to, icon: Icon, label }: { to: string; icon: LucideIcon; label: string }) {
  const { pathname } = useLocation()
  const active = pathname.startsWith(to)
  return (
    <Link to={to} className="block no-underline">
      <div
        className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-all duration-200"
        style={{
          background: active ? 'rgba(107,79,224,0.08)' : 'transparent',
          color:      active ? '#6B4FE0' : 'rgba(30,15,70,0.5)',
        }}
      >
        <Icon size={17} strokeWidth={active ? 2.2 : 1.8} className="shrink-0" />
        <span className="text-sm" style={{ fontWeight: active ? 600 : 500, fontFamily: 'var(--font-sans)' }}>
          {label}
        </span>
        {active && <div className="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#6B4FE0' }} />}
      </div>
    </Link>
  )
}

function Sidebar({ org, isMobile, onClose }: { org: SchoolOrgMin | null; isMobile?: boolean; onClose?: () => void }) {
  const { pathname } = useLocation()
  const { logout }   = useAuth()
  return (
    <div
      className="w-56 h-full flex flex-col py-5 px-4 shrink-0"
      style={{ background: '#fff', borderRight: '1px solid rgba(107,79,224,0.1)' }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between mb-6 px-1">
        <Logo />
        {isMobile && (
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg border-none cursor-pointer"
            style={{ background: 'rgba(107,79,224,0.07)', color: 'rgba(30,15,70,0.5)' }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {NAV.map((n) => <NavItem key={n.to} {...n} />)}
      </nav>

      {/* Org info + logout */}
      <div className="pt-3 mt-2 flex flex-col gap-1" style={{ borderTop: '1px solid rgba(107,79,224,0.08)' }}>
        <div className="px-3 py-2">
          <div className="text-xs font-bold truncate" style={{ color: '#1a1040' }}>{org?.nom ?? '…'}</div>
          <div className="text-[10px] mt-0.5" style={{ color: 'rgba(30,15,70,0.4)' }}>{org?.plan ?? ''}</div>
        </div>
        <button
          className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] w-full border-none cursor-pointer"
          style={{ background: 'transparent', color: 'rgba(30,15,70,0.4)', fontFamily: 'var(--font-sans)' }}
          onClick={logout}
        >
          <LogOut size={17} strokeWidth={1.8} />
          <span className="text-sm font-medium">Déconnexion</span>
        </button>
      </div>
    </div>
  )
}

export function SchoolLayout() {
  const [open, setOpen] = useState(false)
  const [org,  setOrg]  = useState<SchoolOrgMin | null>(null)

  useEffect(() => {
    api.get<SchoolOrgMin>(ENDPOINTS.schoolOrg)
      .then(setOrg)
      .catch(() => { /* org non critique, le layout reste fonctionnel */ })
  }, [])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F9F7FF' }}>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(26,16,64,0.2)', backdropFilter: 'blur(2px)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar desktop */}
      <div className="hidden md:flex h-full">
        <Sidebar org={org} />
      </div>

      {/* Sidebar mobile drawer */}
      <div className={`fixed inset-y-0 left-0 z-40 md:hidden transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar org={org} isMobile onClose={() => setOpen(false)} />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div
          className="md:hidden flex items-center gap-3 px-4 py-3 shrink-0"
          style={{ background: '#fff', borderBottom: '1px solid rgba(107,79,224,0.1)' }}
        >
          <button
            onClick={() => setOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border-none cursor-pointer"
            style={{ background: 'rgba(107,79,224,0.07)', color: '#6B4FE0' }}
          >
            <Menu size={17} />
          </button>
          <Logo size="sm" />
        </div>

        <main className="flex-1 overflow-auto">
          <div
            className="fixed inset-0 pointer-events-none -z-10"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(107,79,224,.06) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          />
          <div className="p-5 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
