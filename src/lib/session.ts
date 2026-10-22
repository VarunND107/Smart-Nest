const KEY = 'smartnest.session'

// localStorage is the source of truth, so signing out in one tab signs out every tab. Storage can
// be missing or throw (private windows, blocked site data); only then do we hold the token in
// memory, so the app works for the tab's lifetime instead of crashing.
let memory: string | null = null

export function getToken(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return memory
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(KEY, token)
  } catch {
    memory = token
  }
}

export function clearToken(): void {
  memory = null
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* nothing to clear */
  }
}

export const SESSION_STORAGE_KEY = KEY
