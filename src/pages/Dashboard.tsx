import { Link } from 'react-router'
import { Badge, Card, PageHeader } from '../components/ui'
import { useAuth } from '../lib/auth'

export default function Dashboard() {
  const { user } = useAuth()
  if (!user) return null
  const since = new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <>
      <PageHeader title={`Welcome, ${user.name.split(' ')[0]}`}>
        This is your SmartNest account. Home and device tools arrive in the next release; the guides are open now.
      </PageHeader>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Your account</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Name</dt>
              <dd className="font-medium text-slate-900">{user.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium text-slate-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Account type</dt>
              <dd>
                <Badge tone={user.role === 'admin' ? 'brand' : 'neutral'}>
                  {user.role === 'admin' ? 'Administrator' : 'Customer'}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Member since</dt>
              <dd className="font-medium text-slate-900">{since}</dd>
            </div>
          </dl>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Start here</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link className="font-medium text-brand-700 underline underline-offset-2" to="/learn/c/basics">
                Smart home basics
              </Link>
              <p className="text-slate-600">What a smart home is, how devices connect, and how to start small.</p>
            </li>
            <li>
              <Link className="font-medium text-brand-700 underline underline-offset-2" to="/learn/c/security">
                Security &amp; privacy
              </Link>
              <p className="text-slate-600">A checklist before you put cameras and locks on your network.</p>
            </li>
            <li>
              <Link className="font-medium text-brand-700 underline underline-offset-2" to="/learn/c/troubleshooting">
                Troubleshooting
              </Link>
              <p className="text-slate-600">Step-by-step fixes for offline devices and failing automations.</p>
            </li>
          </ul>
        </Card>
      </div>
    </>
  )
}
