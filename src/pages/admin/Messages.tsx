import { useState } from 'react'
import { PageHeader }  from '../../components/ui/PageHeader'
import { FilterPills } from '../../components/ui/FilterPills'
import { Modal }       from '../../components/ui/Modal'
import { ConversationRow, ConversationThreadView } from '../../components/ui/Conversation'
import { useApi }        from '../../hooks/useApi'
import { useAuth }       from '../../contexts/AuthContext'
import { api, ENDPOINTS } from '../../api/client'
import type { Conversation, ConversationThread } from '../../mocks/data'

// ── Filter options ─────────────────────────────────────────────────────────────

const FILTERS = [
  { value: 'all',     label: 'Toutes'   },
  { value: 'non_lu',  label: 'Non lues' },
  { value: 'ouverte', label: 'Ouvertes' },
  { value: 'traitee', label: 'Traitées' },
]

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

export function Messages() {
  const { user } = useAuth()
  const [filter,     setFilter]     = useState('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data, loading, error, refetch } = useApi<Conversation[]>(
    () => api.get<Conversation[]>(ENDPOINTS.messages),
    []
  )
  const conversations = data ?? []
  const readOnly = user?.role === 'lecture'

  const unreadCount = conversations.filter((c) => c.nonLu).length

  const filtered = conversations.filter((c) => {
    if (filter === 'all')    return true
    if (filter === 'non_lu') return c.nonLu
    return c.statut === filter
  })

  // Le spinner plein écran ne s'affiche qu'au premier chargement, pour ne pas
  // fermer le fil ouvert quand la liste se rafraîchit.
  if (loading && !data) return <Spinner />
  if (error && !data) return (
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
        title="Messages"
        subtitle={`Conversations avec les organisations · ${unreadCount} non lue${unreadCount !== 1 ? 's' : ''}`}
      />

      <FilterPills options={FILTERS} value={filter} onChange={setFilter} />

      <div className="flex items-center mt-5 mb-4">
        <span className="text-sm font-semibold" style={{ color: 'rgba(30,15,70,0.6)' }}>
          {filtered.length} conversation{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((c) => (
          <ConversationRow key={c.id} conv={c} viewer="cubi" onClick={() => setSelectedId(c.id)} />
        ))}
        {filtered.length === 0 && (
          <div
            className="rounded-2xl py-12 text-center text-sm"
            style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(107,79,224,0.08)', color: 'rgba(30,15,70,0.35)' }}
          >
            {conversations.length === 0
              ? "Aucune conversation pour l'instant. Les messages envoyés par les organisations apparaîtront ici."
              : 'Aucune conversation dans cette catégorie.'}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selectedId}
        onClose={() => setSelectedId(null)}
        title="Conversation"
        size="lg"
      >
        {selectedId && (
          <ConversationThreadView
            key={selectedId}
            viewer="cubi"
            readOnly={readOnly}
            fetchThread={() => api.get<ConversationThread>(ENDPOINTS.message(selectedId))}
            sendReply={(contenu) => api.post(ENDPOINTS.messageReponse(selectedId), { contenu })}
            onChange={refetch}
            actions={readOnly ? undefined : (thread, reload) => {
              const next = thread.statut === 'traitee' ? 'ouverte' : 'traitee'
              return (
                <button
                  className="btn-action flex-1"
                  onClick={() => api.patch(ENDPOINTS.message(thread.id), { statut: next }).then(() => { reload(); refetch() })}
                >
                  {next === 'traitee' ? 'Marquer comme traitée' : 'Rouvrir'}
                </button>
              )
            }}
          />
        )}
      </Modal>
    </div>
  )
}
