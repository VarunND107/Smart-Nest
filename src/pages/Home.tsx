import { Link } from 'react-router'
import { Badge, ButtonLink } from '../components/ui'
import { useAuth } from '../lib/auth'
import { FEATURES } from '../lib/features'

const STEPS = [
  { n: '1', title: 'Learn the basics', text: 'Understand Wi-Fi vs Zigbee vs Matter, hubs and ecosystems before you spend money.' },
  { n: '2', title: 'Set it up safely', text: 'Follow install, security and privacy checklists written for typical Indian homes.' },
  { n: '3', title: 'Fix what breaks', text: 'Work through step-by-step troubleshooting when a device goes offline or an automation stops.' },
]

export default function Home() {
  const { user } = useAuth()
  return (
    <div className="space-y-16">
      <section className="py-6 sm:py-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">SmartNest</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
          Smart Living, Simplified.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-600">
          Guidance, planning and support for your smart home, in plain language. Start with the guides, then keep track of
          your home and devices as SmartNest grows.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {user ? (
            <ButtonLink to="/dashboard">Go to My SmartNest</ButtonLink>
          ) : (
            <ButtonLink to="/signup">Create free account</ButtonLink>
          )}
          <ButtonLink to="/learn" variant="secondary">
            Explore the guides
          </ButtonLink>
        </div>
      </section>

      <section aria-labelledby="what">
        <h2 id="what" className="text-2xl font-bold text-slate-900">
          What SmartNest gives you
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <li key={f.key} className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900">{f.title}</h3>
                {f.status === 'soon' ? <Badge tone="soon">Coming soon</Badge> : <Badge tone="brand">Available</Badge>}
              </div>
              <p className="mt-2 text-sm text-slate-600">{f.description}</p>
              {f.status === 'available' && f.to && (
                <Link to={f.to} className="mt-3 inline-block text-sm font-medium text-brand-700 underline underline-offset-2">
                  Open {f.title}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how">
        <h2 id="how" className="text-2xl font-bold text-slate-900">
          How to use the guides
        </h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="rounded-lg border border-slate-200 bg-white p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-900">
                {s.n}
              </span>
              <h3 className="mt-3 font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="honest" className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 id="honest" className="text-xl font-bold text-slate-900">
          What SmartNest is not
        </h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-600">
          <li>It does not control your devices or read their live status. Your device apps do that.</li>
          <li>It is a student project, not a company. No real technicians, bookings or payments exist yet.</li>
          <li>Its planner is rule-based logic you can read, not artificial intelligence.</li>
        </ul>
      </section>
    </div>
  )
}
