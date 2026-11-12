// Centralized API client — reads base URL from env, injects JWT, handles errors uniformly.

const API_BASE = ((import.meta.env.VITE_API_BASE_URL as string) ?? '').replace(/\/$/, '')

// ── Error type ────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    /** Corps JSON brut de l'erreur : champs métier (essaisRestants, action…). */
    public readonly data: Record<string, unknown> = {},
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/** Back injoignable (coupure réseau, CORS) : distinct d'une erreur HTTP. */
export class NetworkError extends Error {
  constructor() {
    super('Connexion impossible. Vérifiez votre réseau puis réessayez.')
    this.name = 'NetworkError'
  }
}

interface ErrorBody { error?: string; message?: string; [k: string]: unknown }

// Convention du back : { message } pour les 422, { error } sinon. `error` est tantôt un code
// ('organisation_inactive', 'reset_required'), tantôt une phrase : on n'affiche que les phrases.
const isSentence = (s: unknown): s is string => typeof s === 'string' && /\s/.test(s)

function humanText(body: ErrorBody): string | undefined {
  if (typeof body.message === 'string' && body.message) return body.message
  if (isSentence(body.error)) return body.error
  return undefined
}

// ── Token helpers ─────────────────────────────────────────────────────────────

export const TOKEN_KEY = 'cubi_token'
export const USER_KEY  = 'cubi_user'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

interface RequestOptions extends RequestInit {
  /** false : route publique (lien de signature) — ni JWT, ni redirection vers /login sur 401. */
  auth?: boolean
}

async function send(path: string, { auth = true, ...init }: RequestOptions = {}): Promise<Response> {
  const token = auth ? getToken() : null

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string> | undefined),
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, headers })
  } catch {
    throw new NetworkError()
  }
  if (res.ok) return res

  const body = await res.json().catch(() => ({})) as ErrorBody
  const code = typeof body.error === 'string' && !isSentence(body.error) ? body.error : 'ERROR'

  // 401 sur le login = identifiants incorrects : on laisse le formulaire afficher
  // l'erreur, sans vider le storage ni rediriger. Idem pour les routes publiques.
  if (res.status === 401 && (path === ENDPOINTS.login || !auth)) {
    throw new ApiError(401, code, humanText(body) ?? 'Email ou mot de passe incorrect.', body)
  }

  // 401 ailleurs → session expirée, on vide le storage et on redirige vers la
  // connexion de l'espace courant (admin Cubi ou client).
  if (res.status === 401) {
    clearAuth()
    const loginPage = window.location.pathname.startsWith('/admin') ? '/admin/login' : '/login'
    if (window.location.pathname !== loginPage) {
      window.location.href = loginPage
    }
    throw new ApiError(401, code, body.message ?? 'Session expirée, veuillez vous reconnecter.', body)
  }

  // Autres erreurs HTTP : la phrase du back si elle existe, sinon un libellé générique
  const human = humanText(body)
  const message =
    res.status === 403 ? (human ?? 'Accès refusé.') :
    res.status === 404 ? (human ?? 'Ressource introuvable.') :
    res.status === 409 ? (human ?? 'Conflit — cette ressource existe déjà.') :
    res.status === 422 ? (body.message ?? 'Données invalides.') :
    res.status === 429 ? (human ?? 'Trop de requêtes. Réessayez dans quelques minutes.') :
    res.status === 502 ? (human ?? 'Service momentanément indisponible, veuillez réessayer.') :
    res.status >= 500  ? 'Erreur serveur, veuillez réessayer.' :
    (human ?? 'Une erreur est survenue.')
  throw new ApiError(res.status, code, message, body)
}

async function request<T>(path: string, init: RequestOptions = {}): Promise<T> {
  const res = await send(path, init)
  // 204 No Content
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

/** GET + total de l'en-tête X-Total-Count (null s'il est absent ou non exposé par CORS). */
async function requestWithTotal<T>(path: string): Promise<{ data: T; total: number | null }> {
  const res = await send(path)
  const raw = res.headers.get('X-Total-Count')
  const total = raw !== null && raw.trim() !== '' && Number.isFinite(Number(raw)) ? Number(raw) : null
  return { data: await res.json() as T, total }
}

/** Fichier (PDF) récupéré avec le JWT : un simple <a href> n'envoie pas l'en-tête Authorization. */
async function requestBlob(path: string, auth = true): Promise<Blob> {
  const res = await send(path, { auth })
  return res.blob()
}

// ── Public API surface ────────────────────────────────────────────────────────

export const api = {
  get:    <T>(path: string)                     => request<T>(path),
  getWithTotal: <T>(path: string)               => requestWithTotal<T>(path),
  blob:   (path: string)                        => requestBlob(path),
  post:   <T>(path: string, body: unknown = {}) => request<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown)      => request<T>(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown)      => request<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: <T>(path: string)                     => request<T>(path, { method: 'DELETE' }),
}

/** Routes publiques (page de signature) : sans JWT, sans redirection vers /login. */
export const publicApi = {
  get:  <T>(path: string)                     => request<T>(path, { auth: false }),
  post: <T>(path: string, body: unknown = {}) => request<T>(path, { method: 'POST', body: JSON.stringify(body), auth: false }),
  blob: (path: string)                        => requestBlob(path, false),
}

// ── Endpoint map (update here when backend confirms routes) ───────────────────
// All paths are relative to VITE_API_BASE_URL.

export const ENDPOINTS = {
  // Auth
  login:          '/auth/login',
  inscription:    '/auth/inscription',
  licences:       '/auth/licences',
  motDePasseReset:'/auth/reset-password',

  // Current user
  me:             '/me',
  mePassword:     '/me/password',

  // Admin — dashboard
  metriques:      '/admin/metriques',
  alertes:        '/admin/alertes',
  notifications:  '/admin/notifications',
  analytics:      '/admin/analytiques',

  // Admin — CRUD
  organisations:       '/admin/organisations',
  organisation:        (id: string) => `/admin/organisations/${id}`,
  organisationSuspendre: (id: string) => `/admin/organisations/${id}/suspendre`,
  organisationReactiver: (id: string) => `/admin/organisations/${id}/reactiver`,
  demandes:            '/admin/demandes',
  demande:             (id: string) => `/admin/demandes/${id}`,
  factures:            '/admin/factures',
  facture:             (id: string) => `/admin/factures/${id}`,
  facturePdf:          (id: string) => `/admin/factures/${id}/pdf`,
  facturePayer:        (id: string) => `/admin/factures/${id}/payer`,
  factureAvoir:        (id: string) => `/admin/factures/${id}/avoir`,
  factureRenvoyer:     (id: string) => `/admin/factures/${id}/renvoyer`,
  factureEmettre:      '/admin/factures/emettre',
  contrats:            '/admin/contrats',
  contrat:             (id: string) => `/admin/contrats/${id}`,
  contratPdf:          (id: string) => `/admin/contrats/${id}/pdf`,
  contratAction:       (id: string, action: 'envoyer' | 'renvoyer' | 'annuler' | 'activer') =>
                         `/admin/contrats/${id}/${action}`,
  logs:                '/admin/journaux',
  equipe:              '/admin/equipe',
  membreEquipe:        (id: string) => `/admin/equipe/${id}`,
  messages:            '/admin/messages',
  message:             (id: string) => `/admin/messages/${id}`,
  messageReponse:      (id: string) => `/admin/messages/${id}/reponses`,
  messageClients:      '/admin/messages/clients',
  offres:              '/admin/offres',
  offre:               (id: string) => `/admin/offres/${id}`,
  plans:               '/admin/plans',
  plan:                (id: string) => `/admin/plans/${id}`,

  // School
  schoolOrg:           '/school/organisation',
  schoolComptes:       '/school/comptes',
  schoolCompte:        (id: string) => `/school/comptes/${id}`,
  schoolFactures:      '/school/factures',
  schoolFacturePdf:    (id: string) => `/school/factures/${id}/pdf`,
  schoolContrats:      '/school/contrats',
  schoolContratPdf:    (id: string) => `/school/contrats/${id}/pdf`,
  schoolActivite:      '/school/activite',
  schoolContact:       '/school/contact',
  schoolSessions:      '/school/sessions',
  schoolSession:       (id: string) => `/school/sessions/${id}`,
  schoolMessages:      '/school/messages',
  schoolMessage:       (id: string) => `/school/messages/${id}`,
  schoolMessageReponse:(id: string) => `/school/messages/${id}/reponses`,

  // Signature publique (token du lien reçu par e-mail)
  signature:           (token: string) => `/signature/${encodeURIComponent(token)}`,
  signaturePdf:        (token: string) => `/signature/${encodeURIComponent(token)}/pdf`,
  signatureOtp:        (token: string) => `/signature/${encodeURIComponent(token)}/otp`,
  signatureSigner:     (token: string) => `/signature/${encodeURIComponent(token)}/signer`,
} as const
