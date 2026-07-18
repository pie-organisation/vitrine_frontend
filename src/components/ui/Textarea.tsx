import { useId } from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
}

export function Textarea({ label, ...props }: TextareaProps) {
  const id = useId()

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-xs font-semibold"
        style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 60%, transparent)', fontFamily: 'var(--font-sans)' }}
      >
        {label}
      </label>
      <textarea id={id} className="cubi-input resize-none" rows={5} {...props} />
    </div>
  )
}
