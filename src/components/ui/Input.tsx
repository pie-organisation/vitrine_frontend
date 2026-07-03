import { useId } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Input({ label, ...props }: InputProps) {
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
      <input id={id} className="cubi-input" {...props} />
    </div>
  )
}
