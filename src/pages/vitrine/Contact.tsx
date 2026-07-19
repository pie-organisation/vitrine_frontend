import { useState } from 'react'
import { Mail, Phone, Clock, CheckCircle2 } from 'lucide-react'
import { Layout } from '../../components/layout/Layout'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Section } from '../../components/ui/Section'

export function Contact() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <Layout airbrush>
        <Section id="top" className="container-page text-center section-top">
          <Badge variant="violet" dot>Contact</Badge>
          <h1
            className="font-display font-extrabold mt-6 mx-auto max-w-3xl"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', letterSpacing: '-1px', color: 'var(--color-cubi-ink)' }}
          >
            Une question ? Besoin d'aide ? <br />Contactez-nous
          </h1>
          <p className="mt-4 mx-auto max-w-3xl text-sm sm:text-base" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 55.0%, transparent)' }}>
            Échangez par mail avec un membre de notre équipe pour recevoir une réponse sous 24h ouvrées. Sinon, pour toute question ne figurant pas dans la FAQ ou recevoir une assistance urgente, n'hésitez pas à nous contacter directement par téléphone afin d'avoir une réponse encore plus rapide !
          </p>
        </Section>

        <Section className="container-page py-10 section-general">
          <Card className="!p-0 overflow-hidden max-w-4xl mx-auto">
            <div className="grid md:grid-cols-[1.2fr_0.8fr]">
              {/* Form */}
              <div className="p-6 sm:p-8 md:p-10">
                {sent ? (
                  <div className="text-center py-8">
                    <CheckCircle2 size={40} color="var(--color-cubi-success)" className="mx-auto mb-4" />
                    <h2 className="font-display font-bold text-xl" style={{ color: 'var(--color-cubi-ink)' }}>
                      Message envoyé
                    </h2>
                    <p className="text-sm mt-2" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 55.0%, transparent)' }}>
                      Merci, nous revenons vers vous très vite.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Input label="Nom" name="name" placeholder="Votre nom" required />
                      <Input label="E-mail" type="email" name="email" placeholder="vous@exemple.fr" required />
                    </div>
                    <Input label="Sujet" name="subject" placeholder="En quoi pouvons-nous vous aider ?" />
                    <Textarea label="Message" name="message" placeholder="Décrivez votre besoin en quelques mots..." required />
                    <Button type="submit" fullWidth={false} className="self-start">
                      Envoyer le message
                    </Button>
                  </form>
                )}
              </div>

              {/* Direct contact — same card, divided by a line matching the input border */}
              <div
                className="p-6 sm:p-8 md:p-10 border-t md:border-t-0 md:border-l"
                style={{ borderColor: 'rgba(107, 79, 224, 0.25)' }}
              >
                <h3 className="font-display font-bold text-lg mb-5" style={{ color: 'var(--color-cubi-ink)' }}>
                  Nous contacter directement
                </h3>
                <ul className="flex flex-col gap-4 list-none p-0 m-0">
                  <li className="flex items-start gap-3">
                    <Mail size={17} color="var(--color-cubi-violet)" className="mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold" style={{ color: 'var(--color-cubi-ink)' }}>E-mail</div>
                      <div className="text-sm" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 55.0%, transparent)' }}>contact@cubi.fr</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Phone size={17} color="var(--color-cubi-violet)" className="mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold" style={{ color: 'var(--color-cubi-ink)' }}>Téléphone</div>
                      <div className="text-sm" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 55.0%, transparent)' }}>01 23 45 67 89</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock size={17} color="var(--color-cubi-violet)" className="mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold" style={{ color: 'var(--color-cubi-ink)' }}>Disponibilité</div>
                      <div className="text-sm" style={{ color: 'color-mix(in srgb, var(--color-cubi-ink) 55.0%, transparent)' }}>Du lundi au samedi, 9h – 19h</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </Section>
    </Layout>
  )
}