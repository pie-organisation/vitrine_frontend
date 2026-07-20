
export type SectionBackground = 'none' | 'light' | 'gradient'

interface CardProps {
  children: React.ReactNode
  className?: string
  id?: string
  background?: SectionBackground
}

const BG_CLASS: Record<SectionBackground, string> = {
  none: '',
  light: 'bg-gradient-light',
  gradient: 'bg-gradient-fond',
}



export function Card({children, className = '', id, background = 'none',}: CardProps) {
  return (
    <div
      id={id}
      className={`rounded-2xl p-8 sm:p-10 ${className} ${BG_CLASS[background]}`}
      style={{
        background:
          background === 'none'
            ? 'rgba(255,255,255,0.75)'
            : undefined,

        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(107,79,224,0.14)',
        boxShadow: '0 8px 40px rgba(107,79,224,0.1)',
      }}
    >
      {children}
    </div>
  );
}
