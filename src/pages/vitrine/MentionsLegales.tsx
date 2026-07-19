import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Section } from '../../components/ui/Section'

export function MentionsLegales() {
  return (
    <Layout airbrush>
      <Section className="container-page pt-16 pb-10 text-center section-top">
        <Badge variant="violet" dot>Informations légales</Badge>
        <h1
          className="font-display font-extrabold mt-6 mx-auto max-w-lg"
          style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', letterSpacing: '-1px', color: 'var(--color-cubi-ink)' }}
        >
          Mentions légales & CGV
        </h1>
      </Section>

      <Section className="flex flex-col gap-8 section-general">
        <Card className="!p-7 sm:!p-9">
          <h2 className="font-display font-bold text-2xl sm:text-3xl mt-4" style={{ color: 'color-mix(in srgb, #6B4FE0 33%, #C084FC 33%, #E879F9 34%)', letterSpacing: '-0.6px' }}>Éditeur du site</h2>
          <br />
          <p className="text-sm leading-relaxed" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 60%, transparent)' }}>
            CUBI — [Forme juridique à compléter], au capital de [montant] €, immatriculée au RCS de [ville] sous le
            numéro [SIRET]. Siège social : [adresse]. Directeur de la publication : [nom]. Contact :
            contact@cubi.fr.
          </p>
        </Card>

        <Card className="!p-7 sm:!p-9">
          <h2 className="font-display font-bold text-2xl sm:text-3xl mt-4" style={{ color: 'color-mix(in srgb, #6B4FE0 33%, #C084FC 33%, #E879F9 34%)', letterSpacing: '-0.6px' }}>Hébergement</h2>
          <br />
          <p className="text-sm leading-relaxed" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 60%, transparent)' }}>
            Ce site est hébergé par [nom de l'hébergeur], [adresse de l'hébergeur].
          </p>
        </Card>

        <Card className="!p-7 sm:!p-9">
          <h2 className="font-display font-bold text-2xl sm:text-3xl mt-4" style={{ color: 'color-mix(in srgb, #6B4FE0 33%, #C084FC 33%, #E879F9 34%)', letterSpacing: '-0.6px' }}>Données personnelles</h2>
          <br />
          <p className="text-sm leading-relaxed" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 60%, transparent)' }}>
            Les informations recueillies via le formulaire de contact sont utilisées uniquement pour répondre à votre
            demande. Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos
            données, à exercer à l'adresse contact@cubi.fr.
          </p>
        </Card>

        <Card id="cgv" className="!p-7 sm:!p-9 scroll-mt-24">
          <h2 className="font-display font-bold text-2xl sm:text-3xl mt-4" style={{ color: 'color-mix(in srgb, #6B4FE0 33%, #C084FC 33%, #E879F9 34%)', letterSpacing: '-0.6px' }}>Conditions générales de vente (CGV)</h2>
          <br />
          <div className="flex flex-col gap-4 text-sm leading-relaxed" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 60%, transparent)' }}>
            <p>
              <strong style={{ color: 'var(--color-cubi-ink)' }}>Objet — </strong>
              Les présentes CGV encadrent la vente de sessions d'accompagnement informatique à distance proposées par
              CUBI, telles que décrites sur la page Offres.
            </p>
            <p>
              <strong style={{ color: 'var(--color-cubi-ink)' }}>Réservation — </strong>
              Toute session est réservée en ligne et confirmée par e-mail. Le paiement est exigible au moment de la
              réservation.
            </p>
            <p>
              <strong style={{ color: 'var(--color-cubi-ink)' }}>Annulation et remboursement — </strong>
              Une session peut être annulée et remboursée jusqu'à 24h avant le créneau réservé. Passé ce délai, la
              session reste due.
            </p>
            <p>
              <strong style={{ color: 'var(--color-cubi-ink)' }}>Responsabilité — </strong>
              CUBI s'engage à apporter une assistance de bonne foi, sans garantie de résultat sur les problèmes dont
              l'origine dépasse le champ de l'accompagnement (panne matérielle, par exemple).
            </p>
          </div>
        </Card>
      </Section>
    </Layout>
  )
}
