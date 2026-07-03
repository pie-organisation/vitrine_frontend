interface DotsPaginationProps {
  total: number
  current: number
  onChange: (index: number) => void
  showLabel?: boolean
}

export function DotsPagination({ total, current, onChange, showLabel }: DotsPaginationProps) {
  if (total <= 1) return null

  return (
    <div className="flex items-center justify-center gap-3">
      {showLabel && (
        <span className="text-xs" style={{ color: 'rgba(30,15,70,0.35)' }}>
          {current + 1} sur {total}
        </span>
      )}
      <div className="flex items-center gap-2">
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
      </div>
    </div>
  )
}
