import { useQueryClient } from '@tanstack/react-query'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ApiError, api, setSessionInvalidHandler } from './api'
import { SESSION_STORAGE_KEY, clearToken, getToken, setToken } from './session'

export type Role = 'customer' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  createdAt: string
}

interface AuthResponse {
  token: string
  expiresAt: string
  user: User
}

type Status = 'loading' | 'authed' | 'anon' | 'unreachable'

interface AuthContextValue {
  status: Status
  user: User | null
  login(input: { email: string; password: string }): Promise<void>
  signup(input: { name: string; email: string; password: string }): Promise<void>
  logout(): Promise<void>
  /** Retry restoring the session after the server was unreachable. */
  retry(): void
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function loadSession(): Promise<{ status: Status; user: User | null }> {
  try {
    const { user } = await api<{ user: User }>('/auth/me')
    return { status: 'authed', user }
  } catch (err) {
    // Do not discard a good session just because the server is asleep or offline.
    if (err instanceof ApiError && err.isNetwork) return { status: 'unreachable', user: null }
    clearToken()
    return { status: 'anon', user: null }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [state, setState] = useState<{ status: Status; user: User | null }>({
    status: getToken() ? 'loading' : 'anon',
    user: null,
  })

  // Ask the server who the stored token belongs to. Callers set the "loading" state themselves.
  const restore = useCallback(async () => setState(await loadSession()), [])

  // The initial state already says "anon" when there is no token, so only restore when there is one.
  // `live` makes the first of StrictMode's two effect runs harmless.
  useEffect(() => {
    if (!getToken()) return
    let live = true
    void loadSession().then((next) => {
      if (live) setState(next)
    })
    return () => {
      live = false
    }
  }, [])

  // The API tells us when a stored token is dead; drop to signed-out everywhere at once.
  useEffect(() => {
    setSessionInvalidHandler(() => {
      clearToken()
      queryClient.clear()
      setState({ status: 'anon', user: null })
    })
    return () => setSessionInvalidHandler(undefined)
  }, [queryClient])

  // Signing in or out in one tab updates the others.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === SESSION_STORAGE_KEY || e.key === null) {
        queryClient.clear()
        if (getToken()) {
          setState({ status: 'loading', user: null })
          void restore()
        } else {
          setState({ status: 'anon', user: null })
        }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [queryClient, restore])

  const establish = useCallback(
    (res: AuthResponse) => {
      queryClient.clear()
      setToken(res.token)
      setState({ status: 'authed', user: res.user })
    },
    [queryClient],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      async login(input) {
        establish(await api<AuthResponse>('/auth/login', { body: input, auth: false }))
      },
      async signup(input) {
        establish(await api<AuthResponse>('/auth/signup', { body: input, auth: false }))
      },
      async logout() {
        // Revoke server-side first so the token is dead even if someone copied it.
        await api('/auth/logout', { method: 'POST' }).catch(() => {})
        clearToken()
        queryClient.clear()
        setState({ status: 'anon', user: null })
      },
      retry() {
        setState({ status: 'loading', user: null })
        void restore()
      },
    }),
    [state, establish, queryClient, restore],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
