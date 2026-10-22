import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Card, PageHeader, Spinner } from '../components/ui'
import { API_BASE, api } from '../lib/api'
import type { Health } from '../lib/api'

interface Probe extends Health {
  latencyMs: number
}

function Row({ label, value, ok }: { label: string; value: string; ok?: boolean | null }) {
  const tone = ok === true ? 'bg-brand-100 text-brand-900' : ok === false ? 'bg-red-100 text-red-900' : 'bg-slate-100 text-slate-700'
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-3">
      <dt className="font-medium text-slate-900">{label}</dt>
      <dd>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{value}</span>
      </dd>
    </div>
  )
}

/** A real round trip from this browser to the API, so a green row means the whole path works. */
export default function Status() {
  const probe = useQuery({
    queryKey: ['status-probe'],
    queryFn: async ({ signal }): Promise<Probe> => {
      const t0 = performance.now()
      const h = await api<Health>('/health', { auth: false, signal })
      return { ...h, latencyMs: Math.round(performance.now() - t0) }
    },
    retry: false,
    staleTime: 0,
  })

  const host = API_BASE ? new URL(API_BASE).host : null

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="System status">
        Live checks from your browser to the SmartNest backend. Nothing on this page is cached or hard-coded.
      </PageHeader>

      {!API_BASE && import.meta.env.PROD && (
        <Alert tone="error" title="API address not configured" className="mb-4">
          <code>VITE_API_URL</code> is not set for this build, so the frontend has no backend to talk to. Set it in the host's
          environment variables and redeploy.
        </Alert>
      )}

      <Card>
        <dl className="divide-y divide-slate-100 text-sm">
          <Row label="Frontend" value="Loaded" ok />
          <Row label="Backend address" value={host ?? 'same origin (dev proxy)'} />
          {probe.isPending && (
            <div className="flex items-center gap-2 py-3 text-slate-600" role="status">
              <Spinner className="h-4 w-4" /> Contacting the backend… a sleeping free-tier server can take up to a minute.
            </div>
          )}
          {probe.isError && <Row label="Backend reachable" value="No" ok={false} />}
          {probe.data && (
            <>
              <Row label="Backend reachable" value={`Yes (${probe.data.latencyMs} ms round trip)`} ok />
              <Row label="Database" value={probe.data.db === 'ok' ? 'Connected' : 'Error'} ok={probe.data.db === 'ok'} />
              <Row
                label="Password-reset email"
                value={probe.data.features?.passwordResetEmail ? 'Configured' : 'Not configured'}
                ok={probe.data.features?.passwordResetEmail ?? null}
              />
              <Row label="Server uptime" value={`${Math.floor(probe.data.uptimeSeconds / 60)} min`} />
            </>
          )}
        </dl>
        {probe.isError && <Alert tone="error" className="mt-4">{probe.error.message}</Alert>}
        <Button variant="secondary" className="mt-4" onClick={() => void probe.refetch()} loading={probe.isFetching}>
          Check again
        </Button>
      </Card>
    </div>
  )
}
