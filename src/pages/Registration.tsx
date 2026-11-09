import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { DotGridBackground } from '../components/ui/DotGridBackground'
import { DecorativeOrbs }   from '../components/ui/DecorativeOrbs'
import { Logo }             from '../components/ui/Logo'
import { Input }            from '../components/ui/Input'
import { Select }           from '../components/ui/Select'
import { Button }           from '../components/ui/Button'
import { Card }             from '../components/ui/Card'
import { SectionTitle }     from '../components/ui/SectionTitle'
import { api, ENDPOINTS }   from '../api/client'
import posthog               from '../posthog'

interface Licence {
  id:  string
  nom: string
}

const MOCK_LICENCES: Licence[] = [
  { id: 'pack-institut',   nom: 'Pack Institut'   },
  { id: 'pack-campus',     nom: 'Pack Campus'     },
  { id: 'pack-academique', nom: 'Pack Académique' },
  { id: 'pack-sur-mesure', nom: 'Pack Sur-Mesure' },
]

type Mode = 'ecole' | 'groupe'

interface Etablissement {
  nom: string
  siret: string
  visa: string
  adresse: string
  code_postal: string
  ville: string
  nom_responsable: string
  prenom_responsable: string
  email_responsable: string
}

const emptyEtablissement = (): Etablissement => ({
  nom: '', siret: '', visa: '', adresse: '', code_postal: '', ville: '',
  nom_responsable: '', prenom_responsable: '', email_responsable: '',
})

function Divider() {
  return <div className="h-px my-1" style={{ background: 'rgba(107,79,224,0.08)' }} />
}

// ── Choix du type d'inscription ──────────────────────────────────────────────

function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const options: { value: Mode; label: string; hint: string }[] = [
    { value: 'ecole',  label: 'Un établissement',          hint: 'Une seule structure' },
    { value: 'groupe', label: 'Plusieurs établissements',  hint: 'Un groupe, une seule demande' },
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((o) => {
        const active = mode === o.value
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="text-left rounded-xl px-4 py-3 cursor-pointer transition-colors duration-200"
            style={{
              background: active ? 'rgba(107,79,224,0.08)' : '#fff',
              border: `1.5px solid ${active ? '#6B4FE0' : 'rgba(107,79,224,0.25)'}`,
              fontFamily: 'var(--font-sans)',
            }}
            aria-pressed={active}
          >
            <div className="text-sm font-semibold" style={{ color: active ? '#6B4FE0' : '#1a1040' }}>{o.label}</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(30,15,70,0.62)' }}>{o.hint}</div>
          </button>
        )
      })}
    </div>
  )
}

// ── Bloc d'un établissement (mode groupe) ─────────────────────────────────────

function EtablissementFields({
  index, value, onChange, onRemove,
}: {
  index: number
  value: Etablissement
  onChange: (patch: Partial<Etablissement>) => void
  onRemove?: () => void
}) {
  const set = (k: keyof Etablissement) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ [k]: e.target.value })

  return (
    <div className="rounded-xl p-4 flex flex-col gap-4"
      style={{ background: 'rgba(107,79,224,0.03)', border: '1px solid rgba(107,79,224,0.16)' }}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold" style={{ color: '#1a1040' }}>Établissement {index + 1}</span>
        {onRemove && (
          <button type="button" onClick={onRemove}
            className="flex items-center gap-1 text-xs font-semibold border-none bg-transparent cursor-pointer"
            style={{ color: '#dc2626' }} aria-label={`Retirer l'établissement ${index + 1}`}>
            <Trash2 size={13} /> Retirer
          </button>
        )}
      </div>
      <Input label="Nom de l'établissement" placeholder="Ex : Lycée Jean Moulin" value={value.nom} onChange={set('nom')} required />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="SIRET" placeholder="XXX XXX XXX XXXXX" value={value.siret} onChange={set('siret')} required />
        <Input label="Visa (facultatif)" placeholder="N° de visa" value={value.visa} onChange={set('visa')} />
      </div>
      <Input label="Adresse" placeholder="Numéro et rue" value={value.adresse} onChange={set('adresse')} required />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Code postal" placeholder="75001" value={value.code_postal} onChange={set('code_postal')} required />
        <Input label="Ville" placeholder="Paris" value={value.ville} onChange={set('ville')} required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Nom du responsable" placeholder="Nom" value={value.nom_responsable} onChange={set('nom_responsable')} required />
        <Input label="Prénom du responsable" placeholder="Prénom" value={value.prenom_responsable} onChange={set('prenom_responsable')} required />
      </div>
      <Input label="Email du responsable" type="email" placeholder="responsable@etablissement.fr"
        value={value.email_responsable} onChange={set('email_responsable')} required />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function Registration() {
  const navigate = useNavigate()
  const [mode,      setMode]      = useState<Mode>('ecole')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [success,   setSuccess]   = useState(false)
  const [licences,  setLicences]  = useState<Licence[]>([])
  const [etablissements, setEtablissements] = useState<Etablissement[]>([emptyEtablissement(), emptyEtablissement()])

  useEffect(() => {
    api.get<Licence[]>(ENDPOINTS.licences)
      .then((data) => setLicences(data && data.length > 0 ? data : MOCK_LICENCES))
      .catch(() => setLicences(MOCK_LICENCES))
  }, [])

  const updateEtablissement = (i: number, patch: Partial<Etablissement>) =>
    setEtablissements((list) => list.map((e, j) => (j === i ? { ...e, ...patch } : e)))
  const removeEtablissement = (i: number) =>
    setEtablissements((list) => list.filter((_, j) => j !== i))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const raw = Object.fromEntries(new FormData(e.currentTarget))
    try {
      await api.post(ENDPOINTS.inscription, mode === 'groupe'
        ? { type: 'groupe', ...raw, etablissements }
        : { type: 'ecole', ...raw })
      posthog.capture('registration_application_submitted', {
        type: mode,
        ...(mode === 'groupe' ? { nb_etablissements: etablissements.length } : {}),
      })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi de la demande.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <DotGridBackground grid/>
        <DecorativeOrbs />
        <header className="relative z-10 px-8 py-6"><Logo /></header>
        <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
          <Card className="w-full max-w-md text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-5"
              style={{ background: 'rgba(34,197,94,0.1)' }}>
              ✓
            </div>
            <h2 className="font-display font-extrabold text-2xl mb-2" style={{ color: '#1a1040' }}>
              Demande envoyée !
            </h2>
            <p className="text-sm mb-6" style={{ color: 'rgba(30,15,70,0.7)' }}>
              {mode === 'groupe'
                ? "Votre demande pour vos établissements a bien été reçue. Après validation par l'équipe CUBI (sous 24–48h), chaque responsable recevra un email pour accéder à son espace."
                : "Votre demande d'inscription a bien été reçue. L'équipe CUBI vous contactera sous 24–48h."}
            </p>
            <Button onClick={() => navigate('/')}>Retour à l'accueil</Button>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DotGridBackground grid/>
      <DecorativeOrbs />

      <header className="relative z-10 px-8 py-6">
        <Logo />
      </header>

      <main className="relative z-10 flex items-start justify-center px-4 py-8 pb-16">
        <Card className="w-full max-w-2xl">
          <div className="mb-7">
            <h1 className="font-display font-extrabold text-4xl mb-2" style={{ color: '#1a1040', letterSpacing: '-1.5px' }}>
              Demande d'inscription
            </h1>
            <p className="text-sm mb-6" style={{ color: 'rgba(30,15,70,0.7)' }}>
              Complétez le formulaire ci-dessous pour créer votre compte CUBI.
            </p>
            <ModeSwitch mode={mode} onChange={(m) => { setMode(m); setError(null) }} />
          </div>

          {/* key : remonte le formulaire au changement de mode pour repartir de champs propres */}
          <form key={mode} onSubmit={handleSubmit} className="flex flex-col gap-7">
            {mode === 'ecole' ? (
              <>
                <section>
                  <SectionTitle>Entité</SectionTitle>
                  <div className="flex flex-col gap-4">
                    <Input label="Nom du siège" name="nom_siege" placeholder="Ex : Groupe Éducatif du Nord" required />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="Nom DAF"    name="nom_daf"    placeholder="Nom"    required />
                      <Input label="Prénom DAF" name="prenom_daf" placeholder="Prénom" required />
                    </div>
                    <Input label="Nom complet de l'organisation" name="nom_ecole" placeholder="Ex : Lycée Jean Moulin" required />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="SIRET de l'organisation" name="siret" placeholder="XXX XXX XXX XXXXX" required />
                      <Input label="Visa de l'organisation (facultatif)" name="visa_ecole" placeholder="N° de visa" />
                    </div>
                  </div>
                </section>

                <Divider />

                <section>
                  <SectionTitle>Adresse de l'entité</SectionTitle>
                  <div className="flex flex-col gap-4">
                    <Input label="Adresse" name="adresse" placeholder="Numéro et rue" required />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="Code postal" name="code_postal" placeholder="75001" required />
                      <Input label="Ville"       name="ville"       placeholder="Paris" required />
                    </div>
                  </div>
                </section>
              </>
            ) : (
              <section>
                <SectionTitle>Groupe</SectionTitle>
                <div className="flex flex-col gap-4">
                  <Input label="Nom du siège / du groupe" name="nom_siege" placeholder="Ex : Groupe Éducatif du Nord" required />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Nom DAF"    name="nom_daf"    placeholder="Nom"    required />
                    <Input label="Prénom DAF" name="prenom_daf" placeholder="Prénom" required />
                  </div>
                </div>
              </section>
            )}

            <Divider />

            <section>
              <SectionTitle>Licence</SectionTitle>
              <Select label={mode === 'groupe' ? 'Licence souhaitée (pour tous les établissements)' : 'Licence souhaitée'}
                name="type_licence_id" defaultValue="" required>
                <option value="" disabled>Sélectionner une licence</option>
                {licences.map((l) => (
                  <option key={l.id} value={l.id}>{l.nom}</option>
                ))}
              </Select>
            </section>

            <Divider />

            <section>
              <SectionTitle>{mode === 'groupe' ? 'Contact du siège' : "Contact de l'entité"}</SectionTitle>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Nom du contact"    name="nom_contact"    placeholder="Nom"    required />
                  <Input label="Prénom du contact" name="prenom_contact" placeholder="Prénom" required />
                </div>
                <Input label="Email de facturation" name="email" type="email" placeholder="facturation@organisation.fr" autoComplete="email" required />
                {mode === 'ecole' && (
                  <>
                    <Input label="Mot de passe"          name="mot_de_passe"        type="password" placeholder="••••••••" autoComplete="new-password" required />
                    <Input label="Confirmation du mot de passe" name="mot_de_passe_confirm" type="password" placeholder="••••••••" autoComplete="new-password" required />
                  </>
                )}
              </div>
            </section>

            {mode === 'groupe' && (
              <>
                <Divider />
                <section>
                  <SectionTitle>Établissements ({etablissements.length})</SectionTitle>
                  <p className="text-xs mb-4" style={{ color: 'rgba(30,15,70,0.7)' }}>
                    Chaque responsable recevra un email pour définir son mot de passe et gérer son établissement.
                    Pour avoir vous-même un accès, indiquez votre email comme responsable d'un établissement.
                  </p>
                  <div className="flex flex-col gap-4">
                    {etablissements.map((etab, i) => (
                      <EtablissementFields
                        key={i}
                        index={i}
                        value={etab}
                        onChange={(patch) => updateEtablissement(i, patch)}
                        onRemove={etablissements.length > 2 ? () => removeEtablissement(i) : undefined}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => setEtablissements((list) => [...list, emptyEtablissement()])}
                      className="btn-action flex items-center justify-center gap-1.5"
                    >
                      <Plus size={15} /> Ajouter un établissement
                    </button>
                  </div>
                </section>
              </>
            )}

            {error && (
              <div className="rounded-xl px-4 py-3 text-sm"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626' }}>
                {error}
              </div>
            )}

            <div className="mt-1">
              <Button type="submit" disabled={loading}>
                {loading ? 'Envoi en cours…' : "Envoyer la demande d'inscription"}
              </Button>
            </div>
          </form>

          <p className="mt-7 text-center text-sm" style={{ color: 'rgba(30,15,70,0.62)' }}>
            Déjà un compte ?{' '}
            <Link to="/login" className="font-semibold transition-opacity hover:opacity-80" style={{ color: '#6B4FE0' }}>
              Se connecter →
            </Link>
          </p>
        </Card>
      </main>
    </div>
  )
}
