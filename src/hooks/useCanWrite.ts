import { useAuth } from '../contexts/AuthContext'

/**
 * Seul `super_admin` écrit sur les contrats, factures et organisations ; `support` et
 * `lecture` voient tout mais les boutons d'action leur sont masqués (le back renvoie 403 de toute façon).
 */
export function useCanWrite(): boolean {
  const { user } = useAuth()
  return user?.type === 'cubi' && user.role === 'super_admin'
}
