import { useState } from 'react'
import { Pencil, X } from 'lucide-react'
import { SectionCard } from '../../components/ui/SectionCard'
import { Input }       from '../../components/ui/Input'
import { useApi }      from '../../hooks/useApi'
import { api, ENDPOINTS } from '../../api/client'
import type { SchoolContact } from '../../mocks/schoolData'
import { withContactMockFallbacks } from '../../mocks/schoolData'

// ── Read-only row ─────────────────────────────────────────────────────────────

function ContactRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex items-start justify-between gap-4 py-3"
      style={{ borderBottom: '1px solid rgba(107,79,224,0.07)' }}
    >
      <span className="text-xs font-bold uppercase tracking-wider shrink-0" style={{ color: 'rgba(107,79,224,0.5)', minWidth: '150px' }}>
        {label}
      </span>
      <span className="text-sm text-right" style={{ color: '#1a1040' }}>{value}</span>
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

export function Contact() {
  const [editing, setEditing] = useState(false)

  const { data, loading, error, refetch } = useApi<SchoolContact>(
    () => api.get<SchoolContact>(ENDPOINTS.schoolContact),
    []
  )

  const contact = withContactMockFallbacks(data)

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
    <div className="max-w-xl">
      {/* Page title */}
      <div className="mb-6">
        <h1 className="font-display font-extrabold text-2xl" style={{ color: '#1a1040', letterSpacing: '-0.5px' }}>
          Contact
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'rgba(30,15,70,0.45)' }}>
          Informations du référent de votre établissement
        </p>
      </div>

      {/* Read mode */}
      {!editing && (
        <SectionCard
          title="Données contact"
          action={
            <button
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border-none cursor-pointer"
              style={{ background: 'rgba(107,79,224,0.08)', color: '#6B4FE0', fontFamily: 'var(--font-sans)' }}
              onClick={() => setEditing(true)}
            >
              <Pencil size={12} /> Modifier
            </button>
          }
        >
          <ContactRow label="Nom"                     value={contact.nom}              />
          <ContactRow label="Prénom"                  value={contact.prenom}           />
          <ContactRow label="E-mail"                  value={contact.email}            />
          <ContactRow label="Boîte de facturation"    value={contact.boiteFacturation} />
          <ContactRow label="Téléphone"               value={contact.telephone}        />
        </SectionCard>
      )}

      {/* Edit mode */}
      {editing && (
        <SectionCard
          title="Données contact modifiables"
          action={
            <button
              className="w-7 h-7 flex items-center justify-center rounded-lg border-none cursor-pointer"
              style={{ background: 'rgba(107,79,224,0.07)', color: '#6B4FE0' }}
              onClick={() => setEditing(false)}
            >
              <X size={14} />
            </button>
          }
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nom"    defaultValue={contact.nom}    />
              <Input label="Prénom" defaultValue={contact.prenom} />
            </div>
            <Input label="E-mail"                  defaultValue={contact.email}            type="email" />
            <Input label="Boîte de facturation"    defaultValue={contact.boiteFacturation} type="email" />
            <Input label="Téléphone"               defaultValue={contact.telephone}        type="tel"   />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              className="btn-primary flex-1"
              onClick={() => api.patch(ENDPOINTS.schoolContact, contact).then(() => { refetch(); setEditing(false) })}
            >
              Enregistrer
            </button>
            <button className="btn-action flex-1" onClick={() => setEditing(false)}>
              Annuler
            </button>
          </div>
        </SectionCard>
      )}
    </div>
  )
}
