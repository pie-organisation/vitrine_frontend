import { useEffect, useRef, useState } from 'react'
import { DayPicker, type DateRange as RdpRange } from 'react-day-picker'
import { fr } from 'react-day-picker/locale'
import 'react-day-picker/style.css'
import { CalendarDays } from 'lucide-react'

export interface DateRange {
  from: Date
  to: Date
}

export interface DateRangePreset {
  label: string
  range: () => DateRange
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const daysAgo = (n: number) => { const d = startOfDay(new Date()); d.setDate(d.getDate() - n); return d }

export const DEFAULT_PRESETS: DateRangePreset[] = [
  { label: '7 derniers jours',  range: () => ({ from: daysAgo(6),  to: startOfDay(new Date()) }) },
  { label: '30 derniers jours', range: () => ({ from: daysAgo(29), to: startOfDay(new Date()) }) },
  {
    label: 'Ce trimestre',
    range: () => {
      const now = new Date()
      return { from: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1), to: startOfDay(now) }
    },
  },
  { label: 'Cette année', range: () => ({ from: new Date(new Date().getFullYear(), 0, 1), to: startOfDay(new Date()) }) },
]

const sameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime()
export const sameRange = (a: DateRange, b: DateRange) => sameDay(a.from, b.from) && sameDay(a.to, b.to)

export function formatRange({ from, to }: DateRange) {
  const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  return sameDay(from, to) ? fmt(from) : `${fmt(from)} → ${fmt(to)}`
}

function useIsWide() {
  const query = '(min-width: 640px)'
  const [wide, setWide] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setWide(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return wide
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  presets?: DateRangePreset[]
}

export function DateRangePicker({ value, onChange, presets = DEFAULT_PRESETS }: DateRangePickerProps) {
  const [open,  setOpen]  = useState(false)
  const [draft, setDraft] = useState<RdpRange | undefined>(value)
  const rootRef = useRef<HTMLDivElement>(null)
  const isWide  = useIsWide()

  // Repart de la période en cours à chaque ouverture
  useEffect(() => { if (open) setDraft(value) }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fermeture au clic extérieur et à Échap
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const apply = () => {
    if (!draft?.from) return
    onChange({ from: draft.from, to: draft.to ?? draft.from })
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-sm font-semibold px-3.5 py-2 rounded-xl cursor-pointer transition-colors duration-200"
        style={{
          background: open ? 'rgba(107,79,224,0.1)' : '#fff',
          border: '1px solid rgba(107,79,224,0.3)',
          color: '#1a1040',
          fontFamily: 'var(--font-sans)',
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <CalendarDays size={15} style={{ color: '#6B4FE0' }} />
        {formatRange(value)}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choisir une période"
          className="absolute right-0 mt-2 z-40 rounded-2xl p-4 flex flex-col sm:flex-row gap-4"
          style={{
            background: '#fff',
            border: '1px solid rgba(107,79,224,0.16)',
            boxShadow: '0 16px 48px rgba(107,79,224,0.18)',
            maxWidth: 'calc(100vw - 2rem)',
          }}
        >
          {/* Raccourcis */}
          <div className="flex sm:flex-col gap-1.5 flex-wrap sm:w-40 shrink-0">
            {presets.map((p) => {
              const r = p.range()
              const active = !!draft?.from && !!draft?.to && sameRange({ from: draft.from, to: draft.to }, r)
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setDraft(r)}
                  className="text-left text-xs font-semibold px-3 py-2 rounded-lg border-none cursor-pointer"
                  style={{
                    background: active ? 'rgba(107,79,224,0.12)' : 'transparent',
                    color: active ? '#6B4FE0' : 'rgba(30,15,70,0.7)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  {p.label}
                </button>
              )
            })}
          </div>

          {/* Calendrier + actions */}
          <div className="flex flex-col gap-3">
            <DayPicker
              className="cubi-rdp"
              mode="range"
              locale={fr}
              numberOfMonths={isWide ? 2 : 1}
              defaultMonth={isWide
                ? new Date(value.to.getFullYear(), value.to.getMonth() - 1, 1)
                : value.to}
              selected={draft}
              onSelect={setDraft}
              disabled={{ after: new Date() }}
              endMonth={new Date()}
              showOutsideDays
            />
            <div className="flex items-center justify-between gap-3 pt-3"
              style={{ borderTop: '1px solid rgba(107,79,224,0.1)' }}>
              <span className="text-xs" style={{ color: 'rgba(30,15,70,0.7)' }}>
                {draft?.from
                  ? formatRange({ from: draft.from, to: draft.to ?? draft.from })
                  : 'Choisissez une date de début'}
              </span>
              <div className="flex gap-2">
                <button type="button" className="btn-action" onClick={() => setOpen(false)}>Annuler</button>
                <button
                  type="button"
                  className="btn-primary !w-auto !py-2 !px-4 !text-sm"
                  onClick={apply}
                  disabled={!draft?.from}
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
