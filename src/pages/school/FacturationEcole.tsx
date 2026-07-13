import { useState } from 'react'
import { FileText, Download } from 'lucide-react'
import { SectionCard }    from '../../components/ui/SectionCard'
import { FilterPills }    from '../../components/ui/FilterPills'
import { Badge }          from '../../components/ui/Badge'
import { DotsPagination } from '../../components/ui/DotsPagination'
import { ProgressBar }    from '../../components/ui/ProgressBar'
import { useApi }         from '../../hooks/useApi'
import { api, ENDPOINTS } from '../../api/client'
import type { SchoolOrg, SchoolAccount, SchoolInvoice, InvoiceStatut } from '../../mocks/schoolData'
import { withOrgMockFallbacks, mockSchoolFactures } from '../../mocks/schoolData'

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUT_META: Record<InvoiceStatut, { label: string; variant: 'green' | 'violet' | 'neutral' }> = {
  presentee: { label: 'Présentée', variant: 'green'   },
  en_cours:  { label: 'En cours',  variant: 'violet'  },
  a_venir:   { label: 'À venir',   variant: 'neutral' },
}

const FILTERS = [
  { value: 'all',       label: 'Toutes'     },
  { value: 'presentee', label: 'Présentées' },
  { value: 'en_cours',  label: 'En cours'   },
  { value: 'a_venir',   label: 'À venir'    },
]

const PER_PAGE = 4

// ── Invoice row ───────────────────────────────────────────────────────────────

function InvoiceRow({ invoice }: { invoice: SchoolInvoice }) {
  const meta = STATUT_META[invoice.statut]
  return (
    <div
      className="flex items-center justify-between gap-4 py-3.5 flex-wrap"
      style={{ borderBottom: '1px solid rgba(107,79,224,0.07)' }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'rgba(107,79,224,0.08)' }}
        >
          <FileText size={14} style={{ color: '#6B4FE0' }} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate" style={{ color: '#1a1040' }}>
            {invoice.reference}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'rgba(30,15,70,0.42)' }}>
            Émise le {invoice.date} · Éch. {invoice.echeance}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm font-bold" style={{ color: '#1a1040' }}>{invoice.montant}</span>
        <Badge variant={meta.variant}>{meta.label}</Badge>
        <button
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border-none cursor-pointer"
          style={{ background: 'rgba(107,79,224,0.08)', color: '#6B4FE0', fontFamily: 'var(--font-sans)' }}
          onClick={() => console.log('view-invoice', invoice.id)}
        >
          Voir
        </button>
        <button
          title="Télécharger le PDF"
          className="w-7 h-7 flex items-center justify-center rounded-lg border-none cursor-pointer"
          style={{ background: 'rgba(107,79,224,0.06)', color: '#6B4FE0' }}
          onClick={() => {
            const content = `Facture ${invoice.reference}\nDate: ${invoice.date}\nÉchéance: ${invoice.echeance}\nMontant: ${invoice.montant}`
            const blob = new Blob([content], { type: 'text/plain' })
            const url  = URL.createObjectURL(blob)
            const a    = document.createElement('a')
            a.href = url; a.download = `${invoice.reference}.txt`; a.click()
            URL.revokeObjectURL(url)
          }}
        >
          <Download size={13} />
        </button>
      </div>
    </div>
  )
}

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

export function FacturationEcole() {
  const [filter, setFilter] = useState('all')
  const [page,   setPage]   = useState(0)

  const { data: orgData, loading: loadingOrg } = useApi<SchoolOrg>(
    () => api.get<SchoolOrg>(ENDPOINTS.schoolOrg),
    []
  )
  const { data: facturesData, loading: loadingFactures } = useApi<SchoolInvoice[]>(
    () => api.get<SchoolInvoice[]>(ENDPOINTS.schoolFactures),
    []
  )
  const { data: accountsData, loading: loadingAccounts } = useApi<SchoolAccount[]>(
    () => api.get<SchoolAccount[]>(ENDPOINTS.schoolComptes),
    []
  )

  const loading = loadingOrg || loadingFactures || loadingAccounts

  if (loading) return <Spinner />

  const org = withOrgMockFallbacks(orgData)
  // Aucune facture n'est encore générée côté backend : on retombe sur des
  // données de démonstration tant que l'API ne renvoie rien.
  const allFactures = facturesData && facturesData.length > 0 ? facturesData : mockSchoolFactures
  const allAccounts = accountsData ?? []

  const nbAdmins    = allAccounts.filter((a) => a.type === 'admin').length
  const nbScolarite = allAccounts.filter((a) => a.type === 'scolarite').length
  const nbEleves    = allAccounts.filter((a) => a.type === 'eleve').length

  const tauxLicences = org.nbLicences > 0
    ? Math.round((org.licencesUtilisees / org.nbLicences) * 100)
    : 0

  const filtered =
    filter === 'all'
      ? allFactures
      : allFactures.filter((f) => f.statut === filter)

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const visible    = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)

  return (
    <div>
      {/* Page title */}
      <div className="mb-6">
        <h1 className="font-display font-extrabold text-2xl" style={{ color: '#1a1040', letterSpacing: '-0.5px' }}>
          Facturation
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'rgba(30,15,70,0.45)' }}>
          Contrat et suivi de vos factures
        </p>
      </div>

      {/* Two cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

        {/* Infos contrat */}
        <SectionCard title="Infos contrat actuel">
          {[
            { label: 'Plan',          value: org.plan            },
            { label: 'Date de début', value: org.dateDebut       },
            { label: 'Expiration',    value: org.dateExpiration  },
            { label: 'Tarif',         value: org.montant         },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between py-2.5"
              style={{ borderBottom: '1px solid rgba(107,79,224,0.07)' }}
            >
              <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.45)' }}>{label}</span>
              <span className="text-sm font-medium" style={{ color: '#1a1040' }}>{value}</span>
            </div>
          ))}
        </SectionCard>

        {/* Licences overview */}
        <SectionCard title="Overview licences">
          {/* Licence count */}
          <div className="flex gap-3 mb-4">
            {[
              { label: 'Admins',     value: nbAdmins,    color: '#6B4FE0' },
              { label: 'Scolarité',  value: nbScolarite, color: '#0284c7' },
              { label: 'Élèves',     value: nbEleves,    color: '#C084FC' },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="flex-1 rounded-xl p-3 text-center"
                style={{ background: 'rgba(107,79,224,0.05)', border: '1px solid rgba(107,79,224,0.1)' }}
              >
                <div
                  className="font-display font-extrabold text-xl"
                  style={{
                    background: `linear-gradient(135deg, ${color}, #E879F9)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {value}
                </div>
                <div className="text-[10px] mt-1 font-medium" style={{ color: 'rgba(30,15,70,0.4)' }}>{label}</div>
              </div>
            ))}
          </div>

          <ProgressBar
            value={tauxLicences}
            label={`${org.licencesUtilisees} / ${org.nbLicences} licences utilisées`}
            valueLabel={`${tauxLicences} %`}
          />
        </SectionCard>
      </div>

      {/* Invoice list */}
      <SectionCard
        title="Factures"
        action={
          <FilterPills options={FILTERS} value={filter} onChange={(f) => { setFilter(f); setPage(0) }} />
        }
      >
        <div>
          {visible.map((f) => <InvoiceRow key={f.id} invoice={f} />)}
          {visible.length === 0 && (
            <p className="text-sm text-center py-6" style={{ color: 'rgba(30,15,70,0.35)' }}>
              Aucune facture dans cette catégorie.
            </p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-4">
            <DotsPagination total={totalPages} current={page} onChange={setPage} showLabel />
          </div>
        )}
      </SectionCard>
    </div>
  )
}
