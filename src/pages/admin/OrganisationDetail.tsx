import { useState }      from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronRight, ChevronDown, ChevronUp,
  CheckCircle2, Info, AlertTriangle, Eye,
} from 'lucide-react'
import { PageHeader }     from '../../components/ui/PageHeader'
import { SectionCard }    from '../../components/ui/SectionCard'
import { Badge }          from '../../components/ui/Badge'
import { ProgressBar }    from '../../components/ui/ProgressBar'
import { DotsPagination } from '../../components/ui/DotsPagination'
import { Modal }          from '../../components/ui/Modal'
import { FilterPills }    from '../../components/ui/FilterPills'
import { Input }          from '../../components/ui/Input'
import { useApi }         from '../../hooks/useApi'
import { api, ENDPOINTS } from '../../api/client'
import type {
  Organisation,
  AdminUser,
  HistoriqueItem,
  OrgStatus,
  HistoType,
  Facture,
} from '../../mocks/data'
import { withOrgDetailMockFallbacks } from '../../mocks/data'

// ── Badge helpers ─────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<OrgStatus, { label: string; variant: 'green' | 'yellow' | 'red' }> = {
  actif:      { label: 'Actif',      variant: 'green'  },
  en_attente: { label: 'En attente', variant: 'yellow' },
  suspendu:   { label: 'Suspendu',   variant: 'red'    },
}

// ── Admin card ────────────────────────────────────────────────────────────────

function AdminCard({ admin }: { admin: AdminUser }) {
  const initials = `${admin.prenom[0]}${admin.nom[0]}`
  return (
    <div
      className="flex-shrink-0 w-48 rounded-xl p-4 text-center"
      style={{
        background: 'linear-gradient(135deg, rgba(107,79,224,0.05), rgba(232,121,249,0.05))',
        border: '1px solid rgba(107,79,224,0.1)',
      }}
    >
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center font-display font-bold text-sm mx-auto mb-2.5"
        style={{
          background: 'linear-gradient(135deg, #6B4FE0, #C084FC)',
          color: '#fff',
        }}
      >
        {initials}
      </div>
      <div className="font-display font-bold text-sm" style={{ color: '#1a1040' }}>
        {admin.prenom} {admin.nom}
      </div>
      <div className="text-xs mt-0.5 font-semibold" style={{ color: '#8B6FF0' }}>{admin.role}</div>
      <div
        className="text-xs mt-1 truncate"
        style={{ color: 'rgba(30,15,70,0.4)' }}
        title={admin.email}
      >
        {admin.email}
      </div>
    </div>
  )
}

// ── Historique row ────────────────────────────────────────────────────────────

const HISTO_ICONS: Record<HistoType, React.ReactNode> = {
  success: <CheckCircle2 size={13} style={{ color: '#16a34a' }} />,
  info:    <Info          size={13} style={{ color: '#0284c7' }} />,
  warning: <AlertTriangle size={13} style={{ color: '#b45309' }} />,
}

const HISTO_BG: Record<HistoType, string> = {
  success: 'rgba(34,197,94,0.1)',
  info:    'rgba(56,189,248,0.1)',
  warning: 'rgba(245,158,11,0.1)',
}

function HistoRow({ item }: { item: HistoriqueItem }) {
  return (
    <div
      className="flex items-start gap-3 py-3"
      style={{ borderBottom: '1px solid rgba(107,79,224,0.07)' }}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: HISTO_BG[item.type] }}
      >
        {HISTO_ICONS[item.type]}
      </div>
      <div className="flex-1">
        <p className="text-sm" style={{ color: '#1a1040' }}>{item.evenement}</p>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(30,15,70,0.38)' }}>{item.date}</p>
      </div>
    </div>
  )
}

// ── Label–value row ───────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="flex items-start justify-between gap-4 py-2.5"
      style={{ borderBottom: '1px solid rgba(107,79,224,0.07)' }}
    >
      <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.45)', minWidth: '120px' }}>
        {label}
      </span>
      <span className="text-sm text-right" style={{ color: '#1a1040' }}>{value}</span>
    </div>
  )
}

// ── Modification modal content ────────────────────────────────────────────────

const MODAL_FILTERS = [
  { value: 'infos',   label: 'Informations' },
  { value: 'contrat', label: 'Contrat'      },
  { value: 'acces',   label: 'Accès admin'  },
]

function ModifyModal({ org, onClose }: { org: Organisation; onClose: () => void }) {
  const [section, setSection] = useState('infos')

  return (
    <>
      <FilterPills options={MODAL_FILTERS} value={section} onChange={setSection} />

      <div className="flex flex-col gap-4 mt-6">
        {section === 'infos' && (
          <>
            <Input label="Nom de l'organisation" defaultValue={org.nom} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Type" defaultValue={org.type === 'ecole' ? 'École' : 'Groupe'} />
              <Input label="Ville" defaultValue={org.ville} />
            </div>
            <Input label="SIRET" defaultValue={org.siret} />
          </>
        )}
        {section === 'contrat' && (
          <>
            <Input label="Plan" defaultValue={org.plan} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Date de début"      defaultValue={org.dateDebut}      />
              <Input label="Date d'expiration"  defaultValue={org.dateExpiration}  />
            </div>
            <Input label="Montant" defaultValue={org.montant} />
          </>
        )}
        {section === 'acces' && (
          <>
            <Input label="Email administrateur principal" type="email" placeholder="admin@organisation.fr" />
            <Input label="Nouveau mot de passe"            type="password" placeholder="••••••••" />
            <Input label="Confirmation"                    type="password" placeholder="••••••••" />
          </>
        )}
      </div>

      <div className="flex gap-3 mt-7">
        <button
          className="btn-primary flex-1"
          onClick={() => api.patch(ENDPOINTS.organisation(org.id), { section }).then(onClose)}
        >
          Enregistrer
        </button>
        <button className="btn-action flex-1" onClick={onClose}>Annuler</button>
      </div>
    </>
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

const ADMINS_PER_PAGE = 2

export function OrganisationDetail() {
  const { id }    = useParams<{ id: string }>()
  const navigate  = useNavigate()

  const { data: rawOrg, loading: loadingOrg, error: errorOrg } = useApi<Organisation>(
    () => api.get<Organisation>(ENDPOINTS.organisation(id ?? '')),
    [id]
  )
  const { data: factures } = useApi<Facture[]>(
    () => api.get<Facture[]>(ENDPOINTS.factures + '?organisation=' + id),
    [id]
  )

  const [showHistory,    setShowHistory]    = useState(false)
  const [showModal,      setShowModal]      = useState(false)
  const [adminPage,      setAdminPage]      = useState(0)
  const [isImpersonating, setIsImpersonating] = useState(false)

  if (loadingOrg) return <Spinner />
  if (errorOrg || !rawOrg) return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>Erreur de chargement</p>
      <p className="text-xs" style={{ color: 'rgba(30,15,70,0.5)' }}>{errorOrg ?? 'Organisation introuvable'}</p>
      <button onClick={() => navigate('/admin/organisations')} className="text-xs font-semibold px-4 py-2 rounded-xl border-none cursor-pointer"
        style={{ background: 'rgba(107,79,224,0.1)', color: '#6B4FE0' }}>Retour</button>
    </div>
  )

  const org         = withOrgDetailMockFallbacks(rawOrg)
  const orgFactures = factures ?? []
  const st          = STATUS_BADGE[org.statut]

  const adminPages  = Math.ceil(org.admins.length / ADMINS_PER_PAGE)
  const visAdmins   = org.admins.slice(adminPage * ADMINS_PER_PAGE, (adminPage + 1) * ADMINS_PER_PAGE)

  return (
    <div>
      {/* Impersonation banner */}
      {isImpersonating && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5"
          style={{
            background: 'linear-gradient(135deg, #6B4FE0 0%, #C084FC 55%, #E879F9 100%)',
            boxShadow: '0 4px 20px rgba(107,79,224,0.3)',
          }}
        >
          <Eye size={16} style={{ color: '#fff', flexShrink: 0 }} />
          <p className="text-sm font-semibold flex-1" style={{ color: '#fff' }}>
            Vous visualisez actuellement l'espace de <strong>{org.nom}</strong> — Mode impersonation
          </p>
          <button
            className="text-xs font-bold px-3 py-1.5 rounded-lg border-none cursor-pointer shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontFamily: 'var(--font-sans)' }}
            onClick={() => setIsImpersonating(false)}
          >
            Quitter
          </button>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs mb-4" style={{ color: 'rgba(30,15,70,0.45)' }}>
        <button
          className="border-none bg-transparent cursor-pointer font-medium transition-colors hover:underline p-0"
          style={{ color: '#6B4FE0', fontFamily: 'var(--font-sans)', fontSize: '12px' }}
          onClick={() => navigate('/admin/organisations')}
        >
          Organisations
        </button>
        <ChevronRight size={12} />
        <span style={{ color: 'rgba(30,15,70,0.6)' }}>{org.nom}</span>
      </div>

      {/* Header */}
      <PageHeader
        title={org.nom}
        subtitle={`${org.type === 'ecole' ? 'École' : 'Groupe'} · ${org.ville}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              className="btn-action text-xs !py-2 !px-3.5 flex items-center gap-1.5"
              onClick={() => setIsImpersonating(true)}
            >
              <Eye size={13} />
              Voir comme cette organisation
            </button>
            <button className="btn-primary !w-auto text-xs !py-2 !px-3.5" onClick={() => setShowModal(true)}>
              Modifier
            </button>
            <button className="btn-action text-xs !py-2 !px-3.5" onClick={() => console.log('suspend', id)}>
              Suspendre
            </button>
            <button className="btn-action text-xs !py-2 !px-3.5" onClick={() => console.log('renew', id)}>
              Renouveler
            </button>
            <button className="btn-danger text-xs !py-2 !px-3.5" onClick={() => api.delete(ENDPOINTS.organisation(id ?? ''))}>
              Supprimer
            </button>
          </div>
        }
      />

      {/* Infos + Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

        {/* Contrat */}
        <SectionCard title="Infos contrat actuel">
          <InfoRow label="Plan"              value={<span className="font-semibold">{org.plan}</span>} />
          <InfoRow label="Date de début"     value={org.dateDebut} />
          <InfoRow label="Expiration"        value={org.dateExpiration} />
          <InfoRow label="Montant"           value={<span className="font-semibold" style={{ color: '#6B4FE0' }}>{org.montant}</span>} />
          <InfoRow label="SIRET"             value={<code className="text-xs" style={{ color: 'rgba(30,15,70,0.55)' }}>{org.siret}</code>} />
          <div className="pt-2.5">
            <Badge variant={st.variant} dot>{st.label}</Badge>
          </div>
        </SectionCard>

        {/* Usage */}
        <SectionCard title="Utilisation">
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { n: org.usage.sessionsMois,  l: 'Sessions ce mois'  },
              { n: org.usage.heuresCumulees, l: 'Heures cumulées'  },
              { n: `${org.usage.tauxUtilisation} %`, l: 'Taux utilisation' },
            ].map(({ n, l }) => (
              <div
                key={l}
                className="rounded-xl p-3 text-center"
                style={{ background: 'linear-gradient(135deg, rgba(107,79,224,0.06), rgba(232,121,249,0.06))', border: '1px solid rgba(107,79,224,0.1)' }}
              >
                <div
                  className="font-display font-extrabold text-xl leading-none"
                  style={{
                    background: 'linear-gradient(135deg, #6B4FE0, #C084FC)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {n}
                </div>
                <div className="text-[10px] mt-1.5 font-medium" style={{ color: 'rgba(30,15,70,0.4)' }}>{l}</div>
              </div>
            ))}
          </div>
          <ProgressBar
            value={org.usage.tauxUtilisation}
            label="Utilisation du quota mensuel"
            valueLabel={`${org.usage.tauxUtilisation} %`}
          />
          <div className="mt-5">
            <InfoRow label="Utilisateurs" value={`${org.nbUtilisateurs} comptes actifs`} />
          </div>
        </SectionCard>
      </div>

      {/* Admins */}
      <SectionCard title="Administrateurs" className="mb-5">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {visAdmins.map((a) => <AdminCard key={a.id} admin={a} />)}
        </div>
        {adminPages > 1 && (
          <div className="mt-4">
            <DotsPagination total={adminPages} current={adminPage} onChange={setAdminPage} showLabel />
          </div>
        )}
      </SectionCard>

      {/* Historique */}
      <SectionCard
        title="Historique"
        action={
          <button
            className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer border-none bg-transparent transition-colors"
            style={{ color: '#6B4FE0', fontFamily: 'var(--font-sans)' }}
            onClick={() => setShowHistory((v) => !v)}
          >
            {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showHistory ? 'Masquer' : 'Afficher'}
          </button>
        }
      >
        {showHistory
          ? (
            <div>
              {org.historique.map((item, i) => (
                <div key={item.id} style={i === org.historique.length - 1 ? { borderBottom: 'none' } : {}}>
                  <HistoRow item={item} />
                </div>
              ))}
            </div>
          )
          : (
            <p className="text-sm" style={{ color: 'rgba(30,15,70,0.38)' }}>
              {org.historique.length} événement{org.historique.length !== 1 ? 's' : ''} enregistré{org.historique.length !== 1 ? 's' : ''} — cliquez sur "Afficher" pour consulter.
            </p>
          )}
      </SectionCard>

      {/* Facturation */}
      <SectionCard title="Facturation" className="mb-5">
        {orgFactures.length > 0 ? (
          <div>
            {orgFactures.map((f, i) => (
              <div
                key={f.id}
                className="flex items-center justify-between py-2.5"
                style={{ borderBottom: i < orgFactures.length - 1 ? '1px solid rgba(107,79,224,0.07)' : 'none' }}
              >
                <div>
                  <span className="text-sm font-medium" style={{ color: '#1a1040' }}>{f.reference}</span>
                  <span className="text-xs ml-2" style={{ color: 'rgba(30,15,70,0.38)' }}>Éch. {f.echeance}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold" style={{ color: '#1a1040' }}>{f.montant}</span>
                  <Badge
                    variant={f.statut === 'payee' ? 'green' : f.statut === 'en_attente' ? 'yellow' : 'red'}
                    dot
                  >
                    {f.statut === 'payee' ? 'Payée' : f.statut === 'en_attente' ? 'En attente' : 'Impayée'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'rgba(30,15,70,0.35)' }}>
            Aucune facture pour cette organisation.
          </p>
        )}
      </SectionCard>

      {/* Modification modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Modification"
        size="lg"
      >
        <ModifyModal org={org} onClose={() => setShowModal(false)} />
      </Modal>
    </div>
  )
}
