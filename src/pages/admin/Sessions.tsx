import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { PageHeader }  from '../../components/ui/PageHeader'
import { ExportButton } from '../../components/ui/ExportButton'
import { MetricCard }  from '../../components/ui/MetricCard'
import { FilterPills } from '../../components/ui/FilterPills'
import { Badge }       from '../../components/ui/Badge'
import { SectionCard } from '../../components/ui/SectionCard'
import { useApi }        from '../../hooks/useApi'
import { api, ENDPOINTS } from '../../api/client'
import type { SessionActive } from '../../mocks/data'

// ── Session row ───────────────────────────────────────────────────────────────

function SessionRow({ session, onTerminate }: { session: SessionActive; onTerminate: (id: string) => void }) {
  const isAnomalie = session.statut === 'anomalie'

  return (
    <div
      className="list-card"
      style={
        isAnomalie
          ? { background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.2)' }
          : undefined
      }
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3.5">
          {/* Live dot */}
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0 animate-pulse"
            style={{ background: isAnomalie ? '#EF4444' : '#22C55E' }}
          />
          <div>
            <div className="font-display font-bold text-sm" style={{ color: '#1a1040' }}>
              {session.nomUtilisateur}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(30,15,70,0.42)' }}>
              {session.organisation}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          <div className="text-right">
            <div className="text-xs font-medium" style={{ color: '#1a1040' }}>
              Depuis {session.heureDebut}
            </div>
            <div className="text-xs" style={{ color: 'rgba(30,15,70,0.4)' }}>
              Durée : {session.duree}
            </div>
          </div>
          <code
            className="text-[10px] px-2 py-0.5 rounded-md"
            style={{ background: 'rgba(107,79,224,0.06)', color: 'rgba(30,15,70,0.5)' }}
          >
            {session.ip}
          </code>
          {isAnomalie && <Badge variant="red" dot>Anomalie</Badge>}
          <button
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border-none cursor-pointer"
            style={{ background: 'rgba(107,79,224,0.08)', color: '#6B4FE0', fontFamily: 'var(--font-sans)' }}
            onClick={() => onTerminate(session.id)}
          >
            Terminer
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Filter options ─────────────────────────────────────────────────────────────

const FILTERS = [
  { value: 'all',      label: 'Toutes'    },
  { value: 'actif',    label: 'Actives'   },
  { value: 'anomalie', label: 'Anomalies' },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export function Sessions() {
  const [filter, setFilter] = useState('all')

  const { data: sessions, loading, error, refetch } = useApi<SessionActive[]>(
    () => api.get<SessionActive[]>(ENDPOINTS.sessions),
    []
  )

  const allSessions = sessions ?? []
  const anomalies   = allSessions.filter((s) => s.statut === 'anomalie')
  const filtered    = filter === 'all' ? allSessions : allSessions.filter((s) => s.statut === filter)

  const handleTerminate = async (id: string) => {
    try {
      await api.delete(ENDPOINTS.session(id))
      refetch()
    } catch (err) {
      console.error('terminate session error', err)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-7 h-7 rounded-full border-2 animate-spin"
        style={{ borderColor: 'rgba(107,79,224,0.2)', borderTopColor: '#6B4FE0' }} />
    </div>
  )

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
        title="Sessions en cours"
        subtitle="Supervision temps réel des sessions actives"
        actions={<ExportButton filename="sessions" />}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <MetricCard label="Sessions actives" value={allSessions.length} sublabel="en ce moment" />
        <MetricCard label="Anomalies"        value={anomalies.length}   sublabel="à traiter"    />
        <MetricCard label="Durée moyenne"    value="—"                  sublabel="par session"  />
        <MetricCard label="Orgs avec session" value={new Set(allSessions.map((s) => s.organisationId)).size} sublabel="organisations" />
      </div>

      {/* Anomaly banner */}
      {anomalies.length > 0 && (
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-3.5 mb-5"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <AlertTriangle size={16} style={{ color: '#dc2626', marginTop: '1px', flexShrink: 0 }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>
              {anomalies.length} session{anomalies.length > 1 ? 's' : ''} anormale{anomalies.length > 1 ? 's' : ''} détectée{anomalies.length > 1 ? 's' : ''}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(30,15,70,0.5)' }}>
              {anomalies.map((s) => s.nomUtilisateur).join(', ')} — sessions multiples ou IP non reconnue
            </p>
          </div>
        </div>
      )}

      <FilterPills options={FILTERS} value={filter} onChange={setFilter} />

      <div className="mt-5 mb-4">
        <span className="text-sm font-semibold" style={{ color: 'rgba(30,15,70,0.6)' }}>
          {filtered.length} session{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <SectionCard title="Sessions actives">
        <div className="flex flex-col gap-2.5">
          {filtered.map((s) => (
            <SessionRow key={s.id} session={s} onTerminate={handleTerminate} />
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: 'rgba(30,15,70,0.35)' }}>
              Aucune session dans cette catégorie.
            </p>
          )}
        </div>
      </SectionCard>
    </div>
  )
}
