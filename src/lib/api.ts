import { getToken } from './session'

/** Backend origin (the Render service). Empty in local dev, where Vite proxies /api. */
export const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')

const REQUEST_TIMEOUT_MS = 75_000 // a sleeping free-tier host can take ~50s to wake
const SLOW_AFTER_MS = 4_000

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fields: Record<string, string>

  constructor(status: number, code: string, message: string, fields: Record<string, string> = {}) {
    super(message)
    this.status = status
    this.code = code
    this.fields = fields
  }
  get isNetwork() {
    return this.status === 0
  }
}

// --- "server is waking up" signal -----------------------------------------------------------
// If any request is still in flight after SLOW_AFTER_MS the UI shows a banner, so a cold start
// looks like what it is instead of a broken page.
let slowCount = 0
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
export const subscribeSlow = (l: () => void) => {
  listeners.add(l)
  return () => void listeners.delete(l)
}
export const getSlowSnapshot = () => slowCount > 0

function trackSlow(): () => void {
  let flagged = false
  const timer = setTimeout(() => {
    flagged = true
    slowCount++
    emit()
  }, SLOW_AFTER_MS)
  return () => {
    clearTimeout(timer)
    if (flagged) {
      slowCount--
      emit()
    }
  }
}

// --- 401 handling ---------------------------------------------------------------------------
let onSessionInvalid: (() => void) | undefined
export const setSessionInvalidHandler = (fn: (() => void) | undefined) => {
  onSessionInvalid = fn
}

interface Options {
  method?: string
  body?: unknown
  signal?: AbortSignal
  /** Send the bearer token (default true). */
  auth?: boolean
}

export async function api<T = unknown>(path: string, opts: Options = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  const token = opts.auth === false ? null : getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  let body: string | undefined
  if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(opts.body)
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  opts.signal?.addEventListener('abort', () => controller.abort(), { once: true })
  const done = trackSlow()

  let res: Response
  try {
    res = await fetch(`${API_BASE}/api${path}`, {
      method: opts.method ?? (body === undefined ? 'GET' : 'POST'),
      headers,
      body,
      signal: controller.signal,
    })
  } catch (err) {
    if (opts.signal?.aborted) throw err // the caller cancelled; not an error to display
    throw new ApiError(
      0,
      'NETWORK',
      "Can't reach the SmartNest server. Check your connection and try again. If it has been idle it can take up to a minute to wake up.",
    )
  } finally {
    clearTimeout(timer)
    done()
  }

  if (res.status === 204) return undefined as T

  if (!(res.headers.get('content-type') ?? '').includes('application/json')) {
    throw new ApiError(
      res.status,
      'BAD_RESPONSE',
      API_BASE
        ? 'The server sent an unexpected response.'
        : 'The API address is not configured. Set VITE_API_URL to the backend URL and redeploy.',
    )
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const e = (data as { error?: { code?: string; message?: string; fields?: Record<string, string> } }).error ?? {}
    const err = new ApiError(res.status, e.code ?? 'ERROR', e.message ?? 'Something went wrong.', e.fields ?? {})
    if (res.status === 401 && token && (err.code === 'SESSION_EXPIRED' || err.code === 'INVALID_TOKEN')) {
      onSessionInvalid?.()
    }
    throw err
  }
  return data as T
}

export interface Health {
  status: 'ok' | 'degraded'
  db: 'ok' | 'error'
  service: string
  uptimeSeconds: number
  time: string
  features?: { passwordResetEmail: boolean }
}
