import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DotGridBackground } from '../components/ui/DotGridBackground'
import { DecorativeOrbs }   from '../components/ui/DecorativeOrbs'
import { Logo }             from '../components/ui/Logo'
import { Input }            from '../components/ui/Input'
import { Select }           from '../components/ui/Select'
import { Button }           from '../components/ui/Button'
import { Card }             from '../components/ui/Card'
import { Toggle }           from '../components/ui/Toggle'
import { SectionTitle }     from '../components/ui/SectionTitle'
import { api, ENDPOINTS }   from '../api/client'

interface Licence {
  id:  string
  nom: string
}

type Mode = 'ecole' | 'groupe'

const TOGGLE_OPTIONS: [{ value: string; label: string }, { value: string; label: string }] = [
  { value: 'ecole',  label: 'Demande pour une école'  },
  { value: 'groupe', label: 'Demande pour un groupe'  },
]

function Divider() {
  return <div className="h-px my-1" style={{ background: 'rgba(107,79,224,0.08)' }} />
}

export function Registration() {
  const navigate = useNavigate()
  const [mode,      setMode]      = useState<Mode>('ecole')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [success,   setSuccess]   = useState(false)
  const [licences,  setLicences]  = useState<Licence[]>([])

  useEffect(() => {
    api.get<Licence[]>(ENDPOINTS.licences)
      .then(setLicences)
      .catch(() => setLicences([]))
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const raw = Object.fromEntries(new FormData(e.currentTarget))
    try {
      await api.post(ENDPOINTS.inscription, { type: mode, ...raw })
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
        <DotGridBackground />
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
            <p className="text-sm mb-6" style={{ color: 'rgba(30,15,70,0.5)' }}>
              Votre demande d'inscription a bien été reçue. L'équipe CUBI vous contactera sous 24–48h.
            </p>
            <Button onClick={() => navigate('/login')}>Retour à la connexion</Button>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DotGridBackground />
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
            <p className="text-sm mb-6" style={{ color: 'rgba(30,15,70,0.5)' }}>
              Complétez le formulaire ci-dessous pour créer votre compte CUBI.
            </p>
            <Toggle options={TOGGLE_OPTIONS} value={mode} onChange={(v) => setMode(v as Mode)} />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-7">
            <section>
              <SectionTitle>Entité</SectionTitle>
              <div className="flex flex-col gap-4">
                <Input label="Nom du siège" name="nom_siege" placeholder="Ex : Groupe Éducatif du Nord" required />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Nom DAF"    name="nom_daf"    placeholder="Nom"    required />
                  <Input label="Prénom DAF" name="prenom_daf" placeholder="Prénom" required />
                </div>
                <Input label="Nom complet de l'école" name="nom_ecole" placeholder="Ex : Lycée Jean Moulin" required />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="SIRET école" name="siret" placeholder="XXX XXX XXX XXXXX" required />
                  <Input label="Visa école (facultatif)" name="visa_ecole" placeholder="N° de visa" />
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

            <Divider />

            <section>
              <SectionTitle>Licence</SectionTitle>
              <Select label="Licence souhaitée" name="type_licence_id" defaultValue="" required>
                <option value="" disabled>Sélectionner une licence</option>
                {licences.map((l) => (
                  <option key={l.id} value={l.id}>{l.nom}</option>
                ))}
              </Select>
            </section>

            <Divider />

            <section>
              <SectionTitle>Contact de l'entité</SectionTitle>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Nom du contact"    name="nom_contact"    placeholder="Nom"    required />
                  <Input label="Prénom du contact" name="prenom_contact" placeholder="Prénom" required />
                </div>
                <Input label="Email de facturation" name="email" type="email" placeholder="facturation@ecole.fr" autoComplete="email" required />
                <Input label="Mot de passe"          name="mot_de_passe"        type="password" placeholder="••••••••" autoComplete="new-password" required />
                <Input label="Confirmation du mot de passe" name="mot_de_passe_confirm" type="password" placeholder="••••••••" autoComplete="new-password" required />
              </div>
            </section>

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

          <p className="mt-7 text-center text-sm" style={{ color: 'rgba(30,15,70,0.45)' }}>
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
