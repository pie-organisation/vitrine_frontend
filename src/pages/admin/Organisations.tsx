import { useState }      from 'react'
import { useNavigate }   from 'react-router-dom'
import { ChevronRight, Plus } from 'lucide-react'
import { PageHeader }    from '../../components/ui/PageHeader'
import { ExportButton }  from '../../components/ui/ExportButton'
import { FilterPills }   from '../../components/ui/FilterPills'
import { SearchBar }     from '../../components/ui/SearchBar'
import { ListCard }      from '../../components/ui/ListCard'
import { Badge }         from '../../components/ui/Badge'
import { DotsPagination } from '../../components/ui/DotsPagination'
import { useApi }          from '../../hooks/useApi'
import { api, ENDPOINTS }  from '../../api/client'
import type { Organisation, OrgStatus, OrgType } from '../../mocks/data'
import { withOrgListMockFallbacks } from '../../mocks/data'

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<OrgStatus, { label: string; variant: 'green' | 'yellow' | 'red' }> = {
  actif:      { label: 'Actif',      variant: 'green'  },
  en_attente: { label: 'En attente', variant: 'yellow' },
  suspendu:   { label: 'Suspendu',   variant: 'red'    },
}

const TYPE_BADGE: Record<OrgType, { label: string; variant: 'blue' | 'violet' }> = {
  ecole:  { label: 'École',  variant: 'blue'   },
  groupe: { label: 'Groupe', variant: 'violet' },
}

// ── Organisation row card ─────────────────────────────────────────────────────

function OrgRow({ org, onClick }: { org: Organisation; onClick: () => void }) {
  const st = STATUS_BADGE[org.statut]
  const ty = TYPE_BADGE[org.type]

  return (
    <ListCard onClick={onClick}>
      <div className="flex items-center justify-between gap-4">
        {/* Left: avatar + name */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-base shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(107,79,224,0.1), rgba(232,121,249,0.1))',
              color: '#6B4FE0',
            }}
          >
            {org.nom[0]}
          </div>
          <div className="min-w-0">
            <div
              className="font-display font-bold text-sm truncate"
              style={{ color: '#1a1040' }}
            >
              {org.nom}
            </div>
            <div
              className="text-xs mt-0.5"
              style={{ color: 'rgba(30,15,70,0.42)' }}
            >
              {ty.label} · {org.ville}
            </div>
          </div>
        </div>

        {/* Right: badges + arrow */}
        <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
          <Badge variant={st.variant} dot>{st.label}</Badge>
          <Badge variant={ty.variant}>{org.plan.split(' — ')[0]}</Badge>
          <Badge variant="neutral">{org.nbUtilisateurs} utilis.</Badge>
          <Badge variant="neutral">Exp. {org.dateExpiration}</Badge>
          <ChevronRight size={15} style={{ color: 'rgba(107,79,224,0.3)' }} />
        </div>
      </div>
    </ListCard>
  )
}

// ── Filter options ─────────────────────────────────────────────────────────────

const FILTERS = [
  { value: 'all',       label: 'Toutes'     },
  { value: 'ecole',     label: 'Écoles'     },
  { value: 'groupe',    label: 'Groupes'    },
  { value: 'actif',     label: 'Actives'    },
  { value: 'suspendu',  label: 'Suspendues' },
]

const PER_PAGE = 4

// ── Loading / Error helpers ───────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-7 h-7 rounded-full border-2 animate-spin"
        style={{ borderColor: 'rgba(107,79,224,0.2)', borderTopColor: '#6B4FE0' }} />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function Organisations() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page,   setPage]   = useState(0)

  const { data: orgs, loading, error, refetch } = useApi<Organisation[]>(
    () => api.get<Organisation[]>(ENDPOINTS.organisations),
    []
  )

  const handleFilter = (f: string) => { setFilter(f); setPage(0) }
  const handleSearch = (s: string) => { setSearch(s); setPage(0) }

  const filtered = withOrgListMockFallbacks(orgs).filter((org) => {
    const matchFilter =
      filter === 'all'   ||
      org.type   === filter  ||
      org.statut === filter
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      org.nom.toLowerCase().includes(q) ||
      org.ville.toLowerCase().includes(q) ||
      org.plan.toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const visible    = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)

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
        title="Organisations"
        subtitle="Gestion des structures clientes CUBI"
        actions={
          <div className="flex gap-2 items-center">
            <ExportButton filename="organisations" />
            <button
              className="btn-primary !w-auto flex items-center gap-1.5 text-sm !py-2.5 !px-4"
              onClick={() => console.log('nouvelle organisation')}
            >
              <Plus size={15} />
              Nouvelle organisation
            </button>
          </div>
        }
      />

      {/* Filters */}
      <FilterPills options={FILTERS} value={filter} onChange={handleFilter} />

      {/* Count + search */}
      <div className="flex items-center justify-between mt-5 mb-3">
        <span
          className="text-sm font-semibold"
          style={{ color: 'rgba(30,15,70,0.6)' }}
        >
          {filtered.length} organisation{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="mb-5">
        <SearchBar
          placeholder="Rechercher une organisation, une ville…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="flex flex-col gap-2.5">
        {visible.length > 0
          ? visible.map((org) => (
              <OrgRow
                key={org.id}
                org={org}
                onClick={() => navigate(`/admin/organisations/${org.id}`)}
              />
            ))
          : (
            <div
              className="rounded-2xl py-12 text-center text-sm"
              style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(107,79,224,0.08)', color: 'rgba(30,15,70,0.35)' }}
            >
              Aucune organisation ne correspond à votre recherche.
            </div>
          )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <DotsPagination
            total={totalPages}
            current={page}
            onChange={setPage}
            showLabel
          />
        </div>
      )}
    </div>
  )
}
