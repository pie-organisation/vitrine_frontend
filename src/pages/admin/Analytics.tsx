import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,  Line,
  AreaChart,  Area,
  PieChart,   Pie,   Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from 'recharts'
import { PageHeader }  from '../../components/ui/PageHeader'
import { SectionCard } from '../../components/ui/SectionCard'
import { FilterPills } from '../../components/ui/FilterPills'
import { MetricCard }  from '../../components/ui/MetricCard'
import { DateRangePicker, DEFAULT_PRESETS, formatRange, sameRange, type DateRange } from '../../components/ui/DateRangePicker'
import { mockAnalytics } from '../../mocks/data'

// ── Period filter ─────────────────────────────────────────────────────────────

// Raccourcis rapides, alignés sur les raccourcis du calendrier (même ordre)
const PERIODS = [
  { value: '7j',        label: '7 jours'       },
  { value: '30j',       label: '30 jours'      },
  { value: 'trimestre', label: 'Ce trimestre'  },
  { value: 'annee',     label: 'Cette année'   },
]
const presetRange = (value: string) => DEFAULT_PRESETS[PERIODS.findIndex((p) => p.value === value)].range()

// Les mocks sont exprimés en mois ("Jan"…) et en semaines ISO ("S38"…) de l'année en cours :
// on les convertit en intervalles de dates pour ne garder que ceux qui recoupent la période.
const overlaps = (start: Date, end: Date, r: DateRange) => start <= r.to && end >= r.from

function isoWeekStart(year: number, week: number) {
  const jan4 = new Date(year, 0, 4)
  const monday = new Date(jan4)
  monday.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7) + (week - 1) * 7)
  return monday
}

// ── Recharts styling helpers ──────────────────────────────────────────────────

const TOOLTIP_STYLE = {
  contentStyle: {
    background:   'rgba(255,255,255,0.97)',
    border:       '1px solid rgba(107,79,224,0.15)',
    borderRadius: '12px',
    boxShadow:    '0 8px 24px rgba(107,79,224,0.12)',
    fontFamily:   'var(--font-sans)',
    fontSize:     '12px',
    color:        '#1a1040',
  },
  itemStyle:  { color: '#6B4FE0', fontWeight: 600 },
  labelStyle: { color: 'rgba(30,15,70,0.7)', marginBottom: '2px' },
  cursor:     { stroke: 'rgba(107,79,224,0.2)', strokeWidth: 1 },
}

const AXIS_TICK = { fontSize: 10, fill: 'rgba(30,15,70,0.62)', fontFamily: 'var(--font-sans)' }

function EmptyChart() {
  return (
    <div className="h-[200px] flex items-center justify-center text-sm text-center px-6"
      style={{ color: 'rgba(30,15,70,0.62)' }}>
      Aucune donnée sur cette période.
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function Analytics() {
  const [range, setRange] = useState<DateRange>(() => presetRange('annee'))
  const period = PERIODS.find((p) => sameRange(presetRange(p.value), range))?.value ?? 'custom'

  // Données mockées pour l'MVP — pas encore branché sur de vraies métriques agrégées.
  // Seules les séries temporelles suivent la période choisie.
  const year = new Date().getFullYear()
  const evolutionOrgs = useMemo(
    () => mockAnalytics.evolutionOrgs.filter((_, i) => overlaps(new Date(year, i, 1), new Date(year, i + 1, 0), range)),
    [range, year]
  )
  const usageSessions = useMemo(
    () => mockAnalytics.usageSessions.filter((s) => {
      const start = isoWeekStart(year, Number(s.semaine.slice(1)))
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      return overlaps(start, end, range)
    }),
    [range, year]
  )
  const heuresPeriode      = usageSessions.reduce((sum, s) => sum + s.heures, 0)
  const repartitionPlans   = mockAnalytics.repartitionPlans
  const tauxRenouvellement = mockAnalytics.tauxRenouvellement
  const churn              = mockAnalytics.churn

  return (
    <div>
      {/* Hidden SVG defs for recharts gradients */}
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="cubiLineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#6B4FE0" />
            <stop offset="100%" stopColor="#E879F9" />
          </linearGradient>
          <linearGradient id="cubiAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#6B4FE0" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#E879F9" stopOpacity={0}    />
          </linearGradient>
          <linearGradient id="cubiAreaStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#6B4FE0" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>
        </defs>
      </svg>

      <PageHeader
        title="Analytics"
        subtitle="Statistiques globales et évolution de la plateforme"
      />

      {/* Period selector : raccourcis + calendrier */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterPills options={PERIODS} value={period} onChange={(v) => setRange(presetRange(v))} />
        <DateRangePicker value={range} onChange={setRange} />
      </div>
      <p className="text-xs mt-2" style={{ color: 'rgba(30,15,70,0.62)' }}>
        Période : {formatRange(range)}
      </p>

      {/* Quick KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 mb-7">
        <MetricCard
          label="Organisations actives"
          value={evolutionOrgs.length > 0 ? evolutionOrgs[evolutionOrgs.length - 1].orgs : '—'}
          sublabel="en fin de période"
        />
        <MetricCard
          label="Heures de session"
          value={usageSessions.length > 0 ? heuresPeriode.toLocaleString('fr-FR') : '—'}
          sublabel="sur la période"
        />
        <MetricCard
          label="Taux de renouvellement"
          value={`${tauxRenouvellement} %`}
          sublabel="12 derniers mois"
        />
        <MetricCard
          label="Churn"
          value={`${churn} %`}
          sublabel="ce trimestre"
        />
      </div>

      {/* Charts — 2×2 grid on desktop, stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* 1. Evolution organisations */}
        <SectionCard title="Évolution des organisations actives">
          {evolutionOrgs.length === 0 ? <EmptyChart /> : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={evolutionOrgs} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,79,224,0.07)" vertical={false} />
              <XAxis dataKey="mois" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} domain={[34, 50]} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Line
                type="monotone"
                dataKey="orgs"
                stroke="url(#cubiLineGrad)"
                strokeWidth={2.5}
                dot={{ fill: '#6B4FE0', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#6B4FE0' }}
                name="Organisations"
              />
            </LineChart>
          </ResponsiveContainer>
          )}
        </SectionCard>

        {/* 2. Usage sessions (heures) */}
        <SectionCard title="Usage cumulé (heures de session / semaine)">
          {usageSessions.length === 0 ? <EmptyChart /> : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={usageSessions} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,79,224,0.07)" vertical={false} />
              <XAxis dataKey="semaine" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Area
                type="monotone"
                dataKey="heures"
                stroke="url(#cubiAreaStroke)"
                fill="url(#cubiAreaFill)"
                strokeWidth={2.5}
                name="Heures"
              />
            </AreaChart>
          </ResponsiveContainer>
          )}
        </SectionCard>

        {/* 3. Répartition par plan (donut) */}
        <SectionCard title="Répartition par plan">
          <div className="flex items-center gap-6 flex-wrap">
            <div style={{ width: 180, height: 180, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={repartitionPlans}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    dataKey="orgs"
                    paddingAngle={3}
                  >
                    {repartitionPlans.map((entry, i) => (
                      <Cell key={i} fill={entry.couleur} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE.contentStyle}
                    itemStyle={TOOLTIP_STYLE.itemStyle}
                    formatter={(val) => [`${val} orgs`]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-3 flex-1">
              {repartitionPlans.map((p) => (
                <div key={p.plan} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.couleur }} />
                    <span className="text-xs font-medium" style={{ color: 'rgba(30,15,70,0.65)' }}>
                      {p.plan}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm" style={{ color: '#1a1040' }}>{p.orgs}</span>
                    <span className="text-xs" style={{ color: 'rgba(30,15,70,0.62)' }}>
                      ({Math.round((p.orgs / repartitionPlans.reduce((a, b) => a + b.orgs, 0)) * 100)} %)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* 4. Taux de renouvellement / Churn */}
        <SectionCard title="Fidélisation">
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.7)' }}>
                  Taux de renouvellement
                </span>
                <span
                  className="font-display font-extrabold text-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #22C55E, #16a34a)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {tauxRenouvellement} %
                </span>
              </div>
              <div
                className="h-3 rounded-full overflow-hidden"
                style={{ background: 'rgba(34,197,94,0.12)' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${tauxRenouvellement}%`,
                    background: 'linear-gradient(90deg, #22C55E, #16a34a)',
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.7)' }}>
                  Taux de churn
                </span>
                <span
                  className="font-display font-extrabold text-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #EF4444, #dc2626)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {churn} %
                </span>
              </div>
              <div
                className="h-3 rounded-full overflow-hidden"
                style={{ background: 'rgba(239,68,68,0.1)' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${churn}%`,
                    background: 'linear-gradient(90deg, #EF4444, #dc2626)',
                  }}
                />
              </div>
            </div>

            <div
              className="text-xs p-3 rounded-xl mt-1"
              style={{ background: 'rgba(34,197,94,0.07)', color: 'rgba(30,15,70,0.7)' }}
            >
              Tendance positive sur 12 mois — le taux de churn est en baisse de 2 points par rapport à l'année précédente.
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
