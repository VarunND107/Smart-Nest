import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

/**
 * Browser Supabase client. It only ever holds the anon key; every read and write
 * is authorised by Row Level Security in Postgres, not by anything in this app.
 * Null when the env vars are missing, so the UI can say so instead of crashing.
 */
export const supabase = isSupabaseConfigured ? createClient(url!, anonKey!) : null

/** Hits GoTrue's public health endpoint: proves the URL and anon key are valid. */
export async function checkSupabaseHealth(signal?: AbortSignal): Promise<{ ok: boolean; detail: string }> {
  if (!isSupabaseConfigured) return { ok: false, detail: 'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set' }
  try {
    const res = await fetch(`${url}/auth/v1/health`, { headers: { apikey: anonKey! }, signal })
    if (!res.ok) return { ok: false, detail: `Auth service answered HTTP ${res.status}` }
    return { ok: true, detail: 'Auth service reachable with the configured anon key' }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    return { ok: false, detail: 'Could not reach the Supabase project (network or CORS error)' }
  }
}
