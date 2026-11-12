import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2, Download, FileSignature, Link2Off, Lock, Mail, ShieldCheck } from 'lucide-react'
import { DotGridBackground } from '../components/ui/DotGridBackground'
import { DecorativeOrbs }    from '../components/ui/DecorativeOrbs'
import { Logo }              from '../components/ui/Logo'
import { Card }              from '../components/ui/Card'
import { Button }            from '../components/ui/Button'
import { Spinner, Notice }   from '../components/ui/AsyncState'
import { PdfPreview }        from '../components/documents/PdfPreview'
import { SignatureCanvas, type SignatureCanvasHandle } from '../components/documents/SignatureCanvas'
import { ApiError, NetworkError } from '../api/client'
import {
  signatureApi, downloadPdf, formatDate, formatDateTime, MENTION_SIGNATURE,
  type SignatureInfo,
} from '../api/documents'
import posthog, { posthogLogger } from '../posthog'

const RENVOI_SECONDES = 60

type Ecran =
  | { kind: 'chargement' }
  | { kind: 'invalide' }
  | { kind: 'desactive'; message: string }
  | { kind: 'erreur'; message: string }
  | { kind: 'a_signer'; info: SignatureInfo }
  | { kind: 'signe'; info: SignatureInfo | null; numero: string; preuveId: string | null; dateSignature: string | null }

// ── Mise en page commune ──────────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <DotGridBackground grid />
      <DecorativeOrbs />
      <header className="relative z-10 px-4 sm:px-8 py-5">
        <Logo />
      </header>
      <main className="relative z-10 flex-1 flex items-start justify-center px-4 pb-16">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </div>
  )
}

function StepTitle({ n, children, done }: { n: number; children: React.ReactNode; done?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
        style={done
          ? { background: 'rgba(34,197,94,0.15)', color: '#15803d' }
          : { background: 'linear-gradient(135deg, #6B4FE0, #B42FC4)', color: '#fff' }}
        aria-hidden
      >
        {done ? '✓' : n}
      </span>
      <h2 className="font-display font-bold text-base" style={{ color: '#1a1040', letterSpacing: '-0.3px' }}>{children}</h2>
    </div>
  )
}

function MessageCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Card className="text-center !p-6 sm:!p-10">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
        style={{ background: 'rgba(107,79,224,0.08)', color: '#6B4FE0' }}>
        {icon}
      </div>
      <h1 className="font-display font-extrabold text-2xl mb-3" style={{ color: '#1a1040', letterSpacing: '-0.8px' }}>{title}</h1>
      <div className="text-sm leading-relaxed" style={{ color: 'rgba(30,15,70,0.72)' }}>{children}</div>
    </Card>
  )
}

// ── Confirmation (déjà signé ou signature réussie) ────────────────────────────

function Confirmation({ token, numero, preuveId, dateSignature, juste }: {
  token: string; numero: string; preuveId: string | null; dateSignature: string | null; juste: boolean
}) {
  const [busy,  setBusy]  = useState(false)
  const [error, setError] = useState<string | null>(null)

  const telecharger = async () => {
    setBusy(true)
    setError(null)
    try {
      await downloadPdf(() => signatureApi.pdf(token), `${numero}-signe.pdf`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Téléchargement impossible.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="!p-6 sm:!p-10">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(34,197,94,0.12)', color: '#15803d' }}>
          <CheckCircle2 size={28} />
        </div>
        <h1 className="font-display font-extrabold text-2xl mb-2" style={{ color: '#1a1040', letterSpacing: '-0.8px' }}>
          Contrat signé
        </h1>
        <p className="text-sm" style={{ color: 'rgba(30,15,70,0.72)' }}>
          {juste ? 'Merci, votre signature a bien été enregistrée.' : 'Ce contrat a déjà été signé.'}
        </p>
      </div>

      <dl className="mt-6 rounded-xl p-4 text-sm grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-x-4 gap-y-1 sm:gap-y-2"
        style={{ background: 'rgba(107,79,224,0.04)', border: '1px solid rgba(107,79,224,0.12)' }}>
        <dt style={{ color: 'rgba(30,15,70,0.62)' }}>Contrat</dt>
        <dd className="font-semibold sm:text-right mb-2 sm:mb-0" style={{ color: '#1a1040' }}>{numero}</dd>
        {dateSignature && (<>
          <dt style={{ color: 'rgba(30,15,70,0.62)' }}>Signé le</dt>
          <dd className="sm:text-right mb-2 sm:mb-0" style={{ color: '#1a1040' }}>{formatDateTime(dateSignature)}</dd>
        </>)}
        {preuveId && (<>
          <dt style={{ color: 'rgba(30,15,70,0.62)' }}>Référence de preuve</dt>
          <dd className="sm:text-right font-mono text-xs break-all" style={{ color: '#1a1040' }}>{preuveId}</dd>
        </>)}
      </dl>

      <div className="mt-6 flex flex-col gap-3">
        <Button type="button" onClick={telecharger} disabled={busy}>
          <span className="inline-flex items-center justify-center gap-2">
            <Download size={16} /> {busy ? 'Téléchargement…' : 'Télécharger le contrat signé'}
          </span>
        </Button>
        {error && <Notice tone="error">{error}</Notice>}
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-xl p-4"
        style={{ background: 'rgba(56,189,248,0.07)', border: '1px solid rgba(56,189,248,0.2)' }}>
        <Mail size={18} className="shrink-0 mt-0.5" style={{ color: '#0369a1' }} />
        <p className="text-sm" style={{ color: '#0c4a6e' }}>
          Vous allez recevoir vos accès par e-mail. Une copie du contrat signé vous est également envoyée.
        </p>
      </div>
    </Card>
  )
}

// ── Parcours « à signer » ─────────────────────────────────────────────────────

function ParcoursSignature({ token, info, onSigned, onFatal }: {
  token: string
  info: SignatureInfo
  onSigned: (r: { numero: string; preuveId: string | null }) => void
  onFatal: (e: Ecran) => void
}) {
  const padRef = useRef<SignatureCanvasHandle>(null)
  const [accepte,   setAccepte]   = useState(false)
  const [padVide,   setPadVide]   = useState(true)
  const [code,      setCode]      = useState('')
  const [otpEnvoye, setOtpEnvoye] = useState(false)
  const [otpBusy,   setOtpBusy]   = useState(false)
  const [otpMsg,    setOtpMsg]    = useState<{ tone: 'success' | 'error'; text: string } | null>(null)
  const [restant,   setRestant]   = useState(0)
  const [signing,   setSigning]   = useState(false)
  const [signError, setSignError] = useState<string | null>(null)

  // Compte à rebours avant renvoi du code
  useEffect(() => {
    if (restant <= 0) return
    const t = setTimeout(() => setRestant((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [restant])

  const fetchPdf = useCallback(() => signatureApi.pdf(token), [token])

  const handleFatal = (e: unknown): boolean => {
    if (e instanceof ApiError && e.status === 404) { onFatal({ kind: 'invalide' }); return true }
    if (e instanceof ApiError && e.status === 403) {
      onFatal({ kind: 'desactive', message: e.message })
      return true
    }
    return false
  }

  const demanderCode = async () => {
    setOtpBusy(true)
    setOtpMsg(null)
    try {
      await signatureApi.otp(token)
      setOtpEnvoye(true)
      setRestant(RENVOI_SECONDES)
      setOtpMsg({ tone: 'success', text: `Code envoyé à ${info.signataire.emailMasque}. Il est valable 10 minutes.` })
      posthog.capture('contract_signature_otp_requested')
    } catch (e) {
      if (handleFatal(e)) return
      if (e instanceof ApiError && e.status === 429) {
        // Un code est parti il y a moins d'une minute : le champ reste utilisable
        setOtpEnvoye(true)
        setRestant(RENVOI_SECONDES)
      }
      setOtpMsg({ tone: 'error', text: e instanceof Error ? e.message : "Le code n'a pas pu être envoyé." })
    } finally {
      setOtpBusy(false)
    }
  }

  const codeValide = /^\d{6}$/.test(code)
  const pret = accepte && !padVide && codeValide && !signing

  const signer = async () => {
    setSignError(null)
    if (!accepte) { setSignError('Cochez la case d\'acceptation du contrat.'); return }
    const png = padRef.current?.toCroppedPng() ?? null
    if (!png) { setSignError('Dessinez votre signature dans le cadre avant de signer.'); return }
    if (!codeValide) { setSignError('Saisissez le code à 6 chiffres reçu par e-mail.'); return }

    setSigning(true)
    try {
      const r = await signatureApi.signer(token, code, png)
      posthog.capture('contract_signed')
      onSigned({ numero: r.numero, preuveId: r.preuveId })
    } catch (e) {
      if (handleFatal(e)) return
      if (e instanceof ApiError && e.status === 409) {
        // Déjà signé (double clic, ou réponse perdue lors d'une coupure réseau)
        onSigned({ numero: info.contrat.numero, preuveId: null })
        return
      }
      if (e instanceof ApiError && e.status === 422) {
        const essais = typeof e.data.essaisRestants === 'number' ? e.data.essaisRestants : null
        setSignError(essais !== null && !e.message.includes('essai')
          ? `${e.message} (${essais} essai${essais > 1 ? 's' : ''} restant${essais > 1 ? 's' : ''})`
          : e.message)
        if (essais !== null) setCode('')
      } else if (e instanceof NetworkError) {
        setSignError("Connexion perdue pendant l'envoi. Votre signature n'a peut-être pas été enregistrée : réessayez, vous serez prévenu si le contrat est déjà signé.")
      } else {
        setSignError(e instanceof Error ? e.message : 'La signature a échoué. Réessayez.')
      }
      posthogLogger.warn('contract_signature_failed', { status: e instanceof ApiError ? e.status : 'network' })
    } finally {
      setSigning(false)
    }
  }

  const { contrat, organisation, signataire } = info

  return (
    <div className="flex flex-col gap-4">
      {/* 1. En-tête */}
      <Card className="!p-5 sm:!p-8">
        <div className="flex items-center gap-2 mb-3">
          <FileSignature size={18} style={{ color: '#6B4FE0' }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6B4FE0' }}>Signature électronique</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl mb-1 break-words" style={{ color: '#1a1040', letterSpacing: '-1px' }}>
          Contrat {contrat.numero}
        </h1>
        <p className="text-sm mb-5" style={{ color: 'rgba(30,15,70,0.72)' }}>{organisation}</p>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {[
            ['Signataire', `${signataire.nom}${signataire.fonction ? `, ${signataire.fonction}` : ''}`],
            ['E-mail', signataire.emailMasque],
            ['Offre', contrat.offre],
            ['Début', `${formatDate(contrat.dateDebut)} · ${contrat.dureeMois} mois`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl px-3.5 py-2.5 min-w-0"
              style={{ background: 'rgba(107,79,224,0.04)', border: '1px solid rgba(107,79,224,0.1)' }}>
              <dt className="text-[11px] font-semibold" style={{ color: 'rgba(30,15,70,0.62)' }}>{k}</dt>
              <dd className="font-medium break-words" style={{ color: '#1a1040' }}>{v}</dd>
            </div>
          ))}
        </dl>
        {info.expireLe && (
          <p className="text-xs mt-4" style={{ color: 'rgba(30,15,70,0.62)' }}>
            Lien valable jusqu'au {formatDate(info.expireLe)}.
          </p>
        )}
      </Card>

      {/* 2. Lecture */}
      <Card className="!p-5 sm:!p-8">
        <StepTitle n={1}>Lisez le contrat</StepTitle>
        <PdfPreview
          fetchBlob={fetchPdf}
          filename={`${contrat.numero}.pdf`}
          title={`Contrat ${contrat.numero}`}
          height="min(70vh, 640px)"
          openLabel="Ouvrir le contrat"
        />
        <p className="text-xs mt-2" style={{ color: 'rgba(30,15,70,0.62)' }}>
          Sur iPhone ou iPad, l'aperçu peut n'afficher que la première page : utilisez « Ouvrir le contrat ».
        </p>
      </Card>

      {/* 3. Acceptation */}
      <Card className="!p-5 sm:!p-8">
        <StepTitle n={2} done={accepte}>Acceptez le contrat</StepTitle>
        <label className="flex items-start gap-3 cursor-pointer select-none rounded-xl p-3.5"
          style={{ background: accepte ? 'rgba(107,79,224,0.06)' : 'transparent', border: '1px solid rgba(107,79,224,0.16)' }}>
          <input
            type="checkbox"
            checked={accepte}
            onChange={(e) => setAccepte(e.target.checked)}
            className="mt-0.5 w-5 h-5 shrink-0 cursor-pointer"
            style={{ accentColor: '#6B4FE0' }}
          />
          <span className="text-sm" style={{ color: '#1a1040' }}>
            J'ai lu et j'accepte le contrat.
            <span className="block text-xs mt-1" style={{ color: 'rgba(30,15,70,0.62)' }}>
              Mention apposée sur le document : « {MENTION_SIGNATURE} »
            </span>
          </span>
        </label>
      </Card>

      {/* 4–6. Signature, code, validation : débloqués par l'acceptation */}
      <fieldset disabled={!accepte} className="contents">
        <Card className="!p-5 sm:!p-8">
          <StepTitle n={3} done={!padVide}>Signez</StepTitle>
          {!accepte && (
            <p className="text-xs mb-3 flex items-center gap-1.5" style={{ color: 'rgba(30,15,70,0.62)' }}>
              <Lock size={12} /> Acceptez d'abord le contrat.
            </p>
          )}
          <SignatureCanvas ref={padRef} disabled={!accepte || signing} onChange={setPadVide} />
        </Card>

        <Card className="!p-5 sm:!p-8">
          <StepTitle n={4} done={codeValide}>Confirmez avec le code reçu par e-mail</StepTitle>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              className="btn-action self-start flex items-center gap-1.5"
              onClick={demanderCode}
              disabled={!accepte || otpBusy || restant > 0}
            >
              <Mail size={14} />
              {otpBusy ? 'Envoi…'
                : restant > 0 ? `Renvoyer le code (${restant} s)`
                : otpEnvoye ? 'Renvoyer le code' : 'Recevoir mon code'}
            </button>
            {otpMsg && <Notice tone={otpMsg.tone}>{otpMsg.text}</Notice>}

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold" style={{ color: 'rgba(30,15,70,0.7)' }}>Code à 6 chiffres</span>
              <input
                className="cubi-input ph-no-capture tracking-[0.5em] text-center font-semibold text-lg"
                data-clarity-mask="true"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6}"
                maxLength={6}
                placeholder="••••••"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={!accepte || !otpEnvoye}
                aria-describedby="otp-aide"
              />
              <span id="otp-aide" className="text-[11px]" style={{ color: 'rgba(30,15,70,0.55)' }}>
                5 essais au maximum. Au-delà, le lien est désactivé et l'équipe Cubi vous recontacte.
              </span>
            </label>
          </div>
        </Card>

        <Card className="!p-5 sm:!p-8">
          {signError && <div className="mb-4"><Notice tone="error">{signError}</Notice></div>}
          <Button type="button" onClick={signer} disabled={!pret} aria-busy={signing}>
            {signing ? 'Signature en cours…' : 'Signer le contrat'}
          </Button>
          {signing && (
            <p className="text-xs text-center mt-3" style={{ color: 'rgba(30,15,70,0.62)' }}>
              Génération du contrat signé, cela peut prendre quelques secondes. Ne fermez pas la page.
            </p>
          )}
          <p className="text-[11px] text-center mt-4 flex items-center justify-center gap-1.5" style={{ color: 'rgba(30,15,70,0.55)' }}>
            <ShieldCheck size={12} /> Signature électronique simple (eIDAS) : horodatage, code à usage unique et empreinte du document.
          </p>
        </Card>
      </fieldset>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function Signature() {
  const { token = '' } = useParams<{ token: string }>()
  const [ecran, setEcran] = useState<Ecran>({ kind: 'chargement' })
  const [justSigned, setJustSigned] = useState(false)

  useEffect(() => {
    document.title = 'Signature du contrat · CUBI'
    // Pas d'enregistrement de session ici : URL avec token et signature manuscrite
    posthog.stopSessionRecording?.()
  }, [])

  const charger = useCallback(async () => {
    setEcran({ kind: 'chargement' })
    try {
      const info = await signatureApi.get(token)
      if (info.statut === 'signe') {
        setEcran({ kind: 'signe', info, numero: info.contrat.numero, preuveId: info.preuveId ?? null, dateSignature: info.dateSignature ?? null })
      } else if (info.statut === 'a_signer') {
        setEcran({ kind: 'a_signer', info })
      } else {
        setEcran({ kind: 'invalide' })
      }
    } catch (e) {
      if (e instanceof ApiError && (e.status === 404 || e.status === 400)) setEcran({ kind: 'invalide' })
      else if (e instanceof ApiError && e.status === 403) setEcran({ kind: 'desactive', message: e.message })
      else setEcran({ kind: 'erreur', message: e instanceof Error ? e.message : 'Une erreur est survenue.' })
    }
  }, [token])

  useEffect(() => { void charger() }, [charger])

  const onSigned = async ({ numero, preuveId }: { numero: string; preuveId: string | null }) => {
    setJustSigned(true)
    // Recharge pour récupérer la date et la preuve (utile si la réponse a été un 409)
    try {
      const info = await signatureApi.get(token)
      setEcran({ kind: 'signe', info, numero, preuveId: preuveId ?? info.preuveId ?? null, dateSignature: info.dateSignature ?? null })
    } catch {
      setEcran({ kind: 'signe', info: null, numero, preuveId, dateSignature: null })
    }
  }

  return (
    <Shell>
      {ecran.kind === 'chargement' && <Card className="!p-6"><Spinner label="Chargement du contrat…" /></Card>}

      {ecran.kind === 'invalide' && (
        <MessageCard icon={<Link2Off size={26} />} title="Lien invalide ou expiré">
          Ce lien de signature est invalide, a expiré ou a été remplacé par un lien plus récent.
          <br />Contactez l'équipe Cubi pour en recevoir un nouveau.
        </MessageCard>
      )}

      {ecran.kind === 'desactive' && (
        <MessageCard icon={<Lock size={26} />} title="Lien désactivé">
          {ecran.message || "Ce lien a été désactivé après plusieurs codes erronés. L'équipe Cubi va vous recontacter."}
        </MessageCard>
      )}

      {ecran.kind === 'erreur' && (
        <MessageCard icon={<Link2Off size={26} />} title="Chargement impossible">
          <p className="mb-5">{ecran.message}</p>
          <button type="button" className="btn-action" onClick={() => void charger()}>Réessayer</button>
        </MessageCard>
      )}

      {ecran.kind === 'a_signer' && (
        <ParcoursSignature token={token} info={ecran.info} onSigned={onSigned} onFatal={setEcran} />
      )}

      {ecran.kind === 'signe' && (
        <Confirmation token={token} numero={ecran.numero} preuveId={ecran.preuveId} dateSignature={ecran.dateSignature} juste={justSigned} />
      )}
    </Shell>
  )
}
