import { useState } from 'react'
import { LogIn, Edit3, AlertCircle, Shield } from 'lucide-react'
import { PageHeader }  from '../../components/ui/PageHeader'
import { ExportButton } from '../../components/ui/ExportButton'
import { FilterPills } from '../../components/ui/FilterPills'
import { SearchBar }   from '../../components/ui/SearchBar'
import { useApi }        from '../../hooks/useApi'
import { api, ENDPOINTS } from '../../api/client'
import type { LogEntry, LogType } from '../../mocks/data'

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_META: Record<LogType, { icon: React.ReactNode; color: string; label: string }> = {
  connexion:    { icon: <LogIn       size={13} />, color: '#0284c7', label: 'Connexion'    },
  modification: { icon: <Edit3       size={13} />, color: '#6B4FE0', label: 'Modification' },
  erreur:       { icon: <AlertCircle size={13} />, color: '#dc2626', label: 'Erreur'       },
  securite:     { icon: <Shield      size={13} />, color: '#b45309', label: 'Sécurité'     },
}

// ── Log row ───────────────────────────────────────────────────────────────────

function LogRow({ entry }: { entry: LogEntry }) {
  const meta       = TYPE_META[entry.type]
  const isSecurity = entry.type === 'securite'

  return (
    <div
      className="flex items-start gap-3 px-3 py-2.5"
      style={
        isSecurity
          ? { background: 'rgba(239,68,68,0.04)', borderBottom: '1px solid rgba(239,68,68,0.12)' }
          : { borderBottom: '1px solid rgba(107,79,224,0.07)' }
      }
    >
      {/* Type icon */}
      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: `${meta.color}1A`, color: meta.color }}
      >
        {meta.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="min-w-0">
            <span className="text-xs font-semibold" style={{ color: meta.color }}>
              {meta.label}
            </span>
            <span className="text-xs font-medium ml-2" style={{ color: '#1a1040' }}>
              {entry.organisation}
            </span>
            <span className="text-xs ml-1" style={{ color: 'rgba(30,15,70,0.45)' }}>
              ({entry.utilisateur})
            </span>
          </div>
          <span className="text-[10px] font-mono shrink-0" style={{ color: 'rgba(30,15,70,0.35)' }}>
            {entry.horodatage}
          </span>
        </div>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(30,15,70,0.55)' }}>
          {entry.message}
        </p>
      </div>
    </div>
  )
}

// ── Filter options ─────────────────────────────────────────────────────────────

const FILTERS = [
  { value: 'all',          label: 'Tous'         },
  { value: 'connexion',    label: 'Connexion'    },
  { value: 'modification', label: 'Modification' },
  { value: 'erreur',       label: 'Erreur'       },
  { value: 'securite',     label: 'Sécurité'     },
]

const INITIAL_COUNT = 8

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-7 h-7 rounded-full border-2 animate-spin"
        style={{ borderColor: 'rgba(107,79,224,0.2)', borderTopColor: '#6B4FE0' }} />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function Logs() {
  const [typeFilter, setTypeFilter] = useState('all')
  const [orgFilter,  setOrgFilter]  = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [showAll,    setShowAll]    = useState(false)

  const { data: logs, loading, error, refetch } = useApi<LogEntry[]>(
    () => api.get<LogEntry[]>(ENDPOINTS.logs),
    []
  )
  const allLogs = logs ?? []

  const handleType = (f: string) => { setTypeFilter(f); setShowAll(false) }

  const filtered = allLogs.filter((l) => {
    const matchType = typeFilter === 'all' || l.type === typeFilter
    const q         = orgFilter.toLowerCase()
    const matchOrg  = !q || l.organisation.toLowerCase().includes(q)
    const matchDate = !dateFilter || l.horodatage.startsWith(dateFilter)
    return matchType && matchOrg && matchDate
  })

  const visible  = showAll ? filtered : filtered.slice(0, INITIAL_COUNT)
  const hasMore  = !showAll && filtered.length > INITIAL_COUNT
  const secCount = filtered.filter((l) => l.type === 'securite').length

  if (loading) return <Spinner />
  if (error) return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>Erreur de chargement</p>
      <p className="text-xs" style={{ color: 'rgba(30,15,70,0.5)' }}>{error}</p>
      <button onClick={refetch} className="text-xs font-semibold px-4 py-2 rounded-xl border-none cursor-pointer"
        style={{ background: 'rgba(107,79,224,0.1)', color: '#6B4FE0' }}>Réessayer</button>
    </div>
  )

  return (
    <div>
      <PageHeader
        title="Journaux système"
        subtitle="Timeline des événements et activité de sécurité"
        actions={<ExportButton filename="logs" />}
      />

      {/* Type filter */}
      <FilterPills options={FILTERS} value={typeFilter} onChange={handleType} />

      {/* Org + date filters */}
      <div className="flex gap-3 mt-4 mb-6 flex-wrap">
        <div className="flex-1" style={{ minWidth: '180px' }}>
          <SearchBar
            placeholder="Filtrer par organisation…"
            value={orgFilter}
            onChange={(e) => { setOrgFilter(e.target.value); setShowAll(false) }}
          />
        </div>
        <input
          className="cubi-input !py-2.5 text-sm"
          style={{ width: '170px' }}
          placeholder="Date (ex: 27/11/2024)"
          value={dateFilter}
          onChange={(e) => { setDateFilter(e.target.value); setShowAll(false) }}
        />
      </div>

      {/* Count + security badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold" style={{ color: 'rgba(30,15,70,0.6)' }}>
          {filtered.length} événement{filtered.length !== 1 ? 's' : ''}
        </span>
        {secCount > 0 && (
          <span
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626' }}
          >
            <Shield size={11} />
            {secCount} de sécurité
          </span>
        )}
      </div>

      {/* Timeline */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.85)',
          border: '1px solid rgba(107,79,224,0.1)',
          boxShadow: '0 2px 16px rgba(107,79,224,0.04)',
        }}
      >
        {visible.length > 0
          ? visible.map((l) => <LogRow key={l.id} entry={l} />)
          : (
            <p className="text-sm text-center py-8" style={{ color: 'rgba(30,15,70,0.35)' }}>
              Aucun événement ne correspond aux filtres appliqués.
            </p>
          )}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center mt-5">
          <button
            className="btn-action !py-2.5 !px-6 !w-auto text-sm"
            onClick={() => setShowAll(true)}
          >
            Charger plus ({filtered.length - INITIAL_COUNT} restant{filtered.length - INITIAL_COUNT > 1 ? 's' : ''})
          </button>
        </div>
      )}
    </div>
  )
}
