interface ProgressBarProps {
  value: number
  label?: string
  valueLabel?: string
  height?: 'sm' | 'md'
}

export function ProgressBar({ value, label, valueLabel, height = 'sm' }: ProgressBarProps) {
  const h = height === 'sm' ? '6px' : '8px'
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div>
      {(label || valueLabel) && (
        <div className="flex items-center justify-between mb-2">
          {label    && <span className="text-xs font-medium" style={{ color: 'rgba(30,15,70,0.55)' }}>{label}</span>}
          {valueLabel && <span className="text-xs font-bold" style={{ color: '#6B4FE0' }}>{valueLabel}</span>}
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: h, background: 'rgba(107,79,224,0.1)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${clamped}%`,
            background: 'linear-gradient(90deg, #8B6FF0, #E879F9)',
          }}
        />
      </div>
    </div>
  )
}
