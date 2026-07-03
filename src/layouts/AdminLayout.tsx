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
          className="md:hidden flex items-center gap-3 px-4 py-3 shrink-0"
          style={{ background: '#fff', borderBottom: '1px solid rgba(107,79,224,0.1)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border-none cursor-pointer"
            style={{ background: 'rgba(107,79,224,0.07)', color: '#6B4FE0' }}
          >
            <Menu size={17} />
          </button>
          <Logo size="sm" />
          <div className="ml-auto">
            <NotificationBell />
          </div>
        </div>

        {/* Desktop top-bar */}
        <div
          className="hidden md:flex items-center justify-end gap-3 px-6 py-2.5 shrink-0"
          style={{ background: 'rgba(255,255,255,0.92)', borderBottom: '1px solid rgba(107,79,224,0.08)', backdropFilter: 'blur(8px)' }}
        >
          <NotificationBell />
          <Link to="/admin/profil" className="no-underline">
            <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-colors" style={{ background: 'rgba(107,79,224,0.05)' }}>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs"
                style={{ background: 'linear-gradient(135deg, #6B4FE0, #C084FC)', color: '#fff' }}
              >
                {admin.initials}
              </div>
              <span className="text-xs font-semibold" style={{ color: '#1a1040', fontFamily: 'var(--font-sans)' }}>
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
