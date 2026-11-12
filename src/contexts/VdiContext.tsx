import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  vdiApi, isVdiConfigured, groupIdOf, vdiToken, vdiLogin, clearVdiToken,
  type VdiGroupe, type VdiOrganisation, type VdiUser, type VdiVm,
} from '../api/vdi'

// Données « postes de travail » de l'école, partagées par Comptes, Groupes, Machines et Logiciels
// (équivalent de l'OrgProvider de Site-Pie).

interface VdiContextValue {
  configured: boolean
  /** Connecté à l'API Go (jeton présent) */
  connected: boolean
  connect: (email: string, password: string) => Promise<void>
  disconnect: () => void
  loading: boolean
  error: string | null
  orgId: string
  orgName: string
  groupes: VdiGroupe[]
  vms: VdiVm[]
  users: VdiUser[]
  /** Lookups dérivés */
  userByEmail: Map<string, VdiUser>
  userById: Map<string, VdiUser>
  vmByUserId: Map<string, VdiVm>
  groupById: Map<string, VdiGroupe>
  refresh: () => Promise<void>
}

const Ctx = createContext<VdiContextValue | null>(null)

export function VdiProvider({ children }: { children: ReactNode }) {
  const configured = isVdiConfigured()
  const [connected, setConnected] = useState(() => configured && !!vdiToken())
  const [orgs,    setOrgs]    = useState<VdiOrganisation[]>([])
  const [groupes, setGroupes] = useState<VdiGroupe[]>([])
  const [vms,     setVms]     = useState<VdiVm[]>([])
  const [users,   setUsers]   = useState<VdiUser[]>([])
  const [loading, setLoading] = useState(connected)
  const [error,   setError]   = useState<string | null>(null)

  const reset = useCallback(() => {
    setConnected(false)
    setOrgs([]); setGroupes([]); setVms([]); setUsers([])
    setError(null)
    setLoading(false)
  }, [])

  // Jeton refusé par l'API (401) : retour à l'écran de connexion
  useEffect(() => {
    window.addEventListener('cubi-vdi-logout', reset)
    return () => window.removeEventListener('cubi-vdi-logout', reset)
  }, [reset])

  // L'API Go scope déjà les organisations sur le compte : l'école est la première renvoyée
  const orgId = orgs[0]?.id ?? ''

  const load = useCallback(async () => {
    if (!configured || !vdiToken()) return
    setLoading(true)
    setError(null)
    try {
      const list = orgs.length ? orgs : await vdiApi.orgs()
      const id = list[0]?.id
      const [g, m, u] = id
        ? await Promise.all([vdiApi.groups(id), vdiApi.vms(id), vdiApi.users(id)])
        : [[], [], []]
      // Tout est posé ensemble : les écrans ne voient jamais l'organisation sans ses groupes
      setOrgs(list); setGroupes(g); setVms(m); setUsers(u)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur du service des postes de travail.')
    } finally {
      setLoading(false)
    }
  }, [configured, orgs])

  // Chargement à la connexion ; ensuite les écrans appellent refresh()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (connected) void load() }, [connected])

  const connect = useCallback(async (email: string, password: string) => {
    await vdiLogin(email, password)
    setConnected(true)
  }, [])

  const disconnect = useCallback(() => { clearVdiToken(); reset() }, [reset])

  const value = useMemo<VdiContextValue>(() => ({
    configured,
    connected,
    connect,
    disconnect,
    loading,
    error,
    orgId,
    orgName: orgs[0]?.name ?? '',
    groupes,
    vms,
    users,
    userByEmail: new Map(users.map((u) => [u.email.toLowerCase(), u])),
    userById: new Map(users.map((u) => [u.id, u])),
    vmByUserId: new Map(vms.map((v) => [v.user_id, v])),
    groupById: new Map(groupes.map((g) => [g.id, g])),
    refresh: load,
  }), [configured, connected, connect, disconnect, loading, error, orgId, orgs, groupes, vms, users, load])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useVdi(): VdiContextValue {
  const v = useContext(Ctx)
  if (!v) throw new Error('useVdi doit être utilisé dans <VdiProvider>')
  return v
}

/** Membres d'un groupe (rattachement par groupe_id, ou classe_id pour l'ancien modèle). */
export function useGroupMembers(groupId: string) {
  const { users, vms } = useVdi()
  return useMemo(() => {
    const members = users.filter((u) => groupIdOf(u) === groupId)
    const ids = new Set(members.map((m) => m.id))
    return { members, vms: vms.filter((v) => ids.has(v.user_id)) }
  }, [users, vms, groupId])
}
