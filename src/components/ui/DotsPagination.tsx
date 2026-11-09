import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DotsPaginationProps {
  total: number
  current: number
  onChange: (index: number) => void
  showLabel?: boolean
}

function ArrowButton({ direction, disabled, onClick }: { direction: 'prev' | 'next'; disabled: boolean; onClick: () => void }) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-7 h-7 flex items-center justify-center rounded-lg border-none transition-colors duration-200"
      style={{
        background: disabled ? 'transparent' : 'rgba(107,79,224,0.1)',
        color:      disabled ? 'rgba(107,79,224,0.3)' : '#6B4FE0',
        cursor:     disabled ? 'default' : 'pointer',
      }}
      aria-label={direction === 'prev' ? 'Page précédente' : 'Page suivante'}
    >
      <Icon size={16} strokeWidth={2.2} />
    </button>
  )
}

export function DotsPagination({ total, current, onChange, showLabel }: DotsPaginationProps) {
  if (total <= 1) return null

  return (
    <div className="flex items-center justify-center gap-3">
      {showLabel && (
        <span className="text-xs" style={{ color: 'rgba(30,15,70,0.62)' }}>
          {current + 1} sur {total}
        </span>
      )}
      <div className="flex items-center gap-2">
        <ArrowButton direction="prev" disabled={current === 0} onClick={() => onChange(current - 1)} />
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className="border-none cursor-pointer p-0 transition-all duration-300"
            style={{
              width:        current === i ? '22px' : '8px',
              height:       '8px',
              borderRadius: current === i ? '4px' : '50%',
              background:   current === i ? '#6B4FE0' : 'rgba(107,79,224,0.2)',
            }}
            aria-label={`Page ${i + 1}`}
          />
        ))}
        <ArrowButton direction="next" disabled={current === total - 1} onClick={() => onChange(current + 1)} />
      </div>
    </div>
  )
}
