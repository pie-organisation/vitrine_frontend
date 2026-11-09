import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { PageHeader }  from '../../components/ui/PageHeader'
import { FilterPills } from '../../components/ui/FilterPills'
import { Modal }       from '../../components/ui/Modal'
import { Input }       from '../../components/ui/Input'
import { Textarea }    from '../../components/ui/Textarea'
import { SearchBar }   from '../../components/ui/SearchBar'
import { ConversationRow, ConversationThreadView } from '../../components/ui/Conversation'
import { useApi }        from '../../hooks/useApi'
import { useAuth }       from '../../contexts/AuthContext'
import { api, ENDPOINTS } from '../../api/client'
import posthog from '../../posthog'
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

// ── Nouvelle conversation (l'équipe Cubi écrit à une organisation) ───────────

interface ClientMessagerie {
  id:     string
  nom:    string
  ville:  string
  statut: string
  email:  string | null
}

function NewConversationForm({ initialEcoleId, onCreated }: { initialEcoleId: string | null; onCreated: (id: string) => void }) {
  const { data: clients, loading, error: loadError } = useApi<ClientMessagerie[]>(
    () => api.get<ClientMessagerie[]>(ENDPOINTS.messageClients),
    []
  )
  const [query,   setQuery]   = useState('')
  const [ecoleId, setEcoleId] = useState<string | null>(initialEcoleId)
  const [objet,   setObjet]   = useState('')
  const [contenu, setContenu] = useState('')
  const [sending, setSending] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const list     = clients ?? []
  const selected = list.find((c) => c.id === ecoleId) ?? null
  const q        = query.trim().toLowerCase()
  const matches  = list.filter((c) =>
    !q || [c.nom, c.ville, c.email ?? ''].some((v) => v.toLowerCase().includes(q)))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ecoleId) return
    setSending(true)
    setError(null)
    try {
      const { id } = await api.post<{ id: string }>(ENDPOINTS.messages, { ecoleId, objet, contenu })
      posthog.capture('admin_conversation_started')
      onCreated(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Le message n'a pas pu être envoyé.")
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.6)' }}>Organisation</span>
        {selected ? (
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5"
            style={{ background: 'rgba(107,79,224,0.06)', border: '1px solid rgba(107,79,224,0.15)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0"
              style={{ background: 'linear-gradient(135deg, #6B4FE0, #C084FC)', color: '#fff' }}>
              {selected.nom[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate" style={{ color: '#1a1040' }}>{selected.nom}</div>
              <div className="text-xs truncate" style={{ color: 'rgba(30,15,70,0.45)' }}>
                {selected.ville}{selected.email ? ` · ${selected.email}` : ''}
              </div>
            </div>
            <button type="button" className="text-xs font-semibold border-none bg-transparent cursor-pointer"
              style={{ color: '#6B4FE0' }} onClick={() => setEcoleId(null)}>
              Changer
            </button>
          </div>
        ) : (
          <>
            <SearchBar placeholder="Rechercher une organisation…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <div className="flex flex-col gap-1 max-h-56 overflow-y-auto rounded-xl p-1"
              style={{ border: '1px solid rgba(107,79,224,0.1)' }}>
              {loading && <p className="text-xs p-3" style={{ color: 'rgba(30,15,70,0.45)' }}>Chargement…</p>}
              {loadError && <p className="text-xs p-3" style={{ color: '#dc2626' }}>{loadError}</p>}
              {!loading && !loadError && matches.length === 0 && (
                <p className="text-xs p-3" style={{ color: 'rgba(30,15,70,0.45)' }}>Aucune organisation trouvée.</p>
              )}
              {matches.map((c) => (
                <button key={c.id} type="button" onClick={() => setEcoleId(c.id)}
                  className="flex items-center gap-3 text-left rounded-lg px-3 py-2 border-none cursor-pointer bg-transparent hover:bg-[rgba(107,79,224,0.06)]">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-[11px] shrink-0"
                    style={{ background: 'rgba(107,79,224,0.1)', color: '#6B4FE0' }}>
                    {c.nom[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm truncate" style={{ color: '#1a1040' }}>{c.nom}</div>
                    <div className="text-[11px] truncate" style={{ color: 'rgba(30,15,70,0.45)' }}>
                      {c.ville}{c.email ? ` · ${c.email}` : ''}
                    </div>
                  </div>
                  {c.statut !== 'actif' && (
                    <span className="text-[10px] shrink-0" style={{ color: 'rgba(30,15,70,0.4)' }}>{c.statut}</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <Input
        label="Objet"
        placeholder="Ex : Renouvellement de votre licence"
        maxLength={255}
        value={objet}
        onChange={(e) => setObjet(e.target.value)}
        required
      />
      <Textarea
        label="Message"
        placeholder="Écrivez votre message à l'organisation…"
        maxLength={5000}
        value={contenu}
        onChange={(e) => setContenu(e.target.value)}
        required
      />
      {error && <p className="text-xs" style={{ color: '#dc2626' }}>{error}</p>}
      <button type="submit" className="btn-primary" disabled={sending || !ecoleId || !objet.trim() || !contenu.trim()}>
        {sending ? 'Envoi…' : 'Envoyer'}
      </button>
    </form>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function Messages() {
  const { user } = useAuth()
  const [filter,     setFilter]     = useState('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // /admin/messages?ecole=<id> ouvre directement un nouveau message pour cette organisation
  const [searchParams, setSearchParams] = useSearchParams()
  const ecoleParam = searchParams.get('ecole')
  const [creating, setCreating] = useState(!!ecoleParam)
  const closeCreate = () => {
    setCreating(false)
    if (ecoleParam) setSearchParams({}, { replace: true })
  }

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
      <p className="text-xs" style={{ color: 'rgba(30,15,70,0.7)' }}>{error}</p>
      <button onClick={refetch} className="text-xs font-semibold px-4 py-2 rounded-xl border-none cursor-pointer"
        style={{ background: 'rgba(107,79,224,0.1)', color: '#6B4FE0' }}>Réessayer</button>
    </div>
  )

  return (
    <div>
      <PageHeader
        title="Messages"
        subtitle={`Conversations avec les organisations · ${unreadCount} non lue${unreadCount !== 1 ? 's' : ''}`}
        actions={readOnly ? undefined : (
          <button
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border-none cursor-pointer"
            style={{ background: '#6B4FE0', color: '#fff', fontFamily: 'var(--font-sans)' }}
            onClick={() => setCreating(true)}
          >
            <Plus size={14} /> Nouveau message
          </button>
        )}
      />

      <FilterPills options={FILTERS} value={filter} onChange={setFilter} />

      <div className="flex items-center mt-5 mb-4">
        <span className="text-sm font-semibold" style={{ color: 'rgba(30,15,70,0.7)' }}>
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
            style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(107,79,224,0.08)', color: 'rgba(30,15,70,0.62)' }}
          >
            {conversations.length === 0
              ? "Aucune conversation pour l'instant. Écrivez à une organisation avec « Nouveau message »."
              : 'Aucune conversation dans cette catégorie.'}
          </div>
        )}
      </div>

      <Modal isOpen={creating && !readOnly} onClose={closeCreate} title="Nouveau message" size="lg">
        {creating && (
          <NewConversationForm
            initialEcoleId={ecoleParam}
            onCreated={(id) => { closeCreate(); refetch(); setSelectedId(id) }}
          />
        )}
      </Modal>

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
