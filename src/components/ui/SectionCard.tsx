interface SectionCardProps {
  title?: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
  noPad?: boolean
}

export function SectionCard({ title, children, action, className = '', noPad }: SectionCardProps) {
  return (
    <div className={`section-card ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-5">
          {title && (
            <h3
              className="font-display font-bold text-base"
              style={{ color: '#1a1040', letterSpacing: '-0.3px' }}
            >
              {title}
            </h3>
          )}
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={noPad ? '-mx-[22px] -mb-5' : ''}>{children}</div>
    </div>
  )
}
