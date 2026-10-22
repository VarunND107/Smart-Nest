import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../lib/auth'
import type { Role } from '../lib/auth'
import { Alert, Button, PageLoading } from './ui'

/**
 * UI-level route protection, for navigation only. Real access control is enforced by the API on
 * every request; hiding a page here never substitutes for that.
 */
export function RequireAuth({ role }: { role?: Role }) {
  const { status, user, retry } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <PageLoading label="Restoring your session…" />

  if (status === 'unreachable') {
    return (
      <div className="mx-auto max-w-lg py-12">
        <Alert tone="warning" title="We couldn't reach the server">
          <p>Your session is saved. The server may be waking up from idle; this can take up to a minute.</p>
          <Button variant="secondary" className="mt-3" onClick={retry}>
            Try again
          </Button>
        </Alert>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />

  if (role && user.role !== role) {
    return (
      <div className="mx-auto max-w-lg py-12">
        <Alert tone="error" title="You don't have access to this page">
          This area is for {role} accounts only.
        </Alert>
      </div>
    )
  }
  return <Outlet />
}

/** Login/signup pages bounce signed-in people to their dashboard. */
export function GuestOnly() {
  const { status, user } = useAuth()
  const location = useLocation()
  if (status === 'loading') return <PageLoading label="Checking your session…" />
  if (user) {
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={from ?? '/dashboard'} replace />
  }
  return <Outlet />
}
