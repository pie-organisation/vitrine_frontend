import { useEffect, useRef, useState } from 'react'
import { ListCard } from './ListCard'
import { Badge }    from './Badge'
import { useApi }   from '../../hooks/useApi'
import type { AuteurType, Conversation, ConversationThread } from '../../mocks/data'

// Messagerie organisations <-> équipe Cubi, partagée par /admin/messages et /school/messages.
// `viewer` indique de quel côté on regarde : ses propres messages sont alignés à droite.

// ── Ligne de liste ────────────────────────────────────────────────────────────

export function ConversationRow({ conv, viewer, onClick }: { conv: Conversation; viewer: AuteurType; onClick: () => void }) {
  // Côté Cubi on identifie d'abord l'organisation ; côté organisation, l'objet suffit.
  const title    = viewer === 'cubi' ? conv.organisation : conv.objet
  const subtitle = viewer === 'cubi' ? conv.objet : `${conv.nbMessages} message${conv.nbMessages !== 1 ? 's' : ''}`
  const prefix   = conv.dernierAuteur === viewer ? 'Vous : ' : ''

  return (
    <ListCard onClick={onClick}>
      <div className="flex items-start gap-3.5">
        <div className="flex items-center justify-center pt-1 w-3 shrink-0">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: conv.nonLu ? '#6B4FE0' : 'rgba(107,79,224,0.15)' }}
          />
        </div>

        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0"
          style={{ background: 'linear-gradient(135deg, rgba(107,79,224,0.1), rgba(232,121,249,0.1))', color: '#6B4FE0' }}
        >
          {title[0]?.toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div
                className="font-display text-sm truncate"
                style={{ color: '#1a1040', fontWeight: conv.nonLu ? 700 : 500 }}
              >
                {title}
              </div>
              <div className="text-xs truncate mt-0.5" style={{ color: 'rgba(30,15,70,0.45)' }}>
                {subtitle}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-[10px] mt-0.5" style={{ color: 'rgba(30,15,70,0.35)' }}>{conv.date}</span>
              {conv.statut === 'traitee' && <Badge variant="green">Traitée</Badge>}
            </div>
          </div>
          <div
            className="text-xs mt-1.5 truncate"
            style={{ color: conv.nonLu ? '#1a1040' : 'rgba(30,15,70,0.38)', fontWeight: conv.nonLu ? 600 : 400 }}
          >
            {prefix}{conv.dernierMessage.split('\n')[0]}
          </div>
        </div>
      </div>
    </ListCard>
  )
}

// ── Fil de discussion + réponse ───────────────────────────────────────────────

interface ConversationThreadViewProps {
  viewer:      AuteurType
  fetchThread: () => Promise<ConversationThread>
  sendReply:   (contenu: string) => Promise<unknown>
  /** Appelé après lecture ou envoi, pour rafraîchir la liste (compteurs non lus). */
  onChange:    () => void
  /** Actions supplémentaires sous la zone de réponse (ex. statut côté Cubi). */
  actions?:    (thread: ConversationThread, reload: () => void) => React.ReactNode
  /** Désactive la réponse (ex. rôle Cubi en lecture seule). */
  readOnly?:   boolean
}

export function ConversationThreadView({ viewer, fetchThread, sendReply, onChange, actions, readOnly }: ConversationThreadViewProps) {
  const { data: thread, loading, error, refetch } = useApi<ConversationThread>(fetchThread, [])
  const [reply,     setReply]     = useState('')
  const [sending,   setSending]   = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // L'ouverture du fil le marque comme lu côté backend : on rafraîchit la liste.
  useEffect(() => {
    if (thread) onChange()
  }, [thread?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [thread?.messages.length])

  const handleSend = async () => {
    if (!reply.trim()) return
    setSending(true)
    setSendError(null)
    try {
      await sendReply(reply)
      setReply('')
      refetch()
      onChange()
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Le message n'a pas pu être envoyé.")
    } finally {
      setSending(false)
    }
  }

  if (!thread) {
    if (loading) return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 rounded-full border-2 animate-spin"
          style={{ borderColor: 'rgba(107,79,224,0.2)', borderTopColor: '#6B4FE0' }} />
      </div>
    )
    return <p className="text-sm py-8 text-center" style={{ color: '#dc2626' }}>{error ?? 'Conversation introuvable.'}</p>
  }

  return (
    <div>
      <div className="mb-4">
        <div className="font-display font-bold text-base" style={{ color: '#1a1040' }}>{thread.objet}</div>
        {viewer === 'cubi' && (
          <div className="text-xs mt-0.5" style={{ color: 'rgba(30,15,70,0.45)' }}>{thread.organisation}</div>
        )}
      </div>

      {/* Messages */}
      <div
        className="flex flex-col gap-3 max-h-[45vh] overflow-y-auto rounded-xl p-3 mb-4"
        style={{ background: 'rgba(107,79,224,0.03)', border: '1px solid rgba(107,79,224,0.08)' }}
      >
        {thread.messages.map((m) => {
          const mine = m.auteurType === viewer
          return (
            <div key={m.id} className={`flex flex-col max-w-[85%] ${mine ? 'self-end items-end' : 'self-start items-start'}`}>
              <div className="text-[10px] mb-1 px-1" style={{ color: 'rgba(30,15,70,0.4)' }}>
                {mine ? 'Vous' : m.auteurNom}{m.auteurType === 'cubi' && !mine ? ' · Équipe Cubi' : ''} · {m.date}
              </div>
              <div
                className="rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words"
                style={mine
                  ? { background: 'linear-gradient(135deg, #6B4FE0, #8B6FF0)', color: '#fff' }
                  : { background: '#fff', border: '1px solid rgba(107,79,224,0.1)', color: 'rgba(30,15,70,0.8)' }}
              >
                {m.contenu}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Réponse */}
      {!readOnly && (
        <div className="flex flex-col gap-2 mb-4">
          <textarea
            className="cubi-input !h-24 resize-none text-sm leading-relaxed"
            placeholder="Écrivez votre réponse…"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          />
          {sendError && <p className="text-xs" style={{ color: '#dc2626' }}>{sendError}</p>}
        </div>
      )}

      <div className="flex gap-3">
        {!readOnly && (
          <button className="btn-primary flex-1" disabled={sending || !reply.trim()} onClick={handleSend}>
            {sending ? 'Envoi…' : 'Envoyer'}
          </button>
        )}
        {actions?.(thread, refetch)}
      </div>
    </div>
  )
}
