interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
      <div>
        <h1
          className="font-display font-extrabold text-2xl"
          style={{ color: '#1a1040', letterSpacing: '-0.8px' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-1" style={{ color: 'rgba(30,15,70,0.45)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
    </div>
  )
}
