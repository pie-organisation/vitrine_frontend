interface ListCardProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function ListCard({ children, onClick, className = '' }: ListCardProps) {
  return (
    <div
      className={`list-card ${onClick ? 'clickable' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
