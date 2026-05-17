import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  fetchMe,
  loginRequest,
  logoutRequest,
  registerRequest,
} from '../api/auth'
import {
  clearTokens,
  getAccessToken,
  setTokens,
} from '../api/client'
import type { User } from '../types/auth'

interface AuthContextValue {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  isPro: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const USER_KEY = 'mv:user'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

function writeStoredUser(user: User | null): void {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(USER_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredUser())
  const [loading, setLoading] = useState<boolean>(() => Boolean(getAccessToken()))

  const handleSetUser = useCallback((next: User | null) => {
    setUser(next)
    writeStoredUser(next)
  }, [])

  const refreshUser = useCallback(async () => {
    if (!getAccessToken()) {
      handleSetUser(null)
      return
    }
    try {
      const me = await fetchMe()
      handleSetUser(me)
    } catch {
      handleSetUser(null)
    }
  }, [handleSetUser])

  // Hydrate user on mount if we have a token
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!getAccessToken()) {
        setLoading(false)
        return
      }
      try {
        const me = await fetchMe()
        if (!cancelled) handleSetUser(me)
      } catch {
        if (!cancelled) handleSetUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [handleSetUser])

  // Listen for forced logout from axios interceptor
  useEffect(() => {
    const onLogout = () => {
      clearTokens()
      handleSetUser(null)
    }
    window.addEventListener('auth:logout', onLogout)
    return () => window.removeEventListener('auth:logout', onLogout)
  }, [handleSetUser])

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await loginRequest(email, password)
      setTokens(res.accessToken, res.refreshToken)
      handleSetUser(res.user)
    },
    [handleSetUser],
  )

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      const res = await registerRequest(email, username, password)
      setTokens(res.accessToken, res.refreshToken)
      handleSetUser(res.user)
    },
    [handleSetUser],
  )

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } catch {
      // ignore — clear local state regardless
    }
    clearTokens()
    handleSetUser(null)
  }, [handleSetUser])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isPro: user?.subscriptionStatus === 'premium' || user?.subscriptionStatus === 'pro',
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading, login, register, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
