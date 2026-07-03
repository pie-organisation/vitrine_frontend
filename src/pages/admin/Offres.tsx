import { useState } from 'react'
import { Plus, Pencil, CheckCircle2 } from 'lucide-react'
import { PageHeader }  from '../../components/ui/PageHeader'
import { ListCard }    from '../../components/ui/ListCard'
import { Badge }       from '../../components/ui/Badge'
import { Modal }       from '../../components/ui/Modal'
import { Input }       from '../../components/ui/Input'
import { SectionCard } from '../../components/ui/SectionCard'
import { useApi }        from '../../hooks/useApi'
import { api, ENDPOINTS } from '../../api/client'
import type { Offre, OffreStatut } from '../../mocks/data'

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUT_BADGE: Record<OffreStatut, { label: string; variant: 'green' | 'neutral' }> = {
  publiee:  { label: 'Publiée',  variant: 'green'   },
  brouillon:{ label: 'Brouillon',variant: 'neutral'  },
}

// ── Offre row card ────────────────────────────────────────────────────────────

function OffreRow({ offre, onEdit }: { offre: Offre; onEdit: () => void }) {
  const st = STATUT_BADGE[offre.statut]
  return (
    <ListCard>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-extrabold text-base shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6B4FE0 0%, #C084FC 55%, #E879F9 100%)',
              color: '#fff',
            }}
          >
            {offre.populaire ? '★' : offre.nom[0]}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-display font-bold text-sm" style={{ color: '#1a1040' }}>{offre.nom}</span>
              {offre.populaire && <Badge variant="violet">Populaire</Badge>}
              <Badge variant={st.variant}>{st.label}</Badge>
            </div>
            <p className="text-xs" style={{ color: 'rgba(30,15,70,0.45)' }}>{offre.tagline}</p>
            <div className="flex flex-wrap gap-3 mt-2">
              <span className="text-xs font-semibold" style={{ color: '#6B4FE0' }}>{offre.prix}</span>
              <span className="text-xs" style={{ color: 'rgba(30,15,70,0.4)' }}>·</span>
              <span className="text-xs" style={{ color: 'rgba(30,15,70,0.4)' }}>
                {offre.features.length} fonctionnalités
              </span>
            </div>
          </div>
        </div>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg border-none cursor-pointer shrink-0"
          style={{ background: 'rgba(107,79,224,0.07)', color: '#6B4FE0' }}
          onClick={onEdit}
          title="Modifier"
        >
          <Pencil size={14} />
        </button>
      </div>
    </ListCard>
  )
}

// ── Edit modal ────────────────────────────────────────────────────────────────

function EditOffreModal({ offre, onClose }: { offre: Offre; onClose: () => void }) {
  const [features, setFeatures] = useState(offre.features)
  const [publiee,  setPubliee]  = useState(offre.statut === 'publiee')

  const updateFeature = (i: number, val: string) => {
    const next = [...features]; next[i] = val; setFeatures(next)
  }

  return (
    <div className="flex flex-col gap-4">
      <Input label="Nom de l'offre"  defaultValue={offre.nom}     />
      <Input label="Tagline"         defaultValue={offre.tagline}  />
      <Input label="Prix affiché"    defaultValue={offre.prix}     />

      <div>
        <p className="text-xs font-semibold mb-2.5" style={{ color: 'rgba(30,15,70,0.6)', fontFamily: 'var(--font-sans)' }}>
          Fonctionnalités incluses
        </p>
        <div className="flex flex-col gap-2">
          {features.map((f, i) => (
            <Input
              key={i}
              label={`Fonctionnalité ${i + 1}`}
              value={f}
              onChange={(e) => updateFeature(i, e.target.value)}
            />
          ))}
        </div>
      </div>

      {/* Toggle publish */}
      <div className="flex items-center justify-between py-3 px-4 rounded-xl" style={{ background: 'rgba(107,79,224,0.05)', border: '1px solid rgba(107,79,224,0.1)' }}>
        <div>
          <div className="text-sm font-semibold" style={{ color: '#1a1040' }}>Publiée sur le site</div>
          <div className="text-xs mt-0.5" style={{ color: 'rgba(30,15,70,0.45)' }}>
            {publiee ? "Visible par tous les visiteurs" : "Masquée du site vitrine"}
          </div>
        </div>
        <button
          role="switch"
          aria-checked={publiee}
          className="relative inline-flex items-center rounded-full border-none cursor-pointer transition-all duration-200 shrink-0"
          style={{ width: '36px', height: '20px', background: publiee ? 'linear-gradient(135deg, #6B4FE0, #C084FC)' : 'rgba(107,79,224,0.15)' }}
          onClick={() => setPubliee((v) => !v)}
        >
          <span
            className="absolute rounded-full bg-white transition-all duration-200"
            style={{ width: '14px', height: '14px', left: publiee ? '19px' : '3px', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
          />
        </button>
      </div>

      <div className="flex gap-3 mt-3">
        <button
          className="btn-primary flex-1"
          onClick={() => api.patch(ENDPOINTS.offre(offre.id), { statut: publiee ? 'publiee' : 'brouillon', features }).then(onClose)}
        >
          Enregistrer
        </button>
        <button className="btn-action flex-1" onClick={onClose}>Annuler</button>
      </div>
    </div>
  )
}

// ── Pricing card preview ──────────────────────────────────────────────────────

function PricingCard({ offre }: { offre: Offre }) {
  const isHighlight = offre.populaire === true

  return (
    <div
      className="flex-1 rounded-2xl p-6 flex flex-col"
      style={
        isHighlight
          ? {
              background: 'linear-gradient(135deg, #6B4FE0 0%, #8B6FF0 40%, #C084FC 80%, #E879F9 100%)',
              boxShadow: '0 20px 60px rgba(107,79,224,0.3)',
              minWidth: '220px',
            }
          : {
              background: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(107,79,224,0.12)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              minWidth: '220px',
            }
      }
    >
      {isHighlight && (
        <div
          className="inline-flex self-start items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold mb-3"
          style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
        >
          ★ Populaire
        </div>
      )}
      <h3
        className="font-display font-bold text-base mb-1"
        style={{ color: isHighlight ? '#fff' : '#1a1040' }}
      >
        {offre.nom}
      </h3>
      <p
        className="text-xs mb-4 leading-relaxed"
        style={{ color: isHighlight ? 'rgba(255,255,255,0.75)' : 'rgba(30,15,70,0.5)' }}
      >
        {offre.tagline}
      </p>
      <div
        className="font-display font-extrabold text-3xl mb-5"
        style={
          isHighlight
            ? { color: '#fff' }
            : {
                background: 'linear-gradient(135deg, #6B4FE0, #C084FC)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }
        }
      >
        {offre.prix}
      </div>
      <ul className="flex flex-col gap-2 mb-6 flex-1">
        {offre.features.map((f, i) => (
          <li
            key={i}
            className="flex items-center gap-2 text-xs"
            style={{ color: isHighlight ? 'rgba(255,255,255,0.9)' : 'rgba(30,15,70,0.7)' }}
          >
            <CheckCircle2
              size={13}
              style={{ color: isHighlight ? '#fff' : '#22C55E', flexShrink: 0 }}
            />
            {f}
          </li>
        ))}
      </ul>
      <button
        className="w-full py-2.5 rounded-xl font-semibold text-sm border-none cursor-pointer"
        style={
          isHighlight
            ? { background: '#fff', color: '#6B4FE0', fontFamily: 'var(--font-sans)' }
            : { background: 'rgba(107,79,224,0.08)', color: '#6B4FE0', fontFamily: 'var(--font-sans)' }
        }
        onClick={() => console.log('subscribe', offre.id)}
      >
        {offre.prix === 'Sur devis' ? 'Nous contacter' : "S'inscrire"}
      </button>
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

export function Offres() {
  const [editId, setEditId] = useState<string | null>(null)

  const { data: offres, loading, error, refetch } = useApi<Offre[]>(
    () => api.get<Offre[]>(ENDPOINTS.offres),
    []
  )
  const allOffres = offres ?? []
  const editOffre = allOffres.find((o) => o.id === editId) ?? null

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
        title="Offres commerciales"
        subtitle="Contenu affiché sur la page de souscription publique"
        actions={
          <button
            className="btn-primary !w-auto flex items-center gap-1.5 text-sm !py-2.5 !px-4"
            onClick={() => api.post(ENDPOINTS.offres, {}).then(refetch)}
          >
            <Plus size={15} />
            Nouvelle offre
          </button>
        }
      />

      {/* Offer list */}
      <div className="flex flex-col gap-2.5 mb-8">
        {allOffres.map((o) => (
          <OffreRow key={o.id} offre={o} onEdit={() => setEditId(o.id)} />
        ))}
      </div>

      {/* Public preview */}
      <SectionCard title="Aperçu de la page publique" action={
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: 'rgba(107,79,224,0.07)', color: '#6B4FE0' }}>
          Lecture seule
        </span>
      }>
        <p className="text-xs mb-5" style={{ color: 'rgba(30,15,70,0.45)' }}>
          Rendu tel qu'affiché sur le site vitrine CUBI pour les visiteurs.
        </p>
        <div className="flex gap-4 flex-wrap">
          {allOffres.map((o) => (
            <PricingCard key={o.id} offre={o} />
          ))}
        </div>
      </SectionCard>

      {/* Edit modal */}
      <Modal
        isOpen={!!editOffre}
        onClose={() => setEditId(null)}
        title="Modifier l'offre"
        size="lg"
      >
        {editOffre && <EditOffreModal offre={editOffre} onClose={() => { setEditId(null); refetch() }} />}
      </Modal>
    </div>
  )
}
