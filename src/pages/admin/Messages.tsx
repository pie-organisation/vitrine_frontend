import { useState } from 'react'
import { PageHeader }  from '../../components/ui/PageHeader'
import { FilterPills } from '../../components/ui/FilterPills'
import { ListCard }    from '../../components/ui/ListCard'
import { Modal }       from '../../components/ui/Modal'
import { useApi }        from '../../hooks/useApi'
import { api, ENDPOINTS } from '../../api/client'
import type { Message } from '../../mocks/data'

// ── Filter options ─────────────────────────────────────────────────────────────

const FILTERS = [
  { value: 'all',    label: 'Tous'     },
  { value: 'non_lu', label: 'Non lus'  },
  { value: 'traite', label: 'Traités'  },
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

// ── Message row ───────────────────────────────────────────────────────────────

function MessageRow({ msg, onClick }: { msg: Message; onClick: () => void }) {
  const isUnread = msg.statut === 'non_lu'
  return (
    <ListCard onClick={onClick}>
      <div className="flex items-start gap-3.5">
        {/* Unread dot */}
        <div className="flex items-center justify-center pt-1 w-3 shrink-0">
          {isUnread ? (
            <div className="w-2 h-2 rounded-full" style={{ background: '#6B4FE0' }} />
          ) : (
            <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(107,79,224,0.15)' }} />
          )}
        </div>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0"
          style={{ background: 'linear-gradient(135deg, rgba(107,79,224,0.1), rgba(232,121,249,0.1))', color: '#6B4FE0' }}
        >
          {msg.expediteur[0]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div
                className="font-display text-sm truncate"
                style={{ color: '#1a1040', fontWeight: isUnread ? 700 : 500 }}
              >
                {msg.expediteur}
              </div>
              <div className="text-xs truncate mt-0.5" style={{ color: 'rgba(30,15,70,0.45)' }}>
                {msg.email}
              </div>
            </div>
            <span className="text-[10px] shrink-0 mt-0.5" style={{ color: 'rgba(30,15,70,0.35)' }}>
              {msg.date}
            </span>
          </div>
          <div
            className="text-xs mt-1.5 font-semibold truncate"
            style={{ color: isUnread ? '#1a1040' : 'rgba(30,15,70,0.55)' }}
          >
            {msg.objet}
          </div>
          <div
            className="text-xs mt-0.5 truncate"
            style={{ color: 'rgba(30,15,70,0.38)' }}
          >
            {msg.contenu.split('\n')[0]}
          </div>
        </div>
      </div>
    </ListCard>
  )
}

// ── Detail modal ──────────────────────────────────────────────────────────────

function MessageDetailModal({ msg, onClose, onTreated }: { msg: Message; onClose: () => void; onTreated: () => void }) {
  const [reply, setReply] = useState('')

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #6B4FE0, #C084FC)', color: '#fff' }}
          >
            {msg.expediteur[0]}
          </div>
          <div>
            <div className="font-display font-bold text-sm" style={{ color: '#1a1040' }}>{msg.expediteur}</div>
            <a
              href={`mailto:${msg.email}`}
              className="text-xs no-underline"
              style={{ color: '#6B4FE0' }}
            >
              {msg.email}
            </a>
          </div>
          <span className="ml-auto text-xs shrink-0 mt-1" style={{ color: 'rgba(30,15,70,0.35)' }}>{msg.date}</span>
        </div>
        <div className="font-display font-bold text-base" style={{ color: '#1a1040' }}>{msg.objet}</div>
      </div>

      {/* Body */}
      <div
        className="rounded-xl p-4 mb-5 text-sm leading-relaxed whitespace-pre-wrap"
        style={{ background: 'rgba(107,79,224,0.04)', border: '1px solid rgba(107,79,224,0.08)', color: 'rgba(30,15,70,0.75)' }}
      >
        {msg.contenu}
      </div>

      {/* Reply */}
      <div className="flex flex-col gap-2 mb-5">
        <label className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.6)', fontFamily: 'var(--font-sans)' }}>
          Réponse rapide
        </label>
        <textarea
          className="cubi-input !h-24 resize-none text-sm leading-relaxed"
          placeholder="Écrivez votre réponse…"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
        />
      </div>

      <div className="flex gap-3">
        <button
          className="btn-primary flex-1"
          onClick={() => { api.patch(ENDPOINTS.message(msg.id), { statut: 'traite', reply }).then(() => { onTreated(); onClose() }) }}
        >
          Envoyer la réponse
        </button>
        {msg.statut === 'non_lu' && (
          <button
            className="btn-action flex-1"
            onClick={() => { api.patch(ENDPOINTS.message(msg.id), { statut: 'traite' }).then(() => { onTreated(); onClose() }) }}
          >
            Marquer comme traité
          </button>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function Messages() {
  const [filter,     setFilter]     = useState('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data: messages, loading, error, refetch } = useApi<Message[]>(
    () => api.get<Message[]>(ENDPOINTS.messages),
    []
  )
  const allMessages = messages ?? []

  const unreadCount = allMessages.filter((m) => m.statut === 'non_lu').length

  const filtered = allMessages.filter((m) => {
    if (filter === 'all') return true
    return m.statut === filter
  })

  const selected = allMessages.find((m) => m.id === selectedId) ?? null

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
        title="Messages de contact"
        subtitle={`${unreadCount} message${unreadCount !== 1 ? 's' : ''} non lu${unreadCount !== 1 ? 's' : ''}`}
      />

      <FilterPills options={FILTERS} value={filter} onChange={setFilter} />

      <div className="flex items-center mt-5 mb-4">
        <span className="text-sm font-semibold" style={{ color: 'rgba(30,15,70,0.6)' }}>
          {filtered.length} message{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((m) => (
          <MessageRow key={m.id} msg={m} onClick={() => setSelectedId(m.id)} />
        ))}
        {filtered.length === 0 && (
          <div
            className="rounded-2xl py-12 text-center text-sm"
            style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(107,79,224,0.08)', color: 'rgba(30,15,70,0.35)' }}
          >
            Aucun message dans cette catégorie.
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelectedId(null)}
        title="Message"
        size="lg"
      >
        {selected && (
          <MessageDetailModal msg={selected} onClose={() => setSelectedId(null)} onTreated={refetch} />
        )}
      </Modal>
    </div>
  )
}
