import { AlertTriangle, Inbox } from 'lucide-react'

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16" role="status" aria-live="polite">
      <div className="w-7 h-7 rounded-full border-2 animate-spin"
        style={{ borderColor: 'rgba(107,79,224,0.2)', borderTopColor: '#6B4FE0' }} />
      {label && <span className="text-xs" style={{ color: 'rgba(30,15,70,0.62)' }}>{label}</span>}
    </div>
  )
}

export function ErrorState({ message, onRetry, compact }: { message: string; onRetry?: () => void; compact?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-3 text-center ${compact ? 'py-8' : 'py-20'}`} role="alert">
      <AlertTriangle size={20} style={{ color: '#dc2626' }} />
      <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>Erreur de chargement</p>
      <p className="text-xs max-w-sm" style={{ color: 'rgba(30,15,70,0.7)' }}>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-action">Réessayer</button>
      )}
    </div>
  )
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-2xl py-12 px-4 flex flex-col items-center gap-2 text-center"
      style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(107,79,224,0.08)' }}>
      <Inbox size={20} style={{ color: 'rgba(107,79,224,0.5)' }} />
      <p className="text-sm font-semibold" style={{ color: 'rgba(30,15,70,0.75)' }}>{title}</p>
      {hint && <p className="text-xs max-w-sm" style={{ color: 'rgba(30,15,70,0.62)' }}>{hint}</p>}
    </div>
  )
}

/** Bandeau de retour d'action (succès ou erreur), fermable : remplace un toast. */
export function Notice({ tone, children, onClose }: { tone: 'success' | 'error' | 'info'; children: React.ReactNode; onClose?: () => void }) {
  const palette = {
    success: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)', color: '#15803d' },
    error:   { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)',  color: '#dc2626' },
    info:    { bg: 'rgba(107,79,224,0.06)', border: 'rgba(107,79,224,0.2)', color: '#4c35b5' },
  }[tone]
  return (
    <div className="rounded-xl px-4 py-3 text-sm flex items-start justify-between gap-3"
      role={tone === 'error' ? 'alert' : 'status'}
      style={{ background: palette.bg, border: `1px solid ${palette.border}`, color: palette.color }}>
      <div className="min-w-0">{children}</div>
      {onClose && (
        <button type="button" onClick={onClose}
          className="text-xs font-semibold border-none bg-transparent cursor-pointer shrink-0"
          style={{ color: palette.color }}>
          Fermer
        </button>
      )}
    </div>
  )
}
