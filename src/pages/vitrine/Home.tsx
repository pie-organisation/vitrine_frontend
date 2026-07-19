import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, Monitor, ArrowRight, ShieldCheck, MapPin, Gauge, Layers, Users, BookOpen, Building2, Laptop, Boxes } from 'lucide-react'
import { Layout } from '../../components/layout/Layout'
import { Section } from '../../components/ui/Section'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { DotsPagination } from '../../components/ui/DotsPagination'

const REASONS = [
  {
    icon: MapPin,
    title: 'Hébergement 100% en France',
    text: "Vos données et vos postes de travail restent hébergés exclusivement sur le territoire français, dans des infrastructures certifiées.",
  },
  {
    icon: ShieldCheck,
    title: 'Sécurisé par conception',
    text: 'Connexion chiffrée de bout en bout, conformité RGPD incluse et isolation complète des comptes entre établissements.',
  },
  {
    icon: Gauge,
    title: 'Performance à la demande',
    text: "Vos postes s'adaptent à la charge de travail : plus de ressources quand il en faut, sans surcoût quand il n'en faut pas.",
  },
  {
    icon: Layers,
    title: 'Multi-classes et multi-comptes',
    text: 'Gérez plusieurs établissements, classes et comptes depuis un même tableau de bord administrateur.',
  },
]

const AUDIENCES = [
  {
    icon: Users,
    title: 'Étudiants & enseignants',
    text: "Un accès à leur environnement de travail depuis le campus ou leur domicile, un espace de stockage persistant, et des outils exigeants (VS Code, Node.js, Python...) qui tournent sans dépendre de la puissance de leur ordinateur.",
  },{
    icon: Building2,
    title: 'Directions informatiques',
    text: 'Une console centralisée pour piloter le parc, la facturation et importer les promotions par fichier CSV/Excel, avec nettoyage automatique des doublons.',
  },
]

const SECTION_PAD = 'py-20 sm:py-28'

export function Home() {
  const [reasonIdx, setReasonIdx] = useState(0)
  const Icon = REASONS[reasonIdx].icon

  return (
    <Layout airbrush>
      {/* Hero — background="none" lets the page-level airbrush glow show through.
          Swap the `background` prop on any <Section> below to band it differently. */}
      <Section id="top" background="none" className="section-full">
        <div className={`container-page flex flex-col justify-center items-center text-center ${SECTION_PAD}`}>
          <Badge variant="violet" dot>SaaS B2B pour l'enseignement supérieur</Badge>
          <h1
            className="font-display font-extrabold mt-6 mx-auto max-w-2xl"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', letterSpacing: '-1.2px', lineHeight: 1.08, color: 'var(--color-cubi-ink)' }}
          >
            Un poste de travail puissant pour chaque étudiant, sur n'importe quel ordinateur
          </h1>
          <p className="mt-5 mx-auto max-w-xl text-base sm:text-lg" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 55.0%, transparent)' }}>
            CUBI déporte le calcul de vos environnements de développement, data et IA sur une infrastructure
            mutualisée hébergée en France. Vos étudiants gardent leur propre ordinateur comme simple terminal
            d'affichage — sans achat de matériel, sans inégalité de puissance entre étudiants.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
            <Link to="/offres" className="no-underline w-full sm:w-auto">
              <Button fullWidth={false} style={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                Voir les licences <ArrowRight size={16} />
              </Button>
            </Link>
            <Link to="/comment-ca-marche" className="no-underline w-full sm:w-auto">
              <Button variant="secondary" fullWidth={false} style={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                Comment ça marche <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </Section>

        {/* Le problème */}
      <Section background="dark" className="section-full">
        <div className={`container-page ${SECTION_PAD}`}>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-center" style={{ color: '#fff', letterSpacing: '-0.6px' }}>
            Deux mauvaises solutions à la fracture numérique matérielle
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-center text-sm sm:text-base" style={{ color: 'color-mix(in srgb, #fff 55%, transparent)' }}>
            Des cursus comme le développement, game design, animation 3D, data science ou IA exigent des configurations techniques exigeantes.
            Deux options s'offrent aujourd'hui aux établissements, toutes deux imparfaites.
          </p>
          <div className="grid sm:grid-cols-2 gap-6 mt-12">
            <Card>
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'color-mix(in srgb, var(--color-cubi-violet) 12%, transparent)' }}
              >
                <Laptop size={20} color="var(--color-cubi-violet)" />
              </div>
              <h3 className="font-display font-bold text-lg" style={{ color: 'var(--color-cubi-ink)' }}>
                Acheter et renouveler un parc de machines
              </h3>
              <p className="mt-2 text-sm" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 55%, transparent)' }}>
                Un investissement lourd (CAPEX), une charge de maintenance continue pour la DSI, et un impact
                environnemental lié au remplacement rapide des composants.
              </p>
            </Card>
            <Card>
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'color-mix(in srgb, var(--color-cubi-mauve) 15%, transparent)' }}
              >
                <Users size={20} color="var(--color-cubi-violet)" />
              </div>
              <h3 className="font-display font-bold text-lg" style={{ color: 'var(--color-cubi-ink)' }}>
                S'en remettre au matériel personnel (BYOD)
              </h3>
              <p className="mt-2 text-sm" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 55%, transparent)' }}>
                Une inégalité de fait entre les étudiants bien équipés et ceux dont l'ordinateur ne supporte pas
                les outils demandés.
              </p>
            </Card>
          </div>
        </div>
      </Section>

      {/* La solution */}
      <Section background="light" className="section-full">
        <div className={`container-page ${SECTION_PAD}`}>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <Badge variant="violet" dot>La solution CUBI</Badge>
              <h2 className="font-display font-bold text-2xl sm:text-3xl mt-4" style={{ color: 'var(--color-cubi-ink)', letterSpacing: '-0.6px' }}>
                Des conteneurs applicatifs légers, pas des machines virtuelles
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 55%, transparent)' }}>
                Contrairement aux solutions VDI classiques qui allouent une machine virtuelle entière par
                utilisateur, CUBI repose sur des conteneurs Linux isolés : plusieurs sessions partagent le même
                noyau, pour une empreinte infrastructure minimale et un coût soutenable à l'échelle d'un campus.
              </p>
              <p className="mt-4 text-sm sm:text-base leading-relaxed" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 55%, transparent)' }}>
                L'affichage est transmis par un protocole de streaming basse latence qui n'envoie que les pixels
                modifiés à l'écran, pas un flux vidéo constant — ce qui allège fortement la bande passante de
                l'école et la charge sur le poste de l'étudiant, même ancien.
              </p>
            </div>
            <Card className="!p-6 sm:!p-10">
              <div className="flex items-center justify-center gap-6">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-20 h-16 rounded-xl flex items-center justify-center"
                    style={{ background: 'color-mix(in srgb, var(--color-cubi-violet) 10%, transparent)', border: '1.5px solid color-mix(in srgb, var(--color-cubi-violet) 25%, transparent)' }}
                  >
                    <Monitor size={26} color="var(--color-cubi-violet)" />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 50%, transparent)' }}>Poste étudiant</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-cubi-mauve)' }} />
                  ))}
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-20 h-16 rounded-xl flex items-center justify-center"
                    style={{ background: 'color-mix(in srgb, var(--color-cubi-rose) 10%, transparent)', border: '1.5px solid color-mix(in srgb, var(--color-cubi-rose) 25%, transparent)' }}
                  >
                    <Boxes size={26} color="var(--color-cubi-mauve)" />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 50%, transparent)' }}>Conteneurs (France)</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* Pour qui */}
      <Section background="dark" className="section-full">
        <div className={`container-page ${SECTION_PAD}`}>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-center" style={{ color: '#fff', letterSpacing: '-0.6px' }}>
            Une organisation pensée pour l'enseignement supérieur
          </h2>
          <div className="grid sm:grid-cols-2 gap-6 mt-12">
            {AUDIENCES.map((a) => {
              const Icon = a.icon
              return (
                <Card key={a.title} className="!p-6 sm:!p-8">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center mb-4"
                    style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-cubi-violet) 15%, transparent), color-mix(in srgb, var(--color-cubi-rose) 15%, transparent))' }}
                  >
                    <Icon size={20} color="var(--color-cubi-violet)" />
                  </div>
                  <h3 className="font-display font-bold text-lg" style={{ color: 'var(--color-cubi-ink)' }}>{a.title}</h3>
                  <p className="mt-2 text-sm" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 55%, transparent)' }}>{a.text}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </Section>

      <Section className="section-full" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--extra-big-padding-section)', background: 'linear-gradient(180deg, #F8F4FF 30%, transparent, transparent)' }}>
        {/* Sécurité & souveraineté */}
        <Section>
          <div className={`container-page ${SECTION_PAD}`}>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <Badge variant="violet" dot>Souveraineté & sécurité</Badge>
                <h2 className="font-display font-bold text-2xl sm:text-3xl mt-4" style={{ color: 'var(--color-cubi-ink)', letterSpacing: '-0.6px' }}>
                  Hébergé en France, conforme RGPD, pensé pour la confidentialité académique
                </h2>
                <p className="mt-4 text-sm sm:text-base leading-relaxed" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 55%, transparent)' }}>
                  L'établissement reste responsable de traitement au sens du RGPD pour l'ensemble des données
                  étudiantes et enseignantes. CUBI intervient strictement comme sous-traitant : aucune donnée
                  n'est monétisée ni exploitée par la plateforme.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: MapPin, label: '100% France', text: 'Hébergement souverain, imperméable aux lois extraterritoriales.' },
                  { icon: Lock, label: 'Mode Confidentiel', text: 'Connexion restreinte au réseau ou VPN de l\u2019établissement sur demande.' },
                  { icon: ShieldCheck, label: 'Compte unique', text: 'Aucune double connexion simultanée sur un même compte.' },
                  { icon: Gauge, label: 'SLA 99,5%', text: 'Disponibilité garantie du lundi au samedi, 7h–22h.' },
                ].map((f) => (
                  <Card key={f.label} className="!p-5">
                    <div className="font-display font-bold text-sm mt-3" style={{ color: 'var(--color-cubi-ink)' }}>{f.label}</div>
                    <div className="text-xs mt-1" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 50%, transparent)' }}>{f.text}</div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Modèle économique — teaser */}
        <Section>
          <div className={`container-page ${SECTION_PAD}`} >
            <Card>
              <span
                className="text-xs font-extrabold uppercase tracking-widest"
                style={{ color: 'var(--color-cubi-violet)', fontFamily: 'var(--font-display)' }}
              >
                Modèle économique
              </span>
              <h2
                className="font-display font-extrabold mt-3"
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                  letterSpacing: '-1px',
                  background: 'linear-gradient(135deg, var(--color-cubi-violet) 0%, var(--color-cubi-mauve) 55%, var(--color-cubi-rose) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Une tarification qui suit votre usage réel
              </h2>
              <p className="mt-4 max-w-lg text-sm sm:text-base" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 55%, transparent)' }}>
                CUBI facture au volume de sessions simultanées réellement nécessaires. La tarification est progressive par paliers cumulatifs : chaque tranche
                supplémentaire bénéficie d'un tarif dégressif, sans effet de seuil brutal.
              </p>
              <div className="mt-8">
                <Link to="/offres" className="no-underline">
                  <Button fullWidth={false}>Voir la grille tarifaire</Button>
                </Link>
              </div>
            </Card>
          </div>
        </Section>
      </Section>

      
    </Layout>
  )
}
