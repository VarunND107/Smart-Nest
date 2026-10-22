import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { api, getSlowSnapshot, subscribeSlow } from '../lib/api'
import type { Health } from '../lib/api'
import { useAuth } from '../lib/auth'
import { Button, ButtonLink } from './ui'
import { useToast } from './toast'

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 rounded-md font-bold text-slate-900">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
        <rect width="32" height="32" rx="7" fill="#0f766e" />
        <path d="M16 6 5.5 15h3v10h15V15h3L16 6Z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="16" cy="19" r="2.4" fill="#fff" />
      </svg>
      <span className="text-lg">SmartNest</span>
    </Link>
  )
}

const navLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-700 hover:bg-slate-100'}`

function Header() {
  const { status, user, logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  // The menu is "open for" the page it was opened on, so navigating closes it with no effect needed.
  const [openFor, setOpenFor] = useState<string | null>(null)
  const { pathname } = useLocation()
  const open = openFor === pathname

  const signOut = async () => {
    await logout()
    toast.success('You have been signed out.')
    navigate('/')
  }

  const links = (
    <>
      <NavLink to="/learn" className={navLink}>
        Learn
      </NavLink>
      {user && (
        <NavLink to="/dashboard" className={navLink}>
          My SmartNest
        </NavLink>
      )}
    </>
  )

  const account =
    status === 'authed' && user ? (
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-slate-600 lg:inline" title={user.email}>
          {user.name}
        </span>
        <Button variant="secondary" onClick={signOut}>
          Sign out
        </Button>
      </div>
    ) : status === 'loading' ? (
      <span className="text-sm text-slate-500" role="status">
        Checking session…
      </span>
    ) : (
      <div className="flex items-center gap-2">
        <ButtonLink to="/login" variant="ghost">
          Sign in
        </ButtonLink>
        <ButtonLink to="/signup">Get started</ButtonLink>
      </div>
    )

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {links}
          </nav>
        </div>
        <div className="hidden md:block">{account}</div>
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpenFor(open ? null : pathname)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>
      {open && (
        <div id="mobile-menu" className="border-t border-slate-200 px-4 py-3 md:hidden">
          <nav aria-label="Main" className="flex flex-col gap-1">
            {links}
          </nav>
          <div className="mt-3 border-t border-slate-100 pt-3">{account}</div>
        </div>
      )}
    </header>
  )
}

/** Appears when a request is slow, which on free hosting almost always means the server is waking. */
function WakeBanner() {
  const slow = useSyncExternalStore(subscribeSlow, getSlowSnapshot)
  if (!slow) return null
  return (
    <div role="status" className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-950">
      Waking up the SmartNest server. Free hosting pauses when idle, so the first request can take up to a minute.
    </div>
  )
}

export function ApiStatusPill() {
  const health = useQuery({
    queryKey: ['health'],
    queryFn: ({ signal }) => api<Health>('/health', { auth: false, signal }),
    retry: false,
    staleTime: 60_000,
  })
  const { label, dot } = health.isPending
    ? { label: 'Checking server…', dot: 'bg-slate-400' }
    : health.isError
      ? { label: 'Server unreachable', dot: 'bg-red-600' }
      : health.data.status === 'ok'
        ? { label: 'Server online', dot: 'bg-emerald-600' }
        : { label: 'Server degraded', dot: 'bg-amber-500' }
  return (
    <Link
      to="/status"
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
    >
      <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </Link>
  )
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-slate-600">SmartNest — Smart Living, Simplified.</p>
          <div className="mt-4">
            <ApiStatusPill />
          </div>
        </div>
        <nav aria-label="Footer" className="text-sm">
          <p className="font-semibold text-slate-900">Explore</p>
          <ul className="mt-3 space-y-2 text-slate-600">
            <li>
              <Link className="hover:underline" to="/learn">
                Guides
              </Link>
            </li>
            <li>
              <Link className="hover:underline" to="/learn/c/faq">
                FAQ
              </Link>
            </li>
            <li>
              <Link className="hover:underline" to="/status">
                System status
              </Link>
            </li>
          </ul>
        </nav>
        <div className="text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Good to know</p>
          <p className="mt-3">
            SmartNest is a student project. It plans and organises; it does not control your devices or read their live
            status. Any product details or prices shown are sample data.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default function Layout() {
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const first = useRef(true)

  // On navigation, reset scroll and move focus to <main> so keyboard and screen-reader users
  // land at the top of the new page instead of staying on the link they activated.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    window.scrollTo(0, 0)
    mainRef.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:shadow"
      >
        Skip to content
      </a>
      <Header />
      <WakeBanner />
      <main id="main" ref={mainRef} tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
