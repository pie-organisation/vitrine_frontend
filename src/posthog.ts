import posthog from 'posthog-js'

/** /signature/<token>… → /signature/[token]… */
export function redactSignatureToken(url: string): string {
  return url.replace(/\/signature\/(?!verifier\/)[^/?#\s]+/g, '/signature/[token]')
}

/** Page publique de signature : pas d'enregistrement de session (token dans l'URL, signature manuscrite). */
export const isSignaturePage = () => window.location.pathname.startsWith('/signature/')

const posthogKey = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const posthogHost = import.meta.env.VITE_POSTHOG_HOST as string | undefined

if (!posthogKey) {
  if (import.meta.env.DEV) {
    throw new Error(
      'VITE_POSTHOG_KEY variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once VITE_POSTHOG_KEY is configured',
    )
  }
} else if (!posthogHost) {
  if (import.meta.env.DEV) {
    throw new Error(
      'VITE_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once VITE_POSTHOG_HOST is configured',
    )
  }
} else {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    defaults: '2026-08-30',
    // Le token d'un lien de signature donne accès au contrat : il ne doit jamais partir en analytics
    before_send: (event) => {
      if (!event?.properties) return event
      for (const [k, v] of Object.entries(event.properties)) {
        if (typeof v === 'string' && v.includes('/signature/')) {
          event.properties[k] = redactSignatureToken(v)
        }
      }
      return event
    },
    capture_exceptions: {
      capture_unhandled_errors: true,
      capture_unhandled_rejections: true,
      capture_console_errors: false,
    },
    logs: {
      serviceName: 'cubi-admin-web',
      environment: import.meta.env.MODE,
    },
  })
}

export const posthogLogger = posthog.logger

export default posthog
