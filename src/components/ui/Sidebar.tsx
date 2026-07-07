import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Layers, LogOut, X,
  ClipboardList, Monitor, Receipt, Terminal, Users,
  Mail, Sparkles, BarChart2,
  type LucideIcon,
} from 'lucide-react'
import { Logo }          from './Logo'
import { mockMessages }  from '../../mocks/data'
import { useAuth }       from '../../contexts/AuthContext'

interface NavItemDef {
  to: string
  icon: LucideIcon
  label: string
  badge?: number
}

const MSG_BADGE = mockMessages.filter((m) => m.statut === 'non_lu').length

const NAV_MAIN: NavItemDef[] = [
  { to: '/admin/overview',      icon: LayoutDashboard, label: "Vue d'ensemble" },
  { to: '/admin/demandes',      icon: ClipboardList,   label: 'Demandes',       badge: 3         },
  { to: '/admin/messages',      icon: Mail,            label: 'Messages',       badge: MSG_BADGE },
  { to: '/admin/organisations', icon: Building2,       label: 'Organisations'   },
  { to: '/admin/sessions',      icon: Monitor,         label: 'Sessions'        },
  { to: '/admin/analytics',     icon: BarChart2,       label: 'Analytics'       },
  { to: '/admin/facturation',   icon: Receipt,         label: 'Facturation'     },
  { to: '/admin/plans',         icon: Layers,          label: 'Plans'           },
  { to: '/admin/offres',        icon: Sparkles,        label: 'Offres'          },
  { to: '/admin/logs',          icon: Terminal,        label: 'Logs'            },
]

const CURRENT_ADMIN = { initials: 'TL', prenom: 'Thomas', nom: 'Leduc', role: 'Super admin' }

function NavItem({ to, icon: Icon, label, badge }: NavItemDef) {
  const { pathname } = useLocation()
  const active =
    to === '/admin/overview'
      ? pathname === to || pathname === '/admin'
      : pathname.startsWith(to)

  return (
    <Link to={to} className="block no-underline">
      <div
        className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-all duration-200"
        style={{
          background: active ? 'rgba(107,79,224,0.08)' : 'transparent',
          color:      active ? '#6B4FE0' : 'rgba(30,15,70,0.5)',
        }}
      >
        <Icon size={17} strokeWidth={active ? 2.2 : 1.8} className="shrink-0 transition-colors duration-200" />
        <span
          className="text-sm transition-colors duration-200"
          style={{ fontWeight: active ? 600 : 500, fontFamily: 'var(--font-sans)' }}
        >
          {label}
        </span>
        {badge != null ? (
          <span
            className="ml-auto w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
            style={{ background: '#EF4444' }}
          >
            {badge}
          </span>
        ) : active ? (
          <div className="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#6B4FE0' }} />
        ) : null}
      </div>
    </Link>
  )
}

interface SidebarProps {
  onClose?: () => void
  isMobile?: boolean
}

export function Sidebar({ onClose, isMobile }: SidebarProps) {
  const { pathname } = useLocation()
  const { logout }   = useAuth()
  const navigate     = useNavigate()
  const isProfileActive = pathname.startsWith('/admin/profil')

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  // Close on nav change (mobile drawer)
  useEffect(() => {
    if (isMobile) onClose?.()
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="w-60 h-full flex flex-col py-5 px-4 shrink-0"
      style={{ background: '#fff', borderRight: '1px solid rgba(107,79,224,0.1)' }}
    >
      {/* Logo + mobile close */}
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

      {/* Main nav — scrollable if content overflows */}
      <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
        {NAV_MAIN.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {/* Équipe */}
      <div
        className="flex flex-col gap-0.5 pt-3 mt-3"
        style={{ borderTop: '1px solid rgba(107,79,224,0.08)' }}
      >
        <NavItem to="/admin/equipe" icon={Users} label="Équipe" />
      </div>

      {/* Profile section */}
      <div
        className="pt-3 mt-2"
        style={{ borderTop: '1px solid rgba(107,79,224,0.08)' }}
      >
        <Link to="/admin/profil" className="block no-underline">
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-all duration-200"
            style={{ background: isProfileActive ? 'rgba(107,79,224,0.08)' : 'transparent' }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0"
              style={{ background: 'linear-gradient(135deg, #6B4FE0, #C084FC)', color: '#fff' }}
            >
              {CURRENT_ADMIN.initials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate" style={{ color: '#1a1040' }}>
                {CURRENT_ADMIN.prenom} {CURRENT_ADMIN.nom}
              </div>
              <div className="text-[10px]" style={{ color: 'rgba(30,15,70,0.4)' }}>
                {CURRENT_ADMIN.role}
              </div>
            </div>
          </div>
        </Link>
        <button
          className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] w-full border-none cursor-pointer"
          style={{ background: 'transparent', color: 'rgba(30,15,70,0.4)', fontFamily: 'var(--font-sans)' }}
          onClick={handleLogout}
        >
          <LogOut size={17} strokeWidth={1.8} />
          <span className="text-sm font-medium">Déconnexion</span>
        </button>
      </div>
    </div>
  )
}
