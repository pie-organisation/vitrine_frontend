import { useId } from 'react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
}

export function Select({ label, children, ...props }: SelectProps) {
  const id = useId()

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-xs font-semibold"
        style={{ color: 'rgba(30,15,70,0.6)', fontFamily: 'var(--font-sans)' }}
      >
        {label}
      </label>
      <select id={id} className="cubi-input" {...props}>
        {children}
      </select>
    </div>
  )
}
