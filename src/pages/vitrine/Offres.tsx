import { Link } from 'react-router-dom'
import { CheckCircle2, Quote } from 'lucide-react'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Section } from '../../components/ui/Section'
import { Button } from '../../components/ui/Button'
import { QuoteIllustration } from '../../components/ui/QuoteIllustration'
interface Plan {
  name: string
  tagline: string
  volume: string
  price: string
  priceSuffix?: string
  features: string[]
  cta: { label: string; to: string }
  highlighted?: boolean
  badge?: string
}

const PLANS: Plan[] = [
  {
    name: 'Pack Institut',
    tagline: 'Pour un premier déploiement pilote',
    volume: 'Jusqu\u2019à 50 sessions simultanées',
    price: '60 000 €',
    priceSuffix: '~1 200 €/session',
    features: [
      'Jusqu\u2019à 50 sessions simultanées',
      'Conteneurs applicatifs Linux isolés',
      'Console d\u2019administration DSI',
      'Import CSV des promotions',
      'Hébergement souverain en France',
      'Conformité RGPD incluse',
    ],
    cta: { label: 'S\u2019inscrire', to: '/inscription' },
  },
  {
    name: 'Pack Campus',
    tagline: 'Le bon équilibre pour un établissement en croissance',
    volume: 'Jusqu\u2019à 150 sessions simultanées',
    price: '155 000 €',
    priceSuffix: '~1 033 €/session',
    features: [
      'Jusqu\u2019à 150 sessions simultanées',
      'Tarif dégressif par palier',
      'Gabarits techniques par promotion',
      'Mode Confidentiel Réseau',
      'SLA 99,5 % garanti',
      'Support prioritaire',
    ],
    cta: { label: 'S\u2019inscrire', to: '/inscription' },
    highlighted: true,
    badge: '★ Le plus choisi',
  },
  {
    name: 'Pack Académique',
    tagline: 'Pour plusieurs filières et promotions',
    volume: 'Jusqu\u2019à 300 sessions simultanées',
    price: '267 500 €',
    priceSuffix: '~891 €/session',
    features: [
      'Jusqu\u2019à 300 sessions simultanées',
      'Tarif dégressif par palier',
      'Multi-filières et multi-promotions',
      'Supervision d\u2019activité en direct',
      'SLA 99,5 % garanti',
      'Support prioritaire',
    ],
    cta: { label: 'S\u2019inscrire', to: '/inscription' },
  },
  {
    name: 'Pack Sur-Mesure',
    tagline: 'Au-delà de 300 sessions, sans limite',
    volume: 'Sessions simultanées illimitées',
    price: 'Sur devis',
    features: [
      'Au-delà de 300 sessions simultanées',
      'Tarif grand compte négocié',
      'Cluster cloud souverain dédié',
      'Accompagnement au déploiement sur site',
      'Accès API et SLA sur-mesure',
      'Interlocuteur dédié',
    ],
    cta: { label: 'Nous contacter', to: '/contact' },
  },
]

const REVIEWS = [
  { initials: 'MF', name: 'Michèle F.', role: 'Directrice, école d\u2019ingénieurs', text: "Le déploiement des sessions s'est fait sans friction pour nos étudiants, et le support répond vraiment vite." },
  { initials: 'JD', name: 'Jean D.', role: 'DSI, établissement partenaire', text: 'La console centralisée nous fait gagner un temps fou pour gérer les promotions et le parc de plusieurs filières.' },
  { initials: 'SL', name: 'Sophie L.', role: 'Responsable des systèmes d\u2019information', text: 'Hébergement en France, tarification par palier claire, support réactif : exactement ce qu\u2019il nous fallait.' },
]

export function Offres() {
  return (
    <Layout>
      <Section id="top"className="container-page pt-16 pb-10 text-center section-top" >
        <Badge variant="violet" dot>Nos forfaits</Badge>
        <h1
          className="font-display font-extrabold mt-6 mx-auto max-w-xl"
          style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', letterSpacing: '-1px', color: 'var(--color-cubi-ink)' }}
        >
          Une tarification qui s'adapte à votre pic d'usage réel
        </h1>
        <p className="mt-4 mx-auto max-w-lg text-sm sm:text-base" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 55.0%, transparent)' }}>
          Vos postes de travail facturés à la session et non par compte, avec un tarif dégressif selon votre volume
          d'utilisation. Sans engagement et résiliable à tout moment.
        </p>
      </Section>

      {/* Pricing cards */}
      <section className="container-page py-12 section-full" style={{ background: 'radial-gradient(circle, rgba(232,121,249,.28), transparent 50%)' }}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="rounded-3xl p-7 flex flex-col h-full"
              style={
                plan.highlighted
                  ? {
                      background: 'linear-gradient(160deg, var(--color-cubi-violet) 0%, #9B6FF5 55%, var(--color-cubi-mauve) 100%)',
                      boxShadow: '0 20px 50px color-mix(in srgb, var(--color-cubi-violet) 32%, transparent)',
                    }
                  : {
                      background: '#ffffff',
                      border: '1px solid color-mix(in srgb, var(--color-cubi-violet) 10%, transparent)',
                      boxShadow: '0 6px 24px color-mix(in srgb, var(--color-cubi-violet) 6%, transparent)',
                    }
              }
            >
              {plan.badge && (
                <span
                  className="self-start px-3 py-1 rounded-full text-xs font-bold mb-4"
                  style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--color-cubi-violet)' }}
                >
                  {plan.badge}
                </span>
              )}

              <h3
                className="font-display font-bold text-lg"
                style={{ color: plan.highlighted ? '#fff' : 'var(--color-cubi-ink)' }}
              >
                {plan.name}
              </h3>
              <p
                className="text-xs mt-1.5"
                style={{ color: plan.highlighted ? 'rgba(255,255,255,0.8)' : 'color-mix(in srgb, var(--color-cubi-ink) 50%, transparent)' }}
              >
                {plan.tagline}
              </p>
              <p
                className="text-xs font-semibold mt-3"
                style={{ color: plan.highlighted ? 'rgba(255,255,255,0.9)' : 'var(--color-cubi-violet)' }}
              >
                {plan.volume}
              </p>

              <div className="mt-4">
                <span
                  className="font-display font-extrabold text-2xl sm:text-3xl"
                  style={{ color: plan.highlighted ? '#fff' : 'var(--color-cubi-violet)' }}
                >
                  {plan.price}
                </span>
                {plan.priceSuffix && (
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: plan.highlighted ? 'rgba(255,255,255,0.75)' : 'color-mix(in srgb, var(--color-cubi-ink) 40%, transparent)' }}
                  >
                    {plan.priceSuffix}
                  </div>
                )}
              </div>

              <ul className="flex flex-col gap-2 mt-6 mb-7 list-none p-0 flex-1">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-xs sm:text-sm"
                    style={{ color: plan.highlighted ? 'rgba(255,255,255,0.9)' : 'color-mix(in srgb, var(--color-cubi-ink) 65%, transparent)' }}
                  >
                    <CheckCircle2
                      size={15}
                      className="mt-0.5 shrink-0"
                      color={plan.highlighted ? '#ffffff' : 'var(--color-cubi-violet)'}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Link to={plan.cta.to} className="no-underline mt-auto">
                <Button
                  className="w-full py-3.5 rounded-full font-semibold text-sm border-none cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
                  style={{
                    background: plan.highlighted ? '#ffffff' : 'linear-gradient(135deg, #6B4FE0 0%, #C084FC 55%, #E879F9 100%)',
                    color: plan.highlighted ? 'var(--color-cubi-violet)' : '#ffffff',
                  }}
                >
                  {plan.cta.label}
                </Button>
              </Link>
            </div>
          ))}
        </div>
        <p className="text-xs text-center mt-6" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 40%, transparent)' }}>
          Grille indicative. Chaque devis est établi sur mesure selon votre volume réel de sessions simultanées.
        </p>
      </section>

      {/* Descriptive block */}
      <Section className="container-page py-16 section-full">
        <Card className="flex flex-col sm:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="font-display font-bold text-xl sm:text-2xl" style={{ color: 'var(--color-cubi-ink)' }}>
              Un devis personnalisé, pas un abonnement en ligne
            </h2>
            <p className="mt-3 text-sm sm:text-base" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 55%, transparent)' }}>
              Renseignez votre volume de sessions simultanées souhaité : notre équipe qualifie votre besoin et
              vous transmet un devis au format PDF. Votre établissement édite ensuite son propre bon de commande,
              selon votre processus d'achat habituel.
            </p>
          </div>
          <div
            className="w-full sm:w-56 h-36 rounded-2xl shrink-0 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-cubi-violet) 12%, transparent), color-mix(in srgb, var(--color-cubi-rose) 12%, transparent))', border: '1px solid color-mix(in srgb, var(--color-cubi-violet) 14%, transparent)' }}
          >
            <QuoteIllustration className="w-32 h-32" />
          </div>
        </Card>
      </Section>
      
      {/* Comparatif VDI vs CUBI */}
      <Section className="section-full" background="dark"
        style={{
          background:
            'radial-gradient(55% 42% at 82% -6%, color-mix(in srgb, var(--color-cubi-rose) 55.0%, transparent), transparent 62%),' +
            'radial-gradient(48% 40% at 6% 4%, color-mix(in srgb, var(--color-cubi-violet) 50%, transparent), transparent 62%),' +
            'radial-gradient(42% 38% at 50% 105%, color-mix(in srgb, var(--color-cubi-mauve) 40%, transparent), transparent 65%),' +
            'radial-gradient(circle at 50% 0%, #2a1968 0%, var(--color-cubi-ink) 55%, #100a2b 100%)',
        }}>
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-center" style={{ color: '#fff', letterSpacing: '-0.6px' }}>
          CUBI face aux solutions VDI classiques
        </h2>
        <Card className="!p-0 overflow-hidden mt-10 max-w-4xl mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid color-mix(in srgb, var(--color-cubi-violet) 12%, transparent)' }}>
                  <th className="text-left p-4 sm:p-5 font-display font-bold" style={{ color: 'var(--color-cubi-ink)' }}>Critère</th>
                  <th className="text-left p-4 sm:p-5 font-display font-bold" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 55%, transparent)' }}>
                    VDI / Cloud PC (VMware Horizon, Shadow Pro, AWS)
                  </th>
                  <th className="text-left p-4 sm:p-5 font-display font-bold" style={{ color: 'var(--color-cubi-violet)' }}>CUBI</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Paradigme technique', 'Une VM ou un OS entier par utilisateur', 'Conteneurs Linux isolés, plusieurs sessions par noyau partagé'],
                  ['Modèle économique', 'Licence nominative fixe par utilisateur/mois', 'Tarif progressif par volume de sessions simultanées'],
                  ['Déploiement', 'Configuration individuelle, complexe pour un groupe', 'Un gabarit technique déployé à toute une promotion en un clic'],
                  ['Pédagogie', 'Infrastructure neutre, aucune supervision enseignant', 'Environnement identique pour toute la classe, zéro support technique en début de cours'],
                ].map((row, i) => (
                  <tr key={row[0]} style={i < 3 ? { borderBottom: '1px solid color-mix(in srgb, var(--color-cubi-violet) 8%, transparent)' } : undefined}>
                    <td className="p-4 sm:p-5 font-semibold" style={{ color: 'var(--color-cubi-ink)' }}>{row[0]}</td>
                    <td className="p-4 sm:p-5" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 55%, transparent)' }}>{row[1]}</td>
                    <td className="p-4 sm:p-5" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 75%, transparent)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Section>

          

      {/* Reviews */}
      <Section className="section-general flex flex-col gap-8" style={{background: 'linear-gradient(180deg, #F8F4FF 60%, transparent)'}}>
          {/* Testimonial quote */}
          <section className="container-page py-14 section-top">
            <div className="max-w-2xl mx-auto text-center">
              <Quote size={28} color="var(--color-cubi-mauve)" className="mx-auto mb-4" />
              <p className="font-display font-bold text-xl sm:text-2xl" style={{ color: 'var(--color-cubi-ink)', letterSpacing: '-0.4px' }}>
                "Le genre d'infrastructure qu'on aimerait avoir eue dès le premier déploiement."
              </p>
            </div>
          </section>
          <section className="container-page py-16">
            <div className="grid sm:grid-cols-3 gap-5">
              {REVIEWS.map((r) => (
                <Card key={r.name} className="!p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0"
                      style={{ background: 'linear-gradient(135deg, var(--color-cubi-violet), var(--color-cubi-mauve))', color: '#fff' }}
                    >
                      {r.initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold leading-tight" style={{ color: 'var(--color-cubi-ink)' }}>{r.name}</div>
                      <div className="text-xs" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 45%, transparent)' }}>{r.role}</div>
                    </div>
                  </div>
                  <p className="text-sm" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 60%, transparent)' }}>{r.text}</p>
                </Card>
              ))}
            </div>
          </section>
        </Section>
    </Layout>
  )
}
