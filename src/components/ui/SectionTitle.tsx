interface SectionTitleProps {
  children: React.ReactNode
}

export function SectionTitle({ children }: SectionTitleProps) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span
        className="block w-4 h-0.5 rounded shrink-0"
        style={{ background: 'linear-gradient(135deg, #8B6FF0, #E879F9)' }}
      />
      <h3
        className="text-sm font-bold tracking-tight"
        style={{ color: '#1a1040', fontFamily: 'var(--font-display)' }}
      >
        {children}
      </h3>
    </div>
  )
}
