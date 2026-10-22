import { useEffect, useState } from 'react'
import { checkSupabaseHealth, isSupabaseConfigured } from './lib/supabase'

type Health = { state: 'checking' } | { state: 'ok' | 'fail'; detail: string }

export default function App() {
  const [health, setHealth] = useState<Health>({ state: 'checking' })

  useEffect(() => {
    const ctrl = new AbortController()
    checkSupabaseHealth(ctrl.signal)
      .then((r) => setHealth({ state: r.ok ? 'ok' : 'fail', detail: r.detail }))
      .catch(() => {})
    return () => ctrl.abort()
  }, [])

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-8 px-4 py-12">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">SmartNest</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Smart Living, Simplified.</h1>
        <p className="mt-3 text-slate-600">
          Smart-home planning, device management and support in one place. This page is the
          deployment pipeline check; the app itself is being built phase by phase.
        </p>
      </header>

      <section aria-labelledby="pipeline" className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 id="pipeline" className="text-lg font-semibold">
          Pipeline status
        </h2>
        <dl className="mt-4 divide-y divide-slate-100 text-sm">
          <Row label="Frontend build" value="Deployed" tone="ok" />
          <Row
            label="Supabase env vars"
            value={isSupabaseConfigured ? 'Present' : 'Missing'}
            tone={isSupabaseConfigured ? 'ok' : 'fail'}
          />
          <Row
            label="Supabase connection"
            value={
              !isSupabaseConfigured
                ? 'Not configured'
                : health.state === 'checking'
                  ? 'Checking…'
                  : health.state === 'ok'
                    ? 'Reachable'
                    : 'Not reachable'
            }
            tone={!isSupabaseConfigured || health.state === 'checking' ? 'idle' : health.state}
            note={health.state === 'checking' ? undefined : health.detail}
          />
        </dl>
      </section>
    </main>
  )
}

const tones = {
  ok: 'bg-brand-100 text-brand-900',
  fail: 'bg-red-100 text-red-900',
  idle: 'bg-slate-100 text-slate-700',
} as const

function Row({
  label,
  value,
  tone,
  note,
}: {
  label: string
  value: string
  tone: keyof typeof tones
  note?: string
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-3">
      <div>
        <dt className="font-medium">{label}</dt>
        {note && <dd className="text-slate-500">{note}</dd>}
      </div>
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{value}</span>
    </div>
  )
}
