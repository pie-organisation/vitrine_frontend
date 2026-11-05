import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Modal }    from '../../components/ui/Modal'
import { Input }    from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { ConversationRow, ConversationThreadView } from '../../components/ui/Conversation'
import { useApi }   from '../../hooks/useApi'
import { api, ENDPOINTS } from '../../api/client'
import type { Conversation, ConversationThread } from '../../mocks/data'

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-7 h-7 rounded-full border-2 animate-spin"
        style={{ borderColor: 'rgba(107,79,224,0.2)', borderTopColor: '#6B4FE0' }} />
    </div>
  )
}

// ── Nouvelle conversation ─────────────────────────────────────────────────────

function NewConversationForm({ onCreated }: { onCreated: (id: string) => void }) {
  const [objet,   setObjet]   = useState('')
  const [contenu, setContenu] = useState('')
  const [sending, setSending] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError(null)
    try {
      const { id } = await api.post<{ id: string }>(ENDPOINTS.schoolMessages, { objet, contenu })
      onCreated(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Le message n'a pas pu être envoyé.")
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Objet"
        placeholder="Ex : Question sur notre facturation"
        maxLength={255}
        value={objet}
        onChange={(e) => setObjet(e.target.value)}
        required
      />
      <Textarea
        label="Message"
        placeholder="Décrivez votre demande à l'équipe Cubi…"
        maxLength={5000}
        value={contenu}
        onChange={(e) => setContenu(e.target.value)}
        required
      />
      {error && <p className="text-xs" style={{ color: '#dc2626' }}>{error}</p>}
      <button type="submit" className="btn-primary" disabled={sending || !objet.trim() || !contenu.trim()}>
        {sending ? 'Envoi…' : 'Envoyer'}
      </button>
    </form>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function Messages() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [creating,   setCreating]   = useState(false)

  const { data, loading, error, refetch } = useApi<Conversation[]>(
    () => api.get<Conversation[]>(ENDPOINTS.schoolMessages),
    []
  )
  const conversations = data ?? []
  const unreadCount = conversations.filter((c) => c.nonLu).length

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
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-extrabold text-2xl" style={{ color: '#1a1040', letterSpacing: '-0.5px' }}>
            Messages
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(30,15,70,0.45)' }}>
            Échangez avec l'équipe Cubi
            {unreadCount > 0 && ` · ${unreadCount} réponse${unreadCount !== 1 ? 's' : ''} non lue${unreadCount !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border-none cursor-pointer"
          style={{ background: '#6B4FE0', color: '#fff', fontFamily: 'var(--font-sans)' }}
          onClick={() => setCreating(true)}
        >
          <Plus size={14} /> Nouveau message
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {conversations.map((c) => (
          <ConversationRow key={c.id} conv={c} viewer="ecole" onClick={() => setSelectedId(c.id)} />
        ))}
        {conversations.length === 0 && (
          <div
            className="rounded-2xl py-12 px-6 text-center text-sm"
            style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(107,79,224,0.08)', color: 'rgba(30,15,70,0.45)' }}
          >
            Aucune conversation pour l'instant. Une question ? Écrivez à l'équipe Cubi avec « Nouveau message ».
          </div>
        )}
      </div>

      <Modal isOpen={creating} onClose={() => setCreating(false)} title="Nouveau message" size="lg">
        <NewConversationForm
          onCreated={(id) => { setCreating(false); refetch(); setSelectedId(id) }}
        />
      </Modal>

      <Modal isOpen={!!selectedId} onClose={() => setSelectedId(null)} title="Conversation" size="lg">
        {selectedId && (
          <ConversationThreadView
            key={selectedId}
            viewer="ecole"
            fetchThread={() => api.get<ConversationThread>(ENDPOINTS.schoolMessage(selectedId))}
            sendReply={(contenu) => api.post(ENDPOINTS.schoolMessageReponse(selectedId), { contenu })}
            onChange={refetch}
          />
        )}
      </Modal>
    </div>
  )
}
