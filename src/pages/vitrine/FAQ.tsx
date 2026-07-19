import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Section } from '../../components/ui/Section'
import { Badge } from '../../components/ui/Badge'

const FAQ_ITEMS: { category: string; items: { q: string; a: string }[] }[] = [
  {
    category: 'Fonctionnement',
    items: [
      {
        q: 'Ai-je besoin d\u2019installer un logiciel complexe pour utiliser CUBI ?',
        a: 'Non. Une application desktop ultra-légère sert uniquement de fenêtre d\u2019authentification et de terminal d\u2019affichage : l\u2019exécution lourde (compilation, calcul, IA) reste sur le serveur CUBI, pas sur l\u2019ordinateur de l\u2019étudiant.',
      },
      {
        q: 'Quel matériel est nécessaire pour se connecter ?',
        a: 'N\u2019importe quel ordinateur Windows, macOS ou Linux, y compris un poste ancien de salle informatique. La puissance de calcul est fournie par l\u2019infrastructure CUBI, pas par le terminal de l\u2019étudiant.',
      },
      {
        q: 'Les enseignants ont-ils un tableau de bord de gestion ?',
        a: 'Non. Les enseignants et intervenants ne disposent d\u2019aucun outil d\u2019administration ni d\u2019action de gestion : ils bénéficient simplement d\u2019un environnement identique et prêt à l\u2019emploi pour toute leur classe, déployé par la DSI.',
      },
    ],
  },
  {
    category: 'Sécurité et données',
    items: [
      {
        q: 'Où sont hébergées les données de l\u2019établissement ?',
        a: 'Exclusivement en France — sur le serveur physique de l\u2019établissement pour un déploiement pilote, ou sur un cloud souverain pour la montée en charge. Le traitement reste imperméable aux lois extraterritoriales et conforme au RGPD.',
      },
      {
        q: 'Qui est responsable des données au sens du RGPD ?',
        a: 'L\u2019établissement conserve la qualité de responsable de traitement pour l\u2019ensemble des données étudiantes et enseignantes. CUBI intervient strictement comme sous-traitant : aucune donnée n\u2019est monétisée ni exploitée par la plateforme.',
      },
      {
        q: 'Deux personnes peuvent-elles se connecter en même temps sur le même compte ?',
        a: 'Non, par mesure de sécurité, toute tentative de double connexion simultanée sur un même compte est automatiquement bloquée.',
      },
    ],
  },
  {
    category: 'Tarifs et souscription',
    items: [
      {
        q: 'Comment est calculé le tarif ?',
        a: 'Sur le nombre de sessions simultanées réellement nécessaires à l\u2019établissement avec un tarif dégressif par palier de volume.',
      },
      {
        q: 'Puis-je souscrire et payer directement en ligne ?',
        a: 'Pour les forfaits Découverte et Standard, vous pouvez démarrer votre inscription directement en ligne. Pour un besoin sur-mesure au-delà de 300 sessions, un devis personnalisé est établi avec notre équipe via la page contact.',
      },
      {
        q: 'Que se passe-t-il si un étudiant utilise son environnement en dehors des cours ?',
        a: 'Si une session de classe réservée débute, l\u2019étudiant reçoit une alerte 15 minutes avant la bascule pour sauvegarder son travail ; sa session personnelle se ferme ensuite proprement et la ressource est réallouée au cours.',
      },
      {
        q: 'Quelle disponibilité CUBI garantit-il ?',
        a: 'Un taux de disponibilité de 99,5 % de la console d\u2019administration sur les plages académiques, du lundi au samedi de 7h à 22h.',
      },
    ],
  },
]

interface FAQRowProps {
  q: string
  a: string
  isOpen: boolean
  onToggle: () => void
  isLast: boolean
}

function FAQRow({ q, a, isOpen, onToggle, isLast }: FAQRowProps) {
  return (
    <div className={`py-4 ${!isLast ? 'border-b' : ''}`} style={{ borderColor: 'color-mix(in srgb, var(--color-cubi-violet) 10%, transparent)' }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 text-left bg-transparent border-none cursor-pointer p-0"
      >
        <span className="text-sm font-semibold" style={{ color: 'var(--color-cubi-ink)', fontFamily: 'var(--font-sans)' }}>
          {q}
        </span>
        <ChevronDown
          size={16}
          className="shrink-0"
          style={{
            color: 'var(--color-cubi-violet)',
            transition: 'transform 0.25s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      <div
        style={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.3s ease',
        }}
      >
        <div className="overflow-hidden">
          <p className="text-sm pt-3 pr-6" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 60%, transparent)' }}>
            {a}
          </p>
        </div>
      </div>
    </div>
  )
}

export function FAQ() {
  const [openKey, setOpenKey] = useState<string | null>(null)

  return (
    <Layout>
      <Section id="top" className="container-page pt-16 pb-10 text-center section-top">
        <Badge variant="violet" dot>Questions fréquentes</Badge>
        <h1
          className="font-display font-extrabold mt-6 mx-auto max-w-xl"
          style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', letterSpacing: '-1px', color: 'var(--color-cubi-ink)' }}
        >
          Tout ce que vous voulez savoir avant de vous lancer
        </h1>
      </Section>

      <section className="mx-auto" style={{ paddingTop: 'var(--small-padding-section)', paddingLeft: '2rem ', paddingRight: '2rem ' }}>
        <Card className="!p-6 sm:!p-9">
          {FAQ_ITEMS.map((group, gi) => (
            <div key={group.category} className={gi > 0 ? 'mt-9' : ''}>
              <h2 className="font-display font-bold text-2xl sm:text-3xl mt-4" style={{ color: 'color-mix(in srgb, #6B4FE0 33%, #C084FC 33%, #E879F9 34%)', letterSpacing: '-0.6px' }}>{group.category}</h2>
              <br />
              <div>
                {group.items.map((item, ii) => {
                  const key = `${group.category}-${item.q}`
                  return (
                    <FAQRow
                      key={key}
                      q={item.q}
                      a={item.a}
                      isOpen={openKey === key}
                      onToggle={() => setOpenKey(openKey === key ? null : key)}
                      isLast={ii === group.items.length - 1 && gi === FAQ_ITEMS.length - 1}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </Card>
      </section>
    </Layout>
  )
}
