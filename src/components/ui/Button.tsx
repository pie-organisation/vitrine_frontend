interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  fullWidth?: boolean
}

export function Button({
  children,
  variant = 'primary',
  fullWidth = true,
  className = '',
  ...props
}: ButtonProps) {
  if (variant === 'secondary') {
    return (
      <button
        className={`${fullWidth ? 'w-full' : ''} py-3.5 px-6 rounded-[11px] font-semibold text-sm transition-all duration-200 cursor-pointer ${className}`}
        style={{
          background: 'transparent',
          border: '1.5px solid rgba(107,79,224,0.4)',
          color: '#6B4FE0',
          fontFamily: 'var(--font-display)',
        }}
        {...props}
      >
        {children}
      </button>
    )
  }

  return (
    <button
      className={`btn-primary ${!fullWidth ? '!w-auto' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
