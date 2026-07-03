import { useState, useRef, useEffect } from 'react'
import { Download, ChevronDown } from 'lucide-react'

interface ExportButtonProps {
  filename?: string
}

export function ExportButton({ filename = 'export' }: ExportButtonProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        className="btn-action !w-auto flex items-center gap-1.5 text-sm !py-2 !px-3.5"
        onClick={() => setOpen((v) => !v)}
      >
        <Download size={14} />
        Exporter
        <ChevronDown
          size={13}
          style={{ transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      {open && (
        <div
          className="absolute right-0 top-10 rounded-xl py-1.5 z-50"
          style={{
            background: '#fff',
            border: '1px solid rgba(107,79,224,0.12)',
            boxShadow: '0 8px 24px rgba(107,79,224,0.14)',
            minWidth: '168px',
          }}
        >
          <button
            className="w-full px-4 py-2 text-left text-xs font-medium border-none cursor-pointer"
            style={{ background: 'transparent', color: '#1a1040', fontFamily: 'var(--font-sans)' }}
            onClick={() => { console.log('export-csv', filename); setOpen(false) }}
          >
            Export CSV
          </button>
          <button
            className="w-full px-4 py-2 text-left text-xs font-medium border-none cursor-pointer"
            style={{ background: 'transparent', color: '#1a1040', fontFamily: 'var(--font-sans)' }}
            onClick={() => { console.log('export-excel', filename); setOpen(false) }}
          >
            Export Excel (.xlsx)
          </button>
        </div>
      )}
    </div>
  )
}
