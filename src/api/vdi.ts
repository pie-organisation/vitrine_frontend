// Postes de travail (VDI) : groupes, machines et logiciels de l'école.
// Même API Go et même connexion que Site-Pie (go-proxmox-api, routes /api/*) : compte « personnel »
// de l'API Go, jeton gardé à part de la session Cubi. Sans VITE_VDI_API_URL, les écrans affichent
// « bientôt disponibles » et n'appellent rien. L'école est la première organisation que l'API renvoie.

const VDI_BASE = ((import.meta.env.VITE_VDI_API_URL as string | undefined) ?? '').replace(/\/$/, '')

export const isVdiConfigured = () => VDI_BASE !== ''

export class VdiNotConfiguredError extends Error {
  constructor() {
    super("Le module postes de travail n'est pas encore branché.")
    this.name = 'VdiNotConfiguredError'
  }
}

export class VdiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
    this.name = 'VdiError'
  }
}

// L'API Go a ses propres comptes : on s'y connecte comme Site-Pie (POST /api/auth/login) et on
// garde son jeton à part de la session Cubi.
const VDI_TOKEN_KEY = 'cubi_vdi_token'

export function vdiToken(): string | null {
  try { return localStorage.getItem(VDI_TOKEN_KEY) } catch { return null }
}

export function clearVdiToken(): void {
  try { localStorage.removeItem(VDI_TOKEN_KEY) } catch { /* stockage indisponible */ }
}

export interface VdiLoginUser {
  token?: string
  user_id: string
  email: string
  role: string
  organisation_id?: string
  staff: boolean
  admin: boolean
}

/** Connexion à l'API Go. Réservée au personnel (staff), comme la console Site-Pie. */
export async function vdiLogin(email: string, password: string): Promise<VdiLoginUser> {
  clearVdiToken()
  const user = await vdi<VdiLoginUser>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, false)
  if (!user.staff) {
    throw new VdiError(403, "Ce compte n'a pas accès à la gestion des postes de travail (réservé au personnel de l'établissement).")
  }
  if (!user.token) throw new VdiError(500, "Connexion refusée : aucun jeton reçu.")
  try { localStorage.setItem(VDI_TOKEN_KEY, user.token) } catch { /* stockage indisponible */ }
  return user
}

async function vdi<T>(path: string, init: RequestInit = {}, withAuth = true): Promise<T> {
  if (!isVdiConfigured()) throw new VdiNotConfiguredError()
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const token = withAuth ? vdiToken() : null
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let res: Response
  try {
    res = await fetch(`${VDI_BASE}${path}`, { ...init, headers })
  } catch {
    throw new VdiError(0, 'Service des postes de travail injoignable. Réessayez dans un instant.')
  }
  const text = await res.text()
  let data: unknown = null
  if (text) {
    try { data = JSON.parse(text) } catch { data = null }
  }
  if (!res.ok) {
    const apiMsg = data && typeof data === 'object' && 'error' in data ? String((data as { error: unknown }).error) : ''
    // Jeton expiré ou révoqué : on l'oublie, l'écran redemande la connexion
    if (res.status === 401 && withAuth) {
      clearVdiToken()
      window.dispatchEvent(new Event('cubi-vdi-logout'))
    }
    const msg =
      res.status === 401 ? (withAuth ? 'Session des postes de travail expirée : reconnectez-vous.' : (apiMsg || 'E-mail ou mot de passe incorrect.')) :
      res.status === 403 ? (apiMsg || 'Action non autorisée.') :
      res.status === 404 ? (apiMsg || 'Élément introuvable.') :
      res.status >= 500  ? 'Le service des postes de travail a rencontré une erreur.' :
      (apiMsg || 'Une erreur est survenue.')
    throw new VdiError(res.status, msg)
  }
  return data as T
}

const post = <T>(path: string, body: unknown = {}) => vdi<T>(path, { method: 'POST', body: JSON.stringify(body) })

// ── Types (forme de l'API Go) ─────────────────────────────────────────────────

export interface VdiOrganisation { id: string; name: string }

export interface VdiGroupe {
  id: string
  organisation_id: string
  name: string
  users: number
  vms: number
  description?: string
}

export type VmStatus = 'running' | 'stopped' | (string & {})

export interface VdiVm {
  id: string
  user_id: string
  vmid: number
  vm_name: string
  ip: string
  status: VmStatus
  error?: string
  guacamole_connection_id?: number
  guacamole_connection_name?: string
  date_creation?: string
  date_modification?: string
}

export interface VdiUser {
  id: string
  email: string
  nom?: string
  prenom?: string
  role?: string
  statut?: string
  ecole_id?: string
  classe_id?: string
  groupe_id?: string
  groupe_name?: string
  organisation_id?: string
}

export interface MemberInput { email: string; nom: string; prenom: string }

export interface MemberResult {
  email: string
  password?: string
  created?: boolean
  updated?: boolean
  error?: string
}

export interface CatalogApp {
  id: string
  name: string
  description?: string
  category?: string
  requires_license?: boolean
  license_label?: string | null
  actions?: Record<string, string>
}

export interface VmSoftware {
  app_id: string
  name: string
  installed: boolean
  source: string
  last_action?: string
  last_status?: string
  last_job_id?: string
  hint?: string
}

export interface VmDetail {
  vm: VdiVm
  user: VdiUser | null
  groupe?: { id: string; name: string; description?: string }
}

export interface AppJob {
  id: string
  status: string
  app_id?: string
  action?: string
  items?: { vmid: number; status: string; log?: string; error?: string }[]
}

export type AppAction = 'install' | 'configure' | 'update' | 'uninstall'

export interface AppLaunch { app_id: string; action: AppAction; license_key?: string }

// ── Appels ────────────────────────────────────────────────────────────────────

export const vdiApi = {
  orgs:        () => vdi<{ organisations: VdiOrganisation[] }>('/api/orgs').then((r) => r.organisations ?? []),
  groups:      (orgId: string) => vdi<{ groupes: VdiGroupe[] }>(`/api/orgs/${orgId}/groups`).then((r) => r.groupes ?? []),
  vms:         (orgId: string) => vdi<{ vms: VdiVm[] }>(`/api/orgs/${orgId}/vms`).then((r) => r.vms ?? []),
  users:       (orgId: string) => vdi<{ users: VdiUser[] }>(`/api/orgs/${orgId}/users`).then((r) => r.users ?? []),

  createGroup: (orgId: string, body: { name: string; niveau?: string; members: MemberInput[] }) =>
    post<{ id: string; name: string; members?: MemberResult[] }>(`/api/orgs/${orgId}/groups`, body),
  addMembers:  (orgId: string, groupId: string, members: MemberInput[]) =>
    post<{ members: MemberResult[] }>(`/api/orgs/${orgId}/groups/${groupId}/members`, { members }),
  /** Crée et allume les machines manquantes du groupe. */
  provision:   (groupId: string) => post<unknown>(`/api/classes/${groupId}/provision`),
  /** Génère les mots de passe des comptes du groupe qui n'en ont pas encore. */
  bootstrap:   (groupId: string) =>
    post<{ passwords: Record<string, string>; existing?: string[] }>('/api/auth/bootstrap', { classe_id: groupId }),

  createVm:    (userId: string) => post<{ vmid: number }>('/api/vms', { user_id: userId }),
  vm:          (vmid: number) => vdi<VmDetail>(`/api/vms/${vmid}`),
  vmSoftware:  (vmid: number) => vdi<{ apps: VmSoftware[] }>(`/api/vms/${vmid}/software`).then((r) => r.apps ?? []),
  vmAction:    (vmid: number, action: 'start' | 'stop') => post<unknown>(`/api/vms/${vmid}/${action}`),
  destroyVm:   (vmid: number) => vdi<unknown>(`/api/vms/${vmid}?destroy=true`, { method: 'DELETE' }),

  catalog:     () => vdi<{ apps: CatalogApp[] }>('/api/store/catalog').then((r) => r.apps ?? []),
  launchApp:   (target: { vmid: number } | { groupId: string }, body: AppLaunch) =>
    post<{ id: string }>('vmid' in target ? `/api/vms/${target.vmid}/apps` : `/api/classes/${target.groupId}/apps`, body),
  job:         (jobId: string) => vdi<AppJob>(`/api/jobs/${jobId}`),
}

// ── Utilitaires ───────────────────────────────────────────────────────────────

export function displayName(u: Pick<VdiUser, 'prenom' | 'nom' | 'email'>): string {
  const n = [u.prenom, u.nom].filter(Boolean).join(' ').trim()
  return n || u.email
}

export const groupIdOf = (u: VdiUser) => u.groupe_id || u.classe_id || ''

/** Statuts de job considérés comme terminés (arrêt du suivi automatique). */
export const JOB_TERMINE = /^(done|success|succeeded|completed|failed|error|cancel(l)?ed|partial)$/i
