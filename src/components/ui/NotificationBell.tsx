import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { Bell, ClipboardList, CreditCard, AlertTriangle, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import { mockNotifications, type AppNotification, type NotifType } from '../../mocks/data'

// ── Type meta ─────────────────────────────────────────────────────────────────

const TYPE_META: Record<NotifType, { icon: React.ReactNode; color: string }> = {
  demande:  { icon: <ClipboardList size={13} />, color: '#6B4FE0' },
  paiement: { icon: <CreditCard    size={13} />, color: '#F59E0B' },
  anomalie: { icon: <AlertTriangle size={13} />, color: '#EF4444' },
  info:     { icon: <Info          size={13} />, color: '#38BDF8' },
}

// ── Notification item ─────────────────────────────────────────────────────────

function NotifItem({ notif }: { notif: AppNotification }) {
  const meta = TYPE_META[notif.type]
  return (
    <div
      className="flex items-start gap-3 px-4 py-3"
      style={
        !notif.lu
          ? { background: 'rgba(107,79,224,0.04)', borderBottom: '1px solid rgba(107,79,224,0.07)' }
          : { borderBottom: '1px solid rgba(107,79,224,0.06)' }
      }
    >
      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: `${meta.color}1A`, color: meta.color }}
      >
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs leading-snug" style={{ color: '#1a1040', fontWeight: notif.lu ? 400 : 600 }}>
          {notif.message}
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: 'rgba(30,15,70,0.38)' }}>{notif.horodatage}</p>
      </div>
      {!notif.lu && (
        <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: '#6B4FE0' }} />
      )}
    </div>
  )
}

// ── Bell component ────────────────────────────────────────────────────────────

export function NotificationBell() {
  const [open, setOpen]       = useState(false)
  const [pos,  setPos]        = useState({ top: 0, right: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const ref    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (
        ref.current  && !ref.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  useLayoutEffect(() => {
    if (open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({
        top:   r.bottom + 8,
        right: window.innerWidth - r.right,
      })
    }
  }, [open])

  const unreadCount = mockNotifications.filter((n) => !n.lu).length

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        ref={btnRef}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl border-none cursor-pointer transition-colors"
        style={{ background: open ? 'rgba(107,79,224,0.1)' : 'rgba(107,79,224,0.06)', color: '#6B4FE0' }}
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
      >
        <Bell size={17} strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 w-[16px] h-[16px] rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ background: '#EF4444' }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel — portaled to body to escape backdrop-filter stacking context */}
      {open && createPortal(
        <div
          ref={ref}
          className="rounded-2xl overflow-hidden"
          style={{
            position: 'fixed',
            top:      pos.top,
            right:    pos.right,
            zIndex:   9999,
            background: '#fff',
            border: '1px solid rgba(107,79,224,0.12)',
            boxShadow: '0 16px 48px rgba(107,79,224,0.16)',
            width: '320px',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid rgba(107,79,224,0.08)' }}
          >
            <span className="font-display font-bold text-sm" style={{ color: '#1a1040' }}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626' }}
              >
                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* List */}
          <div>
            {mockNotifications.map((n) => (
              <NotifItem key={n.id} notif={n} />
            ))}
          </div>

          {/* Footer */}
          <div
            className="px-4 py-3 text-center"
            style={{ borderTop: '1px solid rgba(107,79,224,0.08)' }}
          >
            <Link
              to="/admin/notifications"
              className="text-xs font-semibold no-underline"
              style={{ color: '#6B4FE0' }}
              onClick={() => setOpen(false)}
            >
              Voir toutes les notifications →
            </Link>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
