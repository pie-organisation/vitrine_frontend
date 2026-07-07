import { useState } from 'react'
import { Outlet }   from 'react-router-dom'
import { Link }     from 'react-router-dom'
import { Menu }     from 'lucide-react'
import { Sidebar }  from '../components/ui/Sidebar'
import { Logo }     from '../components/ui/Logo'
import { NotificationBell } from '../components/ui/NotificationBell'
import { useAuth }  from '../contexts/AuthContext'

export function AdminLayout() {
  const { user, logout } = useAuth()
  const admin = user ?? { initials: '?', prenom: '', nom: '' }
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F9F7FF' }}>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(26,16,64,0.2)', backdropFilter: 'blur(2px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — desktop: static; mobile: fixed drawer */}
      <div className="hidden md:flex h-full">
        <Sidebar />
      </div>
      <div
        className={`fixed inset-y-0 left-0 z-40 md:hidden transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar isMobile onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Content column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top-bar */}
        <div
          className="md:hidden flex items-center gap-3 px-4 py-3 shrink-0 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #2a1660, #170c38)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div
            className="absolute -top-10 left-10 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.18), transparent 70%)' }}
          />
          <button
            onClick={() => setSidebarOpen(true)}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg border-none cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#C084FC' }}
          >
            <Menu size={17} />
          </button>
          <span className="relative">
            <Logo size="sm" />
          </span>
          <div className="relative ml-auto">
            <NotificationBell />
          </div>
        </div>

        {/* Desktop top-bar */}
        <div
          className="hidden md:flex items-center justify-end gap-3 px-6 py-2.5 shrink-0 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(42,22,96,0.95), rgba(23,12,56,0.95))', borderBottom: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="absolute -top-16 left-1/3 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.14), transparent 70%)' }}
          />
          <span className="relative"><NotificationBell /></span>
          <Link to="/admin/profil" className="relative no-underline">
            <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-colors" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs"
                style={{ background: 'linear-gradient(135deg, #6B4FE0, #C084FC)', color: '#fff' }}
              >
                {admin.initials}
              </div>
              <span className="text-xs font-semibold" style={{ color: '#fff', fontFamily: 'var(--font-sans)' }}>
                {admin.prenom} {admin.nom}
              </span>
            </div>
          </Link>
        </div>

        {/* Scrollable content area */}
        <main className="flex-1 overflow-auto relative">
          {/* Subtle dot grid */}
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
