interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-2xl p-8 sm:p-10 ${className}`}
      style={{
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(107,79,224,0.14)',
        boxShadow: '0 8px 40px rgba(107,79,224,0.1)',
      }}
    >
      {children}
    </div>
  )
}
