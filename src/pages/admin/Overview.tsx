import { useState } from 'react'
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react'
import { PageHeader }    from '../../components/ui/PageHeader'
import { MetricCard }    from '../../components/ui/MetricCard'
import { SectionCard }   from '../../components/ui/SectionCard'
import { ProgressBar }   from '../../components/ui/ProgressBar'
import { FilterPills }   from '../../components/ui/FilterPills'
import { DotsPagination } from '../../components/ui/DotsPagination'
import { useApi }        from '../../hooks/useApi'
import { api, ENDPOINTS } from '../../api/client'
import type { Alerte, AlerteSev, DashboardMetrics } from '../../mocks/data'

// ── Alert item ────────────────────────────────────────────────────────────────

const ICON_MAP: Record<AlerteSev, React.ReactNode> = {
  error:   <AlertCircle  size={15} style={{ color: '#EF4444' }} />,
  warning: <AlertTriangle size={15} style={{ color: '#F59E0B' }} />,
  info:    <Info          size={15} style={{ color: '#38BDF8' }} />,
  success: <CheckCircle2  size={15} style={{ color: '#22C55E' }} />,
}

const BG_MAP: Record<AlerteSev, { bg: string; border: string }> = {
  error:   { bg: 'rgba(239,68,68,0.05)',   border: 'rgba(239,68,68,0.18)'   },
  warning: { bg: 'rgba(245,158,11,0.06)',  border: 'rgba(245,158,11,0.2)'   },
  info:    { bg: 'rgba(56,189,248,0.05)',  border: 'rgba(56,189,248,0.18)'  },
  success: { bg: 'rgba(34,197,94,0.05)',   border: 'rgba(34,197,94,0.18)'   },
}

function AlertItem({ alerte }: { alerte: Alerte }) {
  const { bg, border } = BG_MAP[alerte.severite]
  return (
    <div
      className="flex items-start gap-3 rounded-xl px-4 py-3"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      <div className="mt-0.5 shrink-0">{ICON_MAP[alerte.severite]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm" style={{ color: '#1a1040' }}>{alerte.message}</p>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(30,15,70,0.38)' }}>{alerte.date}</p>
      </div>
    </div>
  )
}

// ── Filter options ─────────────────────────────────────────────────────────────

const ALERT_FILTERS = [
  { value: 'all',     label: 'Toutes'          },
  { value: 'error',   label: 'Erreurs'         },
  { value: 'warning', label: 'Avertissements'  },
  { value: 'info',    label: 'Infos'           },
]

const ALERTS_PER_PAGE = 3

// ── Loading / Error ───────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-7 h-7 rounded-full border-2 animate-spin"
        style={{ borderColor: 'rgba(107,79,224,0.2)', borderTopColor: '#6B4FE0' }} />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface OverviewData {
  metriques: DashboardMetrics
  alertes:   Alerte[]
}

export function Overview() {
  const [alertFilter, setAlertFilter] = useState('all')
  const [alertPage,   setAlertPage]   = useState(0)

  const { data, loading, error, refetch } = useApi<OverviewData>(
    () => Promise.all([
      api.get<DashboardMetrics>(ENDPOINTS.metriques),
      api.get<Alerte[]>(ENDPOINTS.alertes),
    ]).then(([metriques, alertes]) => ({ metriques, alertes })),
    []
  )

  const handleFilter = (f: string) => { setAlertFilter(f); setAlertPage(0) }

  const alertes   = data?.alertes ?? []
  const metriques = data?.metriques

  const filtered = alertFilter === 'all'
    ? alertes
    : alertes.filter((a) => a.severite === alertFilter)

  const totalPages = Math.ceil(filtered.length / ALERTS_PER_PAGE)
  const visible    = filtered.slice(alertPage * ALERTS_PER_PAGE, (alertPage + 1) * ALERTS_PER_PAGE)
  const traitedPct = metriques
    ? Math.round((metriques.alertesTraitees / metriques.alertesTotales) * 100)
    : 0

  if (loading) return <Spinner />

  if (error) return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>Erreur de chargement</p>
      <p className="text-xs" style={{ color: 'rgba(30,15,70,0.5)' }}>{error}</p>
      <button onClick={refetch} className="text-xs font-semibold px-4 py-2 rounded-xl border-none cursor-pointer"
        style={{ background: 'rgba(107,79,224,0.1)', color: '#6B4FE0' }}>
        Réessayer
      </button>
    </div>
  )

  return (
    <div>
      <PageHeader
        title="Vue d'ensemble"
        subtitle="Dashboard administrateur CUBI"
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <MetricCard label="Organisations actives" value={metriques?.organisationsActives ?? '—'} sublabel="dont 3 en attente" />
        <MetricCard label="Utilisateurs"          value={metriques ? metriques.utilisateursTotal.toLocaleString('fr-FR') : '—'} sublabel="+24 ce mois" />
        <MetricCard label="Sessions en cours"     value={metriques?.sessionsEnCours ?? '—'} sublabel="en temps réel" />
        <MetricCard label="Taux renouvellement"   value={metriques?.tauxRenouvellement ?? '—'} sublabel="12 derniers mois" />
      </div>

      {/* Alertes */}
      <SectionCard title="Alertes">
        <div className="mb-5">
          <ProgressBar
            value={traitedPct}
            label="Alertes traitées"
            valueLabel={metriques ? `${metriques.alertesTraitees} / ${metriques.alertesTotales}` : '—'}
          />
        </div>

        <FilterPills options={ALERT_FILTERS} value={alertFilter} onChange={handleFilter} />

        <div className="flex flex-col gap-2.5 mt-4">
          {visible.length > 0
            ? visible.map((a) => <AlertItem key={a.id} alerte={a} />)
            : (
              <p className="text-sm text-center py-4" style={{ color: 'rgba(30,15,70,0.35)' }}>
                Aucune alerte dans cette catégorie
              </p>
            )}
        </div>

        {totalPages > 1 && (
          <div className="mt-5">
            <DotsPagination total={totalPages} current={alertPage} onChange={setAlertPage} showLabel />
          </div>
        )}
      </SectionCard>
    </div>
  )
}
