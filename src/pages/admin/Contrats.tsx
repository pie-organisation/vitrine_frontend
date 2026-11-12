import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { PageHeader }     from '../../components/ui/PageHeader'
import { FilterPills }    from '../../components/ui/FilterPills'
import { ListCard }       from '../../components/ui/ListCard'
import { DotsPagination } from '../../components/ui/DotsPagination'
import { Spinner, ErrorState, EmptyState } from '../../components/ui/AsyncState'
import { ContratStatutBadge } from '../../components/documents/StatusBadges'
import { useApi } from '../../hooks/useApi'
import { contratsApi, formatDate, formatCentimes, type Contrat, type ContratsPage } from '../../api/documents'

const FILTERS = [
  { value: '',          label: 'Tous'       },
  { value: 'brouillon', label: 'Brouillons' },
  { value: 'envoye',    label: 'Envoyés'    },
  { value: 'signe',     label: 'Signés'     },
  { value: 'expire',    label: 'Expirés'    },
  { value: 'annule',    label: 'Annulés'    },
]

function ContratRow({ contrat, onOpen }: { contrat: Contrat; onOpen: () => void }) {
  const mensuel = contrat.quantiteTotale * contrat.prixUnitaireCentimes
  return (
    <ListCard onClick={onOpen}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-sm shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(107,79,224,0.1), rgba(232,121,249,0.1))', color: '#6B4FE0' }}>
            {contrat.organisation?.[0] ?? '?'}
          </div>
          <div className="min-w-0">
            <div className="font-display font-bold text-sm truncate" style={{ color: '#1a1040' }}>{contrat.organisation}</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(30,15,70,0.62)' }}>
              {contrat.numero} · {contrat.offre} · {contrat.quantiteTotale} utilisateur{contrat.quantiteTotale > 1 ? 's' : ''}
              {contrat.type === 'groupe' ? ` · ${contrat.etablissements.length} établissements` : ''}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end shrink-0">
          <div className="text-right">
            <div className="text-sm font-semibold" style={{ color: '#1a1040' }}>{formatCentimes(mensuel)} HT/mois</div>
            <div className="text-xs" style={{ color: 'rgba(30,15,70,0.62)' }}>
              {contrat.dateSignatureClient ? `Signé le ${formatDate(contrat.dateSignatureClient)}` : `Créé le ${formatDate(contrat.dateCreation)}`}
            </div>
          </div>
          <ContratStatutBadge statut={contrat.statut} />
          <ChevronRight size={16} style={{ color: 'rgba(107,79,224,0.5)' }} />
        </div>
      </div>
    </ListCard>
  )
}

export function Contrats() {
  const navigate = useNavigate()
  const [statut, setStatut] = useState('')
  const [page,   setPage]   = useState(1)

  const { data, loading, error, refetch } = useApi<ContratsPage>(
    () => contratsApi.list(statut || undefined, page),
    [statut, page],
  )

  const totalPages = data ? Math.max(1, Math.ceil(data.total / (data.parPage || 20))) : 1

  return (
    <div>
      <PageHeader
        title="Contrats"
        subtitle="Contrats générés à la validation des demandes, envoyés pour signature électronique"
      />

      <FilterPills options={FILTERS} value={statut} onChange={(v) => { setStatut(v); setPage(1) }} />

      {loading ? <Spinner /> : error ? <ErrorState message={error} onRetry={refetch} /> : data && (
        <>
          <div className="flex items-center mt-5 mb-4">
            <span className="text-sm font-semibold" style={{ color: 'rgba(30,15,70,0.7)' }}>
              {data.total} contrat{data.total !== 1 ? 's' : ''}
            </span>
          </div>

          {data.items.length === 0 ? (
            <EmptyState
              title={statut ? 'Aucun contrat avec ce statut.' : 'Aucun contrat pour le moment.'}
              hint={statut ? undefined : 'Un contrat brouillon est créé à chaque validation de demande d\'inscription.'}
            />
          ) : (
            <div className="flex flex-col gap-2.5">
              {data.items.map((c) => (
                <ContratRow key={c.id} contrat={c} onOpen={() => navigate(`/admin/contrats/${c.id}`)} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6">
              <DotsPagination total={totalPages} current={page - 1} onChange={(i) => setPage(i + 1)} showLabel />
            </div>
          )}
        </>
      )}
    </div>
  )
}
