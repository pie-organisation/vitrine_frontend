// Centralized API client — reads base URL from env, injects JWT, handles errors uniformly.

const API_BASE = ((import.meta.env.VITE_API_BASE_URL as string) ?? '').replace(/\/$/, '')

// ── Error type ────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
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

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string> | undefined),
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })

  // 401 → session expirée, on vide le storage et on redirige
  if (res.status === 401) {
    clearAuth()
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
    const body = await res.json().catch(() => ({})) as { error?: string; message?: string }
    throw new ApiError(401, body.error ?? 'UNAUTHORIZED', body.message ?? 'Session expirée, veuillez vous reconnecter.')
  }

  // Autres erreurs HTTP
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string; message?: string }
    const message =
      res.status === 403 ? 'Accès refusé.' :
      res.status === 404 ? 'Ressource introuvable.' :
      res.status === 409 ? 'Conflit — cette ressource existe déjà.' :
      res.status === 422 ? (body.message ?? 'Données invalides.') :
      res.status >= 500  ? 'Erreur serveur, veuillez réessayer.' :
      (body.message ?? 'Une erreur est survenue.')
    throw new ApiError(res.status, body.error ?? 'ERROR', message)
  }

  // 204 No Content
  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

// ── Public API surface ────────────────────────────────────────────────────────

export const api = {
  get:    <T>(path: string)                    => request<T>(path),
  post:   <T>(path: string, body: unknown)     => request<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown)     => request<T>(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown)     => request<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: <T>(path: string)                    => request<T>(path, { method: 'DELETE' }),
}

// ── Endpoint map (update here when backend confirms routes) ───────────────────
// All paths are relative to VITE_API_BASE_URL.

export const ENDPOINTS = {
  // Auth
  login:          '/auth/login',
  inscription:    '/auth/inscription',
  motDePasseReset:'/auth/reset-password',

  // Current user
  me:             '/me',
  mePassword:     '/me/password',

  // Admin — dashboard
  metriques:      '/admin/metriques',
  alertes:        '/admin/alertes',
  analytics:      '/admin/analytiques',

  // Admin — CRUD
  organisations:       '/admin/organisations',
  organisation:        (id: string) => `/admin/organisations/${id}`,
  demandes:            '/admin/demandes',
  demande:             (id: string) => `/admin/demandes/${id}`,
  factures:            '/admin/factures',
  facture:             (id: string) => `/admin/factures/${id}`,
  logs:                '/admin/journaux',
  equipe:              '/admin/equipe',
  membreEquipe:        (id: string) => `/admin/equipe/${id}`,
  messages:            '/admin/messages',
  message:             (id: string) => `/admin/messages/${id}`,
  offres:              '/admin/offres',
  offre:               (id: string) => `/admin/offres/${id}`,

  // School
  schoolOrg:           '/school/organisation',
  schoolComptes:       '/school/comptes',
  schoolCompte:        (id: string) => `/school/comptes/${id}`,
  schoolFactures:      '/school/factures',
  schoolActivite:      '/school/activite',
  schoolContact:       '/school/contact',
} as const
