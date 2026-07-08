import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { ListCard }   from '../../components/ui/ListCard'
import { Badge }      from '../../components/ui/Badge'
import { Modal }      from '../../components/ui/Modal'
import { Input }      from '../../components/ui/Input'
import { useApi }        from '../../hooks/useApi'
import { api, ENDPOINTS } from '../../api/client'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Licence {
  id:               string
  nom:              string
  sessionsMin:      number
  sessionsMax:      number | null
  prixUnitaire:     number
  personnalisable:  boolean
  ressourcesCpu:    number
  ressourcesRamGo:  number
  actif:            boolean
}

// ── Row ───────────────────────────────────────────────────────────────────────

function LicenceRow({ licence, onEdit, onDelete }: { licence: Licence; onEdit: () => void; onDelete: () => void }) {
  return (
    <ListCard>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-extrabold text-base shrink-0"
            style={{ background: 'linear-gradient(135deg, #6B4FE0 0%, #C084FC 55%, #E879F9 100%)', color: '#fff' }}
          >
            {licence.nom[0]}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-display font-bold text-sm" style={{ color: '#1a1040' }}>{licence.nom}</span>
              {licence.personnalisable && <Badge variant="violet">Personnalisable</Badge>}
              <Badge variant={licence.actif ? 'green' : 'neutral'}>{licence.actif ? 'Active' : 'Inactive'}</Badge>
            </div>
            <p className="text-xs" style={{ color: 'rgba(30,15,70,0.45)' }}>
              {licence.sessionsMin}–{licence.sessionsMax ?? '∞'} sessions/mois · {licence.ressourcesCpu} vCPU · {licence.ressourcesRamGo} Go RAM
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              <span className="text-xs font-semibold" style={{ color: '#6B4FE0' }}>{licence.prixUnitaire} € / session</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg border-none cursor-pointer"
            style={{ background: 'rgba(107,79,224,0.07)', color: '#6B4FE0' }}
            onClick={onEdit}
            title="Modifier"
          >
            <Pencil size={14} />
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg border-none cursor-pointer"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626' }}
            onClick={onDelete}
            title="Supprimer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </ListCard>
  )
}

// ── Create / edit form modal ─────────────────────────────────────────────────

function LicenceFormModal({
  licence,
  onClose,
  onSaved,
}: {
  licence: Licence | null // null = création
  onClose: () => void
  onSaved: () => void
}) {
  const [nom,             setNom]             = useState(licence?.nom ?? '')
  const [sessionsMin,     setSessionsMin]     = useState(licence ? String(licence.sessionsMin) : '')
  const [sessionsMax,     setSessionsMax]     = useState(licence?.sessionsMax != null ? String(licence.sessionsMax) : '')
  const [prixUnitaire,    setPrixUnitaire]    = useState(licence ? String(licence.prixUnitaire) : '')
  const [ressourcesCpu,   setRessourcesCpu]   = useState(licence ? String(licence.ressourcesCpu) : '')
  const [ressourcesRamGo, setRessourcesRamGo] = useState(licence ? String(licence.ressourcesRamGo) : '')
  const [personnalisable, setPersonnalisable] = useState(licence?.personnalisable ?? false)
  const [actif,           setActif]           = useState(licence?.actif ?? true)
  const [saving,          setSaving]          = useState(false)
  const [error,           setError]           = useState<string | null>(null)

  const handleSave = async () => {
    if (!nom.trim() || sessionsMin === '' || prixUnitaire === '' || ressourcesCpu === '' || ressourcesRamGo === '') {
      setError('Nom, sessions min, prix unitaire et ressources sont obligatoires.')
      return
    }
    setSaving(true); setError(null)
    const payload = {
      nom,
      sessionsMin:     Number(sessionsMin),
      sessionsMax:     sessionsMax === '' ? null : Number(sessionsMax),
      prixUnitaire:    Number(prixUnitaire),
      personnalisable,
      ressourcesCpu:   Number(ressourcesCpu),
      ressourcesRamGo: Number(ressourcesRamGo),
      actif,
    }
    try {
      if (licence) {
        await api.patch(ENDPOINTS.plan(licence.id), payload)
      } else {
        await api.post(ENDPOINTS.plans, payload)
      }
      onSaved()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de l'enregistrement.")
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input label="Nom de la licence" value={nom} onChange={(e) => setNom(e.target.value)} />

      <div className="grid grid-cols-2 gap-4">
        <Input label="Sessions min/mois" type="number" value={sessionsMin} onChange={(e) => setSessionsMin(e.target.value)} />
        <Input label="Sessions max/mois (vide = illimité)" type="number" value={sessionsMax} onChange={(e) => setSessionsMax(e.target.value)} />
      </div>

      <Input label="Prix unitaire (€ / session)" type="number" step="0.01" value={prixUnitaire} onChange={(e) => setPrixUnitaire(e.target.value)} />

      <div className="grid grid-cols-2 gap-4">
        <Input label="Ressources CPU (vCPU)" type="number" value={ressourcesCpu} onChange={(e) => setRessourcesCpu(e.target.value)} />
        <Input label="Ressources RAM (Go)" type="number" value={ressourcesRamGo} onChange={(e) => setRessourcesRamGo(e.target.value)} />
      </div>

      {/* Toggles */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between py-3 px-4 rounded-xl" style={{ background: 'rgba(107,79,224,0.05)', border: '1px solid rgba(107,79,224,0.1)' }}>
          <div>
            <div className="text-sm font-semibold" style={{ color: '#1a1040' }}>Active</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(30,15,70,0.45)' }}>
              {actif ? "Sélectionnable à l'inscription" : 'Masquée du formulaire d\'inscription'}
            </div>
          </div>
          <button
            role="switch"
            aria-checked={actif}
            className="relative inline-flex items-center rounded-full border-none cursor-pointer transition-all duration-200 shrink-0"
            style={{ width: '36px', height: '20px', background: actif ? 'linear-gradient(135deg, #6B4FE0, #C084FC)' : 'rgba(107,79,224,0.15)' }}
            onClick={() => setActif((v) => !v)}
          >
            <span className="absolute rounded-full bg-white transition-all duration-200"
              style={{ width: '14px', height: '14px', left: actif ? '19px' : '3px', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
          </button>
        </div>

        <div className="flex items-center justify-between py-3 px-4 rounded-xl" style={{ background: 'rgba(107,79,224,0.05)', border: '1px solid rgba(107,79,224,0.1)' }}>
          <div>
            <div className="text-sm font-semibold" style={{ color: '#1a1040' }}>Personnalisable</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(30,15,70,0.45)' }}>
              Ressources ajustables au cas par cas pour l'école
            </div>
          </div>
          <button
            role="switch"
            aria-checked={personnalisable}
            className="relative inline-flex items-center rounded-full border-none cursor-pointer transition-all duration-200 shrink-0"
            style={{ width: '36px', height: '20px', background: personnalisable ? 'linear-gradient(135deg, #6B4FE0, #C084FC)' : 'rgba(107,79,224,0.15)' }}
            onClick={() => setPersonnalisable((v) => !v)}
          >
            <span className="absolute rounded-full bg-white transition-all duration-200"
              style={{ width: '14px', height: '14px', left: personnalisable ? '19px' : '3px', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
          </button>
        </div>
      </div>

      {error && (
        <div className="text-xs px-3 py-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626' }}>
          {error}
        </div>
      )}

      <div className="flex gap-3 mt-3">
        <button className="btn-primary flex-1" onClick={handleSave} disabled={saving}>
          {saving ? 'Enregistrement…' : licence ? 'Enregistrer' : 'Créer la licence'}
        </button>
        <button className="btn-action flex-1" onClick={onClose}>Annuler</button>
      </div>
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

// ── Delete confirmation modal ────────────────────────────────────────────────

function ConfirmDeleteLicenceModal({ licence, onClose, onDeleted }: { licence: Licence; onClose: () => void; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const handleDelete = async () => {
    setDeleting(true); setError(null)
    try {
      await api.delete(ENDPOINTS.plan(licence.id))
      onDeleted()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la suppression.')
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm" style={{ color: 'rgba(30,15,70,0.7)' }}>
        Supprimer définitivement la licence <strong>{licence.nom}</strong> ? Elle disparaîtra du formulaire d'inscription.
        Cette action est irréversible.
      </div>
      {error && (
        <div className="text-xs px-3 py-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626' }}>
          {error}
        </div>
      )}
      <div className="flex gap-3 mt-1">
        <button className="btn-danger flex-1" onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Suppression…' : 'Supprimer'}
        </button>
        <button className="btn-action flex-1" onClick={onClose}>Annuler</button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function Licences() {
  const [editId,      setEditId]      = useState<string | null>(null)
  const [deletingId,  setDeletingId]  = useState<string | null>(null)
  const [showCreate,  setShowCreate]  = useState(false)

  const { data: licences, loading, error, refetch } = useApi<Licence[]>(
    () => api.get<Licence[]>(ENDPOINTS.plans),
    []
  )
  const allLicences  = licences ?? []
  const editLicence     = allLicences.find((l) => l.id === editId) ?? null
  const deletingLicence = allLicences.find((l) => l.id === deletingId) ?? null

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
        title="Licences"
        subtitle="Catalogue technique — alimente le choix de licence du formulaire d'inscription"
        actions={
          <button
            className="btn-primary !w-auto flex items-center gap-1.5 text-sm !py-2.5 !px-4"
            onClick={() => setShowCreate(true)}
          >
            <Plus size={15} />
            Nouvelle licence
          </button>
        }
      />

      <div className="flex flex-col gap-2.5">
        {allLicences.map((l) => (
          <LicenceRow key={l.id} licence={l} onEdit={() => setEditId(l.id)} onDelete={() => setDeletingId(l.id)} />
        ))}
      </div>

      {/* Create modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nouvelle licence" size="lg" dismissable={false}>
        {showCreate && (
          <LicenceFormModal licence={null} onClose={() => setShowCreate(false)} onSaved={refetch} />
        )}
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={!!editLicence} onClose={() => setEditId(null)} title="Modifier la licence" size="lg" dismissable={false}>
        {editLicence && (
          <LicenceFormModal licence={editLicence} onClose={() => setEditId(null)} onSaved={refetch} />
        )}
      </Modal>

      {/* Delete confirmation modal */}
      <Modal isOpen={!!deletingLicence} onClose={() => setDeletingId(null)} title="Supprimer cette licence" dismissable={false}>
        {deletingLicence && (
          <ConfirmDeleteLicenceModal licence={deletingLicence} onClose={() => setDeletingId(null)} onDeleted={refetch} />
        )}
      </Modal>
    </div>
  )
}
