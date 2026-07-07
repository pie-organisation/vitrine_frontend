'use client'

import {
  createContext, useContext, useState, useCallback,
  type ReactNode,
} from 'react'
import { api, ENDPOINTS, TOKEN_KEY, USER_KEY, clearAuth, ApiError } from '../api/client'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id:       string
  prenom:   string
  nom:      string
  email:    string
  role:     string
  type:     'cubi' | 'ecole'
  initials: string
}

interface LoginResponse {
  token:   string
  user_id: string
  role:    string
  type:    'cubi' | 'ecole'
}

interface AuthContextValue {
  user:            AuthUser | null
  token:           string | null
  isAuthenticated: boolean
  isLoading:       boolean
  loginError:      string | null
  login:           (email: string, mot_de_passe: string) => Promise<AuthUser>
  logout:          () => void
  updateUser:      (patch: Partial<Pick<AuthUser, 'prenom' | 'nom' | 'email'>>) => void
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────

function parseStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

function makeInitials(prenom?: string, nom?: string): string {
  return `${(prenom?.[0] ?? '').toUpperCase()}${(nom?.[0] ?? '').toUpperCase()}`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token,      setToken]      = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user,       setUser]       = useState<AuthUser | null>(parseStoredUser)
  const [isLoading,  setIsLoading]  = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const login = useCallback(async (email: string, mot_de_passe: string) => {
    setIsLoading(true)
    setLoginError(null)
    try {
      const res = await api.post<LoginResponse>(ENDPOINTS.login, { email, mot_de_passe })

      localStorage.setItem(TOKEN_KEY, res.token)
      setToken(res.token)

      // Le login ne renvoie pas nom/prénom — on complète via /me, avec un repli
      // minimal (mais fidèle à ce que le serveur a authentifié) si /me échoue.
      let authUser: AuthUser = {
        id: res.user_id,
        prenom: '',
        nom: '',
        email,
        role: res.role,
        type: res.type,
        initials: email[0]?.toUpperCase() ?? '?',
      }
      try {
        const me = await api.get<Omit<AuthUser, 'initials'>>(ENDPOINTS.me)
        authUser = { ...me, initials: makeInitials(me.prenom, me.nom) }
      } catch {
        // garde le repli minimal construit ci-dessus
      }

      localStorage.setItem(USER_KEY, JSON.stringify(authUser))
      setUser(authUser)
      return authUser
    } catch (err) {
      if (err instanceof ApiError && err.status === 403 && err.code === 'FORBIDDEN') {
        // Backend renvoie 403 "reset_required" → mot de passe temporaire à changer
        window.location.href = '/reset-password'
        throw err
      }
      const msg =
        err instanceof ApiError && err.status === 401
          ? 'Email ou mot de passe incorrect.'
          : err instanceof Error ? err.message : 'Identifiants incorrects.'
      setLoginError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    clearAuth()
    setToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((patch: Partial<Pick<AuthUser, 'prenom' | 'nom' | 'email'>>) => {
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...patch }
      next.initials = makeInitials(next.prenom, next.nom)
      localStorage.setItem(USER_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token,
      isLoading,
      loginError,
      login,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
