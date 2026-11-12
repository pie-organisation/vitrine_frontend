import { useState } from 'react'
import { FileText, FileSignature, FileMinus2 } from 'lucide-react'
import { SectionCard }    from '../../components/ui/SectionCard'
import { FilterPills }    from '../../components/ui/FilterPills'
import { DotsPagination } from '../../components/ui/DotsPagination'
import { ProgressBar }    from '../../components/ui/ProgressBar'
import { Spinner, ErrorState } from '../../components/ui/AsyncState'
import { InvoiceStatutBadge, ContratStatutBadge } from '../../components/documents/StatusBadges'
import { PdfButton }      from '../../components/documents/PdfButton'
import { useApi }         from '../../hooks/useApi'
import { api, ENDPOINTS } from '../../api/client'
import {
  schoolDocumentsApi, formatDate,
  type SchoolInvoice, type SchoolContrat,
} from '../../api/documents'
import type { SchoolOrg, SchoolAccount } from '../../mocks/schoolData'
import { withOrgMockFallbacks } from '../../mocks/schoolData'

// ── Helpers ───────────────────────────────────────────────────────────────────

const FILTERS = [
  { value: 'all',       label: 'Toutes'    },
  { value: 'en_cours',  label: 'À régler'  },
  { value: 'presentee', label: 'Réglées'   },
  { value: 'avoir',     label: 'Avoirs'    },
  { value: 'annulee',   label: 'Annulées'  },
]

const PER_PAGE = 6

const estAvoir = (f: SchoolInvoice) => f.type === 'avoir' || f.statut === 'avoir'

// ── Contrat ───────────────────────────────────────────────────────────────────

function ContratRow({ contrat }: { contrat: SchoolContrat }) {
  const signe = contrat.statut === 'signe'
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 flex-wrap"
      style={{ borderBottom: '1px solid rgba(107,79,224,0.07)' }}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(107,79,224,0.08)' }}>
          <FileSignature size={14} style={{ color: '#6B4FE0' }} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate" style={{ color: '#1a1040' }}>
            Contrat {contrat.numero} · {contrat.offre}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'rgba(30,15,70,0.62)' }}>
            {contrat.quantiteTotale} utilisateur{contrat.quantiteTotale > 1 ? 's' : ''} · début {formatDate(contrat.dateDebut)} · {contrat.dureeMois} mois
            {signe && contrat.dateSignature ? ` · signé le ${formatDate(contrat.dateSignature)}` : ''}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <ContratStatutBadge statut={contrat.statut} />
        {contrat.pdfDisponible && (
          <PdfButton
            iconOnly
            fetchBlob={() => schoolDocumentsApi.contratPdf(contrat.id)}
            filename={`${contrat.numero}${signe ? '-signe' : ''}.pdf`}
            label={`Télécharger le contrat ${contrat.numero}`}
          />
        )}
      </div>
    </div>
  )
}

// ── Facture / avoir ───────────────────────────────────────────────────────────

function InvoiceRow({ invoice }: { invoice: SchoolInvoice }) {
  const avoir = estAvoir(invoice)
  const Icon = avoir ? FileMinus2 : FileText
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 flex-wrap"
      style={{ borderBottom: '1px solid rgba(107,79,224,0.07)' }}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: avoir ? 'rgba(192,132,252,0.12)' : 'rgba(107,79,224,0.08)' }}>
          <Icon size={14} style={{ color: '#6B4FE0' }} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate" style={{ color: '#1a1040' }}>
            {avoir ? 'Avoir' : 'Facture'} {invoice.reference}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'rgba(30,15,70,0.62)' }}>
            {avoir
              ? <>Émis le {invoice.date}{invoice.factureOrigine ? <> · corrige la facture <strong>{invoice.factureOrigine}</strong></> : null}</>
              : <>Émise le {invoice.date} · Éch. {invoice.echeance}
                  {invoice.periodeDebut ? ` · période ${formatDate(invoice.periodeDebut)} → ${formatDate(invoice.periodeFin)}` : ''}</>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm font-bold tabular-nums" style={{ color: '#1a1040' }}>{invoice.montant}</span>
        <InvoiceStatutBadge statut={invoice.statut} />
        <PdfButton
          iconOnly
          fetchBlob={() => schoolDocumentsApi.facturePdf(invoice.id)}
          filename={`${invoice.reference}.pdf`}
          label={`Télécharger ${invoice.reference}`}
        />
      </div>
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
  const { data: accountsData, loading: loadingAccounts } = useApi<SchoolAccount[]>(
    () => api.get<SchoolAccount[]>(ENDPOINTS.schoolComptes),
    []
  )
  const factures = useApi<SchoolInvoice[]>(() => schoolDocumentsApi.factures(), [])
  const contrats = useApi<SchoolContrat[]>(() => schoolDocumentsApi.contrats(), [])

  if (loadingOrg || loadingAccounts) return <Spinner />

  const org = withOrgMockFallbacks(orgData)
  const allAccounts = accountsData ?? []
  const allFactures = factures.data ?? []

  const nbAdmins    = allAccounts.filter((a) => a.type === 'admin').length
  const nbScolarite = allAccounts.filter((a) => a.type === 'scolarite').length
  const nbEleves    = allAccounts.filter((a) => a.type === 'eleve').length

  const tauxLicences = org.nbLicences > 0
    ? Math.round((org.licencesUtilisees / org.nbLicences) * 100)
    : 0

  const filtered = filter === 'all' ? allFactures : allFactures.filter((f) => f.statut === filter)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const visible    = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)

  return (
    <div>
      {/* Page title */}
      <div className="mb-6">
        <h1 className="font-display font-extrabold text-2xl" style={{ color: '#1a1040', letterSpacing: '-0.5px' }}>
          Facturation et documents
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'rgba(30,15,70,0.62)' }}>
          Votre contrat, vos factures et vos avoirs
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
              <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.62)' }}>{label}</span>
              <span className="text-sm font-medium" style={{ color: '#1a1040' }}>{value}</span>
            </div>
          ))}
        </SectionCard>

        {/* Jetons overview */}
        <SectionCard title="Overview jetons">
          <div className="flex gap-3 mb-4">
            {[
              { label: 'Admins',     value: nbAdmins,    color: '#6B4FE0' },
              { label: 'Scolarité',  value: nbScolarite, color: '#0369a1' },
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
                <div className="text-[10px] mt-1 font-medium" style={{ color: 'rgba(30,15,70,0.62)' }}>{label}</div>
              </div>
            ))}
          </div>

          <ProgressBar
            value={tauxLicences}
            label={`${org.licencesUtilisees} / ${org.nbLicences} jetons utilisés`}
            valueLabel={`${tauxLicences} %`}
          />
        </SectionCard>
      </div>

      {/* Contrats */}
      <SectionCard title="Contrats" className="mb-6">
        {contrats.loading ? <Spinner /> : contrats.error ? (
          <ErrorState compact message={contrats.error} onRetry={contrats.refetch} />
        ) : (contrats.data ?? []).length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: 'rgba(30,15,70,0.62)' }}>Aucun contrat disponible.</p>
        ) : (
          <div>{contrats.data!.map((c) => <ContratRow key={c.id} contrat={c} />)}</div>
        )}
      </SectionCard>

      {/* Factures et avoirs */}
      <SectionCard
        title="Factures"
        action={
          <FilterPills options={FILTERS} value={filter} onChange={(f) => { setFilter(f); setPage(0) }} />
        }
      >
        {factures.loading ? <Spinner /> : factures.error ? (
          <ErrorState compact message={factures.error} onRetry={factures.refetch} />
        ) : (
          <>
            <div>
              {visible.map((f) => <InvoiceRow key={f.id} invoice={f} />)}
              {visible.length === 0 && (
                <p className="text-sm text-center py-6" style={{ color: 'rgba(30,15,70,0.62)' }}>
                  {allFactures.length === 0
                    ? 'Aucune facture pour le moment. La première est émise à la signature du contrat.'
                    : 'Aucune facture dans cette catégorie.'}
                </p>
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-4">
                <DotsPagination total={totalPages} current={page} onChange={setPage} showLabel />
              </div>
            )}
          </>
        )}
      </SectionCard>
    </div>
  )
}
