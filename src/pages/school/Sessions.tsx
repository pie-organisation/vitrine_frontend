import { useState } from 'react'
import { Wifi, AlertTriangle, Monitor, XCircle } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Badge }      from '../../components/ui/Badge'
import { useApi }        from '../../hooks/useApi'
import { api, ENDPOINTS } from '../../api/client'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Session {
  id:             string
  nomUtilisateur: string
  role:           string
  heureDebut:     string
  duree:          string
  statut:         'active' | 'terminee' | 'expiree'
  anomalie:       boolean
  ip:             string
  appareilOs:     string
  typeSession:    string
}

const ROLE_LABEL: Record<string, string> = {
  eleve:      'Élève',
  enseignant: 'Enseignant',
  admin:      'Admin',
}

// Données d'exemple affichées tant qu'aucune vraie session n'existe encore
// (le endpoint /school/sessions est réel, mais vide sur une école toute neuve).
const MOCK_SESSIONS: Session[] = [
  { id: 'mock-1', nomUtilisateur: 'Sophie Martin',  role: 'eleve',      heureDebut: '08:34', duree: '2h14', statut: 'active',   anomalie: false, ip: '91.198.174.12', appareilOs: 'Windows 11', typeSession: 'normale' },
  { id: 'mock-2', nomUtilisateur: 'Karim Belaid',   role: 'enseignant', heureDebut: '09:01', duree: '1h52', statut: 'active',   anomalie: false, ip: '185.220.101.3', appareilOs: 'macOS',      typeSession: 'normale' },
  { id: 'mock-3', nomUtilisateur: 'Lucas Petit',    role: 'eleve',      heureDebut: '07:58', duree: '9h07', statut: 'active',   anomalie: true,  ip: '81.23.45.111',  appareilOs: 'Android',    typeSession: 'normale' },
  { id: 'mock-4', nomUtilisateur: 'Nathalie Simon',  role: 'admin',      heureDebut: 'hier 16:22', duree: '0h43', statut: 'terminee', anomalie: false, ip: '81.23.45.112',  appareilOs: 'Windows 11', typeSession: 'normale' },
]

// ── Row ───────────────────────────────────────────────────────────────────────

function SessionRow({ session, onTerminate }: { session: Session; onTerminate: () => void }) {
  const isActive  = session.statut === 'active'
  const isMockRow = session.id.startsWith('mock-')
  const iconColor = session.anomalie ? '#EF4444' : isActive ? '#22C55E' : 'rgba(30,15,70,0.35)'

  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5"
      style={
        session.anomalie
          ? { background: 'rgba(239,68,68,0.04)', borderBottom: '1px solid rgba(239,68,68,0.12)' }
          : { borderBottom: '1px solid rgba(107,79,224,0.07)' }
      }
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${iconColor}1A`, color: iconColor }}
      >
        {session.anomalie ? <AlertTriangle size={16} /> : <Wifi size={16} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-display font-bold text-sm" style={{ color: '#1a1040' }}>
            {session.nomUtilisateur}
          </span>
          <Badge variant="neutral">{ROLE_LABEL[session.role] ?? session.role}</Badge>
          {session.anomalie && <Badge variant="red">Anomalie</Badge>}
          {isActive && !session.anomalie && <Badge variant="green" dot>En cours</Badge>}
          {!isActive && <Badge variant="neutral">Terminée</Badge>}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs" style={{ color: 'rgba(30,15,70,0.45)' }}>
          <span>Début {session.heureDebut}</span>
          <span>· Durée {session.duree}</span>
          <span className="flex items-center gap-1"><Monitor size={11} /> {session.appareilOs}</span>
          <span className="font-mono">{session.ip}</span>
        </div>
      </div>

      {isActive && !isMockRow && (
        <button
          onClick={onTerminate}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border-none cursor-pointer shrink-0"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', fontFamily: 'var(--font-sans)' }}
        >
          <XCircle size={13} />
          Terminer
        </button>
      )}
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

export function Sessions() {
  const [filter, setFilter] = useState<'all' | 'active' | 'anomalie'>('all')
  const [actionError, setActionError] = useState<string | null>(null)

  const { data, loading, error, refetch } = useApi<Session[]>(
    () => api.get<Session[]>(ENDPOINTS.schoolSessions),
    []
  )
  const all = data && data.length > 0 ? data : MOCK_SESSIONS
  const isMock = !data || data.length === 0

  const filtered = all.filter((s) => {
    if (filter === 'active')   return s.statut === 'active'
    if (filter === 'anomalie') return s.anomalie
    return true
  })

  const activeCount   = all.filter((s) => s.statut === 'active').length
  const anomalieCount = all.filter((s) => s.anomalie).length

  const handleTerminate = (id: string) => {
    setActionError(null)
    api.delete(ENDPOINTS.schoolSession(id))
      .then(refetch)
      .catch((e) => setActionError(e instanceof Error ? e.message : 'Erreur lors de la fermeture de la session.'))
  }

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
        title="Sessions"
        subtitle={`${activeCount} session${activeCount !== 1 ? 's' : ''} en cours`}
        actions={
          anomalieCount > 0 ? (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626' }}
            >
              <AlertTriangle size={13} />
              {anomalieCount} anomalie{anomalieCount > 1 ? 's' : ''}
            </div>
          ) : undefined
        }
      />

      {isMock && (
        <div
          className="rounded-xl px-4 py-3 text-sm mb-4"
          style={{ background: 'rgba(107,79,224,0.06)', border: '1px solid rgba(107,79,224,0.15)', color: '#6B4FE0' }}
        >
          Aucune session réelle pour le moment — exemples affichés en attendant que vos utilisateurs se connectent.
        </div>
      )}

      {actionError && (
        <div
          className="rounded-xl px-4 py-3 text-sm mb-4 flex items-center justify-between gap-3"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626' }}
        >
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="text-xs font-semibold border-none bg-transparent cursor-pointer shrink-0"
            style={{ color: '#dc2626' }}
          >
            Fermer
          </button>
        </div>
      )}

      <div className="flex gap-1.5 flex-wrap mb-4">
        {[
          { value: 'all' as const,      label: 'Toutes'    },
          { value: 'active' as const,   label: 'En cours'  },
          { value: 'anomalie' as const, label: 'Anomalies' },
        ].map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border-none cursor-pointer transition-all"
            style={{
              background: filter === f.value ? 'linear-gradient(135deg, #6B4FE0, #C084FC)' : 'rgba(255,255,255,0.85)',
              color: filter === f.value ? '#fff' : 'rgba(30,15,70,0.55)',
              border: filter === f.value ? 'none' : '1px solid rgba(107,79,224,0.12)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(107,79,224,0.1)', boxShadow: '0 2px 16px rgba(107,79,224,0.04)' }}
      >
        {filtered.length > 0
          ? filtered.map((s) => (
              <SessionRow key={s.id} session={s} onTerminate={() => handleTerminate(s.id)} />
            ))
          : (
            <p className="text-sm text-center py-8" style={{ color: 'rgba(30,15,70,0.35)' }}>
              Aucune session ne correspond aux filtres appliqués.
            </p>
          )}
      </div>
    </div>
  )
}
