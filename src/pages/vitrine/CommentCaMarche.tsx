import { Link } from 'react-router-dom'
import { CalendarCheck, Link2, MonitorCheck, MessageCircleQuestion, ArrowRight, FileText, KeyRound, UploadCloud, LogInIcon } from 'lucide-react'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Section } from '../../components/ui/Section'

const STEPS = [
  {
    icon: FileText,
    title: 'Demandez un devis',
    text: "Indiquez votre volume de sessions simultanées estimé. Notre équipe qualifie votre besoin et vous transmet un devis au format PDF, à partir duquel votre établissement édite son propre bon de commande.",
  },
  {
    icon: KeyRound,
    title: 'Activez votre console d\u2019administration',
    text: 'Dès réception du bon de commande, l\u2019accès à votre espace administrateur est activé pour votre DSI ou contact primaire',
  },
  {
    icon: UploadCloud,
    title: 'Importez vos promotions',
    text: 'Chargez vos fichiers CSV ou Excel d\u2019étudiants (et même éventuellement des utilisateurs tiers comme des enseignants & intervenants): un script de vérification nettoie automatiquement les doublons avant l\u2019injection dans la base.',
  },
  {
    icon: LogInIcon,
    title: 'Laissez les étudiants s\u2019y connecter',
    text: 'Une réinitialisation de mot de passe sera nécessaire pour chacun. Mais ensuite, chaque utilisateur pourra retrouver son poste virtuel en se connectant simplement via l\u2019application desktop.',
  },
]

export function CommentCaMarche() {
  return (
    <Layout>
      <Section id="top" className="container-page pt-16 pb-10 text-center section-top" style={{ paddingBottom: 'var(--big-padding-section)' }}>
        <Badge variant="violet" dot>Comment ça marche</Badge>
        <h1
          className="font-display font-extrabold mt-6 mx-auto max-w-lg"
          style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', letterSpacing: '-1px', color: 'var(--color-cubi-ink)' }}
        >
          Quatre étapes, du premier clic à la solution
        </h1>
        <p className="mt-4 mx-auto max-w-lg text-sm sm:text-base" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 55.0%, transparent)' }}>
          Pas d'installation, pas de jargon : voici exactement ce qui se passe entre votre réservation et la fin de
          votre session.
        </p>
      </Section>

      <section className="container-page py-10 max-w-2xl mx-auto" style={{ background: 'radial-gradient(circle, rgba(232,121,249,.28), transparent 80%)' }}>
        <div className="flex flex-col gap-5">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <Card key={step.title} className="!p-6 sm:!p-7 flex items-start gap-5">
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center font-display font-extrabold text-sm"
                    style={{ background: 'linear-gradient(135deg, var(--color-cubi-violet), var(--color-cubi-mauve))', color: '#fff' }}
                  >
                    {i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <span className="w-px flex-1 mt-2" style={{ background: 'color-mix(in srgb, var(--color-cubi-violet) 15%, transparent)', minHeight: '24px' }} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon size={17} color="var(--color-cubi-violet)" />
                    <h3 className="font-display font-bold text-base" style={{ color: 'var(--color-cubi-ink)' }}>{step.title}</h3>
                  </div>
                  <p className="text-sm" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 55.0%, transparent)' }}>{step.text}</p>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <Link to="/offres" className="no-underline">
            <Button fullWidth={false} style={{ display: 'inline-flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
              Réserver mes premières sessions<ArrowRight size={16}/>
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  )
}
