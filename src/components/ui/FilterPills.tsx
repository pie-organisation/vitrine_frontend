interface FilterOption {
  value: string
  label: string
  count?: number
}

interface FilterPillsProps {
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
}

export function FilterPills({ options, value, onChange }: FilterPillsProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((option) => {
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer border transition-all duration-200"
            style={{
              background:   active ? 'rgba(107,79,224,0.1)'   : 'rgba(255,255,255,0.75)',
              color:        active ? '#6B4FE0'                 : 'rgba(30,15,70,0.5)',
              borderColor:  active ? 'rgba(107,79,224,0.3)'   : 'rgba(107,79,224,0.12)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {option.label}
            {option.count !== undefined && (
              <span
                className="text-[10px] px-1.5 py-px rounded-full"
                style={{
                  background: active ? 'rgba(107,79,224,0.15)' : 'rgba(30,15,70,0.07)',
                  color: active ? '#6B4FE0' : 'rgba(30,15,70,0.45)',
                }}
              >
                {option.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
