interface ToggleOption {
  value: string
  label: string
}

interface ToggleProps {
  options: [ToggleOption, ToggleOption]
  value: string
  onChange: (value: string) => void
}

export function Toggle({ options, value, onChange }: ToggleProps) {
  return (
    <div
      className="flex rounded-xl p-1 w-full"
      style={{
        background: 'rgba(107,79,224,0.06)',
        border: '1px solid rgba(107,79,224,0.12)',
      }}
    >
      {options.map((option) => {
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-[10px] text-sm font-semibold transition-all duration-200 cursor-pointer"
            style={{
              fontFamily: 'var(--font-sans)',
              background: active ? '#fff' : 'transparent',
              color: active ? '#6B4FE0' : 'rgba(30,15,70,0.4)',
              boxShadow: active ? '0 2px 8px rgba(107,79,224,0.12)' : 'none',
            }}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0 transition-all duration-200"
              style={{
                background: active ? '#6B4FE0' : 'rgba(107,79,224,0.25)',
                transform: active ? 'scale(1)' : 'scale(0.75)',
              }}
            />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
