import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'
import { ToastProvider } from '../components/toast'
import { AuthProvider } from '../lib/auth'

export interface MockResponse {
  status?: number
  body?: unknown
  /** Reject like a network failure. */
  networkError?: boolean
}
export type Handler = (init: { body: unknown; headers: Record<string, string> }) => MockResponse

export const user = {
  id: 'u1',
  email: 'asha@example.com',
  name: 'Asha Rao',
  role: 'customer' as const,
  createdAt: '2026-01-05T10:00:00.000Z',
}

/** Mocks fetch by "METHOD /path" (path is relative to /api). Unmatched calls fail the test loudly. */
export function mockApi(routes: Record<string, Handler | MockResponse>) {
  const calls: { key: string; body: unknown; headers: Record<string, string> }[] = []
  const fn = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), 'http://localhost')
    const key = `${init?.method ?? 'GET'} ${url.pathname.replace(/^\/api/, '')}`
    const headers = Object.fromEntries(Object.entries((init?.headers ?? {}) as Record<string, string>))
    const body = init?.body ? JSON.parse(String(init.body)) : undefined
    calls.push({ key, body, headers })
    const route = routes[key]
    if (!route) throw new Error(`Unexpected request in test: ${key}`)
    const res = typeof route === 'function' ? route({ body, headers }) : route
    if (res.networkError) throw new TypeError('Failed to fetch')
    const status = res.status ?? 200
    if (status === 204) return new Response(null, { status })
    return new Response(JSON.stringify(res.body ?? {}), { status, headers: { 'content-type': 'application/json' } })
  })
  vi.stubGlobal('fetch', fn)
  return { calls, fn }
}

export function renderAt(ui: ReactElement, path = '/') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 0 } } })
  return render(
    <MemoryRouter initialEntries={[path]}>
      <QueryClientProvider client={client}>
        <ToastProvider>
          <AuthProvider>{ui}</AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  )
}
