import { UserPlus, Pencil, Trash2, LogIn, FileText, AlertTriangle, AlertCircle, Users, Receipt, Clock } from 'lucide-react'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { useApi } from '../../hooks/useApi'
import { api, ENDPOINTS } from '../../api/client'
import type { SchoolOrg, SchoolAccount, SchoolInvoice, SchoolActivity } from '../../mocks/schoolData'

// ── Fallback org ──────────────────────────────────────────────────────────────

const fallbackSchoolOrg: SchoolOrg = {
  nom: '',
  plan: '',
  dateDebut: '',
  dateExpiration: '',
  montant: '',
  nbLicences: 0,
  licencesUtilisees: 0,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ACTIVITY_ICON: Record<SchoolActivity['type'], React.ReactNode> = {
  compte_cree:    <UserPlus  size={14} />,
  compte_modifie: <Pencil    size={14} />,
  compte_supprime:<Trash2    size={14} />,
  connexion:      <LogIn     size={14} />,
  facture:        <FileText  size={14} />,
}

const ACTIVITY_COLOR: Record<SchoolActivity['type'], string> = {
  compte_cree:    'linear-gradient(135deg, #6B4FE0, #C084FC)',
  compte_modifie: 'linear-gradient(135deg, #0284c7, #38BDF8)',
  compte_supprime:'linear-gradient(135deg, #EF4444, #F97316)',
  connexion:      'linear-gradient(135deg, #10B981, #34D399)',
  facture:        'linear-gradient(135deg, #F59E0B, #FCD34D)',
}

// ── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon, gradient }: {
  label: string; value: string | number; sub?: string
  icon: React.ReactNode; gradient: string
}) {
  return (
    <div
      className="rounded-2xl p-5 flex items-start gap-4"
      style={{
        background: 'rgba(255,255,255,0.92)',
        border: '1px solid rgba(107,79,224,0.1)',
        boxShadow: '0 2px 16px rgba(107,79,224,0.06)',
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white"
        style={{ background: gradient }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(107,79,224,0.5)' }}>
          {label}
        </p>
        <p className="font-display font-extrabold text-xl leading-tight" style={{ color: '#1a1040' }}>
          {value}
        </p>
        {sub && (
          <p className="text-xs mt-0.5" style={{ color: 'rgba(30,15,70,0.4)' }}>{sub}</p>
        )}
      </div>
    </div>
  )
}

// ── Alert banner ──────────────────────────────────────────────────────────────

function AlertBanner({ icon, children, danger }: {
  icon: React.ReactNode; children: React.ReactNode; danger?: boolean
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{
        background: danger ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)',
        border: `1px solid ${danger ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
      }}
    >
      <span style={{ color: danger ? '#EF4444' : '#F59E0B', flexShrink: 0 }}>{icon}</span>
      <p className="text-sm" style={{ color: danger ? '#991B1B' : '#92400E' }}>{children}</p>
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

export function Dashboard() {
  const { data: orgData, loading: loadingOrg } = useApi<SchoolOrg>(
    () => api.get<SchoolOrg>(ENDPOINTS.schoolOrg),
    []
  )
  const { data: accounts, loading: loadingAccounts } = useApi<SchoolAccount[]>(
    () => api.get<SchoolAccount[]>(ENDPOINTS.schoolComptes),
    []
  )
  const { data: facturesData, loading: loadingFactures } = useApi<SchoolInvoice[]>(
    () => api.get<SchoolInvoice[]>(ENDPOINTS.schoolFactures),
    []
  )
  const { data: activityData, loading: loadingActivity } = useApi<SchoolActivity[]>(
    () => api.get<SchoolActivity[]>(ENDPOINTS.schoolActivite),
    []
  )

  const loading = loadingOrg || loadingAccounts || loadingFactures || loadingActivity

  const org = orgData ?? fallbackSchoolOrg
  const allAccounts = accounts ?? []
  const allFactures = facturesData ?? []
  const allActivity = activityData ?? []

  const nbActifs    = allAccounts.filter((a) => a.statut === 'actif').length
  const nbInactifs  = allAccounts.filter((a) => a.statut === 'inactif').length
  const nbAdmins    = allAccounts.filter((a) => a.type === 'admin').length
  const nbScolarite = allAccounts.filter((a) => a.type === 'scolarite').length
  const nbEleves    = allAccounts.filter((a) => a.type === 'eleve').length

  const tauxLicences = org.nbLicences > 0
    ? Math.round((org.licencesUtilisees / org.nbLicences) * 100)
    : 0

  const prochaineFacture = allFactures.find((f) => f.statut === 'a_venir')
  const firstAccount = allAccounts[0]

  if (loading) return <Spinner />

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1
          className="font-display font-extrabold text-2xl"
          style={{ color: '#1a1040', letterSpacing: '-0.5px' }}
        >
          Bonjour, {firstAccount?.prenom ?? ''} 👋
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'rgba(30,15,70,0.45)' }}>
          Voici l'état actuel de votre établissement — {org.nom}
        </p>
      </div>

      {/* Alertes */}
      {(tauxLicences >= 80 || true) && (
        <div className="flex flex-col gap-2 mb-5">
          {tauxLicences >= 80 && (
            <AlertBanner icon={<AlertCircle size={16} />} danger={tauxLicences >= 95}>
              <strong>{org.licencesUtilisees}/{org.nbLicences} licences utilisées</strong> —{' '}
              {tauxLicences >= 95
                ? 'Vos licences sont presque épuisées. Contactez CUBI pour en acquérir davantage.'
                : 'Vous approchez la limite de vos licences. Pensez à anticiper un renouvellement.'}
            </AlertBanner>
          )}
          <AlertBanner icon={<AlertTriangle size={16} />}>
            Votre contrat expire le <strong>{org.dateExpiration}</strong>. Contactez votre référent CUBI pour le renouveler.
          </AlertBanner>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard
          label="Licences"
          value={`${org.licencesUtilisees}/${org.nbLicences}`}
          sub={`${tauxLicences}% utilisées`}
          icon={<Receipt size={16} />}
          gradient="linear-gradient(135deg, #6B4FE0, #C084FC)"
        />
        <KpiCard
          label="Comptes actifs"
          value={nbActifs}
          sub={`${nbInactifs} inactif${nbInactifs > 1 ? 's' : ''}`}
          icon={<Users size={16} />}
          gradient="linear-gradient(135deg, #10B981, #34D399)"
        />
        <KpiCard
          label="Prochaine facture"
          value={prochaineFacture ? prochaineFacture.montant : '—'}
          sub={prochaineFacture ? `Éch. ${prochaineFacture.echeance}` : 'Aucune à venir'}
          icon={<FileText size={16} />}
          gradient="linear-gradient(135deg, #F59E0B, #FCD34D)"
        />
        <KpiCard
          label="Fin de contrat"
          value={org.dateExpiration}
          sub={org.plan}
          icon={<Clock size={16} />}
          gradient="linear-gradient(135deg, #E879F9, #C084FC)"
        />
      </div>

      {/* Licence bar */}
      <div
        className="rounded-2xl p-5 mb-5"
        style={{
          background: 'rgba(255,255,255,0.92)',
          border: '1px solid rgba(107,79,224,0.1)',
          boxShadow: '0 2px 16px rgba(107,79,224,0.06)',
        }}
      >
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(107,79,224,0.5)' }}>
          Utilisation des licences
        </p>
        <ProgressBar
          value={tauxLicences}
          label={`${org.licencesUtilisees} licences attribuées sur ${org.nbLicences}`}
          valueLabel={`${tauxLicences} %`}
        />
        <div className="flex gap-3 mt-4">
          {[
            { label: 'Admins',    value: nbAdmins,    color: '#6B4FE0' },
            { label: 'Scolarité', value: nbScolarite, color: '#0284c7' },
            { label: 'Élèves',    value: nbEleves,    color: '#C084FC' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="flex-1 rounded-xl p-3 text-center"
              style={{ background: 'rgba(107,79,224,0.04)', border: '1px solid rgba(107,79,224,0.08)' }}
            >
              <div
                className="font-display font-extrabold text-lg"
                style={{
                  background: `linear-gradient(135deg, ${color}, #E879F9)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {value}
              </div>
              <div className="text-[10px] font-medium mt-0.5" style={{ color: 'rgba(30,15,70,0.4)' }}>
                {label}
              </div>
            </div>
          ))}
          <div
            className="flex-1 rounded-xl p-3 text-center"
            style={{ background: 'rgba(107,79,224,0.04)', border: '1px solid rgba(107,79,224,0.08)' }}
          >
            <div
              className="font-display font-extrabold text-lg"
              style={{
                background: 'linear-gradient(135deg, #6B4FE0, #E879F9)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {org.nbLicences - org.licencesUtilisees}
            </div>
            <div className="text-[10px] font-medium mt-0.5" style={{ color: 'rgba(30,15,70,0.4)' }}>
              Disponibles
            </div>
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: 'rgba(255,255,255,0.92)',
          border: '1px solid rgba(107,79,224,0.1)',
          boxShadow: '0 2px 16px rgba(107,79,224,0.06)',
        }}
      >
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(107,79,224,0.5)' }}>
          Activité récente
        </p>
        <div className="flex flex-col gap-0">
          {allActivity.map((act, i) => (
            <div
              key={act.id}
              className="flex items-start gap-3 py-3"
              style={{ borderBottom: i < allActivity.length - 1 ? '1px solid rgba(107,79,224,0.06)' : 'none' }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white mt-0.5"
                style={{ background: ACTIVITY_COLOR[act.type] }}
              >
                {ACTIVITY_ICON[act.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: '#1a1040' }}>
                  {act.description}
                </p>
                {act.actor && (
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(30,15,70,0.4)' }}>
                    par {act.actor}
                  </p>
                )}
              </div>
              <span className="text-[10px] font-medium shrink-0 mt-1" style={{ color: 'rgba(30,15,70,0.35)' }}>
                {act.date}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
