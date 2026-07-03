export type BadgeVariant = 'violet' | 'green' | 'yellow' | 'blue' | 'neutral' | 'red'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  dot?: boolean
}

const styles: Record<BadgeVariant, React.CSSProperties> = {
  violet:  { background: 'rgba(107,79,224,0.1)',   color: '#6B4FE0',  border: '1px solid rgba(107,79,224,0.2)'  },
  green:   { background: 'rgba(34,197,94,0.1)',    color: '#16a34a',  border: '1px solid rgba(34,197,94,0.2)'   },
  yellow:  { background: 'rgba(251,191,36,0.12)',  color: '#b45309',  border: '1px solid rgba(251,191,36,0.3)'  },
  blue:    { background: 'rgba(56,189,248,0.1)',   color: '#0284c7',  border: '1px solid rgba(56,189,248,0.2)'  },
  neutral: { background: 'rgba(30,15,70,0.07)',    color: 'rgba(30,15,70,0.55)', border: '1px solid rgba(30,15,70,0.1)'  },
  red:     { background: 'rgba(239,68,68,0.1)',    color: '#dc2626',  border: '1px solid rgba(239,68,68,0.2)'   },
}

const dotColors: Record<BadgeVariant, string> = {
  violet:  '#6B4FE0',
  green:   '#16a34a',
  yellow:  '#b45309',
  blue:    '#0284c7',
  neutral: 'rgba(30,15,70,0.4)',
  red:     '#dc2626',
}

export function Badge({ children, variant = 'violet', dot }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={styles[variant]}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: dotColors[variant] }}
        />
      )}
      {children}
    </span>
  )
}
