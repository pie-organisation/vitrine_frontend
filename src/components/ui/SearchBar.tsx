import { Search } from 'lucide-react'

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function SearchBar({ className = '', ...props }: SearchBarProps) {
  return (
    <div className={`relative flex-1 ${className}`}>
      <Search
        size={15}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: 'rgba(107,79,224,0.4)' }}
      />
      <input className="cubi-input pr-9 !py-2.5 text-sm" {...props} />
    </div>
  )
}
