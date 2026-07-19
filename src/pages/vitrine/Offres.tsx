import { Link } from 'react-router-dom'
import { CheckCircle2, Quote } from 'lucide-react'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Section } from '../../components/ui/Section'

interface Plan {
  name: string
  tagline: string
  price: string
  priceSuffix?: string
  features: string[]
  cta: { label: string; to: string }
  highlighted?: boolean
  badge?: string
}

const PLANS: Plan[] = [
  {
    name: 'Licence Découverte',
    tagline: "L'essentiel pour découvrir, sans engagement",
    price: '5,00 €',
    priceSuffix: '/session/mois',
    features: [
      'Jusqu\u2019à 30 sessions / mois',
      'Tarif à la session : 5,00 €',
      '2 vCPU · 4 Go RAM par poste',
      'Tableau de bord administrateur',
      'Conformité RGPD incluse',
      'Support par email',
    ],
    cta: { label: 'S\u2019inscrire', to: '/inscription' },
  },
  {
    name: 'Licence Standard',
    tagline: 'Le bon équilibre pour un établissement en croissance',
    price: '4,00 €',
    priceSuffix: '/session/mois',
    features: [
      'De 31 à 100 sessions / mois',
      'Tarif dégressif : 4,00 €/session',
      'Multi-classes et multi-comptes',
      'Rapports d\u2019usage avancés',
      'Tableau de bord administrateur',
      'Support prioritaire 5j/7',
    ],
    cta: { label: 'S\u2019inscrire', to: '/inscription' },
    highlighted: true,
    badge: '★ Populaire',
  },
  {
    name: 'Licence Premium',
    tagline: 'Sans limites, entièrement sur-mesure',
    price: 'Sur devis',
    features: [
      'Sessions illimitées à partir de 101/mois',
      'Tarif le plus avantageux : 3,00 €/session',
      '4 vCPU · 8 Go RAM — ressources personnalisables',
      'Configuration 100 % sur-mesure',
      'CSM dédié & formation sur site',
      'SLA 99,9 % garanti & accès API complet',
    ],
    cta: { label: 'Nous contacter', to: '/contact' },
  },
]

const REVIEWS = [
  { initials: 'MF', name: 'Michèle F.', role: 'Directrice, lycée Jean Moulin', text: "Le déploiement s'est fait sans friction pour nos équipes, et le support répond vraiment vite." },
  { initials: 'JD', name: 'Jean D.', role: 'Responsable informatique', text: 'Le tableau de bord nous fait gagner un temps fou pour gérer les comptes de tous nos établissements.' },
  { initials: 'SL', name: 'Sophie L.', role: 'Directrice des systèmes d\u2019information', text: "Hébergement en France, tarif dégressif, support réactif : exactement ce qu'il nous fallait." },
]

export function Offres() {
  return (
    <Layout>
      <Section id="top"className="container-page pt-16 pb-10 text-center section-top" >
        <Badge variant="violet" dot>Nos licences</Badge>
        <h1
          className="font-display font-extrabold mt-6 mx-auto max-w-xl"
          style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', letterSpacing: '-1px', color: 'var(--color-cubi-ink)' }}
        >
          Une licence pour chaque établissement
        </h1>
        <p className="mt-4 mx-auto max-w-lg text-sm sm:text-base" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 55.0%, transparent)' }}>
          Vos postes de travail cloud, facturés à la session, avec un tarif dégressif selon votre volume
          d'utilisation. Sans engagement, résiliable à tout moment.
        </p>
      </Section>

      {/* Pricing cards */}
      <section className="container-page py-12 section-full" style={{ background: 'radial-gradient(circle, rgba(232,121,249,.28), transparent 50%)' }}>
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="rounded-3xl p-8 flex flex-col h-full"
              style={
                plan.highlighted
                  ? {
                      background: 'linear-gradient(160deg, #7C5CF0 0%, #9B6FF5 55%, #C77DF3 100%)',
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
                className="text-sm mt-1.5"
                style={{ color: plan.highlighted ? 'rgba(255,255,255,0.8)' : 'color-mix(in srgb, var(--color-cubi-ink) 50%, transparent)' }}
              >
                {plan.tagline}
              </p>

              <div className="mt-6">
                <span
                  className="font-display font-extrabold text-3xl sm:text-4xl"
                  style={{ color: plan.highlighted ? '#fff' : 'var(--color-cubi-violet)' }}
                >
                  {plan.price}
                </span>
                {plan.priceSuffix && (
                  <span
                    className="text-sm ml-1"
                    style={{ color: plan.highlighted ? 'rgba(255,255,255,0.75)' : 'color-mix(in srgb, var(--color-cubi-ink) 40%, transparent)' }}
                  >
                    {plan.priceSuffix}
                  </span>
                )}
              </div>

              <ul className="flex flex-col gap-2.5 mt-7 mb-8 list-none p-0 flex-1">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 text-sm"
                    style={{ color: plan.highlighted ? 'rgba(255,255,255,0.9)' : 'color-mix(in srgb, var(--color-cubi-ink) 65%, transparent)' }}
                  >
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0"
                      color={plan.highlighted ? '#ffffff' : 'var(--color-cubi-violet)'}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <Link to={plan.cta.to} className="no-underline mt-auto">
                <button
                  className="w-full py-3.5 rounded-full font-semibold text-sm border-none cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
                  style={{
                    fontFamily: 'var(--font-display)',
                    background: plan.highlighted ? '#ffffff' : 'color-mix(in srgb, var(--color-cubi-violet) 10%, transparent)',
                    color: 'var(--color-cubi-violet)',
                  }}
                >
                  {plan.cta.label}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Descriptive block */}
      <Section className="container-page py-16 section-full">
        <Card className="flex flex-col sm:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="font-display font-bold text-xl sm:text-2xl" style={{ color: 'var(--color-cubi-ink)' }}>
              Besoin d'aide pour choisir votre licence ?
            </h2>
            <p className="mt-3 text-sm sm:text-base" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 55.0%, transparent)' }}>
              Décrivez-nous la taille de votre établissement et votre volume d'usage estimé : nous vous
              recommandons la formule la plus adaptée, sans engagement.
            </p>
          </div>
          <div
            className="w-full sm:w-56 h-36 rounded-2xl shrink-0"
            style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-cubi-violet) 12%, transparent), color-mix(in srgb, var(--color-cubi-rose) 12%, transparent))', border: '1px solid color-mix(in srgb, var(--color-cubi-violet) 14.0%, transparent)' }}
          />
        </Card>
      </Section>

          {/* Testimonial quote */}
          <section className="container-page py-14 section-top">
            <div className="max-w-2xl mx-auto text-center">
              <Quote size={28} color="var(--color-cubi-mauve)" className="mx-auto mb-4" />
              <p className="font-display font-bold text-xl sm:text-2xl" style={{ color: 'var(--color-cubi-ink)', letterSpacing: '-0.4px' }}>
                "Le genre d'infrastructure qu'on aimerait avoir eue dès le premier déploiement."
              </p>
            </div>
          </section>

          {/* Reviews */}
          <section className="container-page py-16 section-general">
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
    </Layout>
  )
}
