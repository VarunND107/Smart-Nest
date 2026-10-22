import { Children, isValidElement, useDeferredValue, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import Markdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link, useParams, useSearchParams } from 'react-router'
import { Badge, ButtonLink, Card, EmptyState } from '../components/ui'
import NotFound from '../pages/NotFound'
import { CATEGORIES, GUIDES, categoryById, getGuide, guidesIn, relatedGuides, slugify } from './content'
import type { Guide } from './content'
import { searchGuides } from './search'

const linkCls = 'font-medium text-brand-700 underline underline-offset-2'

function GuideMeta({ g }: { g: Guide }) {
  return (
    <span className="text-xs text-slate-600">
      {g.minutes} min read · <span className="capitalize">{g.level}</span>
    </span>
  )
}

function GuideCard({ g, snippet, showCategory = true }: { g: Guide; snippet?: string; showCategory?: boolean }) {
  return (
    <li className="rounded-lg border border-slate-200 bg-white p-4 hover:border-brand-600">
      <div className="flex flex-wrap items-center gap-2">
        {showCategory && <Badge tone="brand">{categoryById(g.category)?.title}</Badge>}
        <GuideMeta g={g} />
      </div>
      <h3 className="mt-2 text-base font-semibold text-slate-900">
        <Link to={`/learn/${g.slug}`} className="after:absolute after:inset-0 hover:underline">
          {g.title}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-slate-600">{snippet ?? g.summary}</p>
    </li>
  )
}

// `relative` so the whole card is the link target (the ::after on the title link).
const cardList = 'mt-4 grid gap-3 sm:grid-cols-2 [&>li]:relative'

const START_HERE = ['what-is-a-smart-home', 'how-smart-devices-connect', 'secure-your-smart-home-checklist', 'device-offline-troubleshooting-flow']

export function LearnHome() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const deferred = useDeferredValue(q)
  const hits = useMemo(() => searchGuides(deferred), [deferred])
  const searching = deferred.trim().length > 0

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">SmartNest guides</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Practical, vendor-neutral explanations. {GUIDES.length} guides across {CATEGORIES.length} topics, searchable below.
        </p>
        <form role="search" onSubmit={(e) => e.preventDefault()} className="mt-5 max-w-xl">
          <label htmlFor="guide-search" className="sr-only">
            Search guides
          </label>
          <div className="flex gap-2">
            <input
              id="guide-search"
              type="search"
              value={q}
              onChange={(e) => {
                const v = e.target.value
                setParams(v ? { q: v } : {}, { replace: true })
              }}
              placeholder="Search: wifi, camera privacy, automation not triggering…"
              autoComplete="off"
              className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-base sm:text-sm"
            />
            {q && (
              <button
                type="button"
                onClick={() => setParams({}, { replace: true })}
                className="rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </header>

      {searching ? (
        <section aria-labelledby="results">
          <h2 id="results" className="text-lg font-semibold text-slate-900">
            Results for “{deferred.trim()}”
          </h2>
          <p role="status" className="mt-1 text-sm text-slate-600">
            {hits.length === 0 ? 'No matching guides.' : `${hits.length} guide${hits.length === 1 ? '' : 's'} found.`}
          </p>
          {hits.length > 0 ? (
            <ul className={cardList}>
              {hits.map((h) => (
                <GuideCard key={h.guide.slug} g={h.guide} snippet={h.snippet} />
              ))}
            </ul>
          ) : (
            <div className="mt-4">
              <EmptyState
                title="Nothing matched that search"
                action={<ButtonLink to="/learn" variant="secondary">Browse all topics</ButtonLink>}
              >
                Try fewer or simpler words (for example “camera”, “wifi” or “offline”), or browse a topic.
              </EmptyState>
            </div>
          )}
        </section>
      ) : (
        <>
          <section aria-labelledby="topics">
            <h2 id="topics" className="text-xl font-bold text-slate-900">
              Browse by topic
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORIES.map((c) => (
                <li key={c.id} className="relative rounded-lg border border-slate-200 bg-white p-5 hover:border-brand-600">
                  <h3 className="text-lg font-semibold text-slate-900">
                    <Link to={`/learn/c/${c.id}`} className="after:absolute after:inset-0 hover:underline">
                      {c.title}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">{c.blurb}</p>
                  <p className="mt-3 text-xs font-medium text-slate-600">{guidesIn(c.id).length} guides</p>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="start" className="mt-12">
            <h2 id="start" className="text-xl font-bold text-slate-900">
              Start here
            </h2>
            <ul className={cardList}>
              {START_HERE.map((slug) => getGuide(slug)).filter((g): g is Guide => Boolean(g)).map((g) => (
                <GuideCard key={g.slug} g={g} />
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}

export function LearnCategory() {
  const { category = '' } = useParams()
  const cat = categoryById(category)
  if (!cat) return <NotFound />
  const guides = guidesIn(cat.id)
  return (
    <div>
      <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
        <Link to="/learn" className="hover:underline">
          Guides
        </Link>{' '}
        / <span aria-current="page">{cat.title}</span>
      </nav>
      <h1 className="mt-3 text-3xl font-bold text-slate-900">{cat.title}</h1>
      <p className="mt-2 max-w-2xl text-slate-600">{cat.blurb}</p>
      <ul className={cardList}>
        {guides.map((g) => (
          <GuideCard key={g.slug} g={g} showCategory={false} />
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap gap-2">
        {CATEGORIES.filter((c) => c.id !== cat.id).map((c) => (
          <Link
            key={c.id}
            to={`/learn/c/${c.id}`}
            className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
          >
            {c.title}
          </Link>
        ))}
      </div>
    </div>
  )
}

// --- Article ---------------------------------------------------------------------------------
function textOf(node: ReactNode): string {
  let out = ''
  Children.forEach(node, (child) => {
    if (typeof child === 'string' || typeof child === 'number') out += child
    else if (isValidElement<{ children?: ReactNode }>(child)) out += textOf(child.props.children)
  })
  return out
}

const callouts: Record<string, string> = {
  safety: 'border-red-300 bg-red-50 text-red-950',
  warning: 'border-amber-300 bg-amber-50 text-amber-950',
  note: 'border-sky-200 bg-sky-50 text-sky-950',
  tip: 'border-emerald-200 bg-emerald-50 text-emerald-950',
}

const mdComponents: Components = {
  a({ href = '', children }) {
    if (href.startsWith('/')) return <Link to={href}>{children}</Link>
    if (href.startsWith('#')) return <a href={href}>{children}</a>
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    )
  },
  h2: ({ children }) => (
    <h2 id={slugify(textOf(children))} className="scroll-mt-24">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 id={slugify(textOf(children))} className="scroll-mt-24">
      {children}
    </h3>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto">
      <table>{children}</table>
    </div>
  ),
  blockquote: ({ children }) => {
    const kind = /^\s*(safety|warning|note|tip)\b/i.exec(textOf(children))?.[1]?.toLowerCase()
    const tone = kind ? callouts[kind] : 'border-slate-300 bg-slate-50 text-slate-900'
    return <blockquote className={`not-italic rounded-md border px-4 py-1 ${tone}`}>{children}</blockquote>
  },
}

export function GuideArticle() {
  const { slug = '' } = useParams()
  const guide = getGuide(slug)

  useEffect(() => {
    if (guide) document.title = `${guide.title} · SmartNest`
    return () => {
      document.title = 'SmartNest — Smart Living, Simplified'
    }
  }, [guide])

  // Honour #anchors on arrival (the router does not scroll to hashes on its own).
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (id) document.getElementById(id)?.scrollIntoView()
  }, [slug])

  if (!guide) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Guide not found</h1>
        <p className="mt-2 text-slate-600">That guide doesn't exist or has moved.</p>
        <div className="mt-6">
          <ButtonLink to="/learn">Browse all guides</ButtonLink>
        </div>
      </div>
    )
  }

  const cat = categoryById(guide.category)!
  const siblings = guidesIn(guide.category)
  const pos = siblings.findIndex((g) => g.slug === guide.slug)
  const prev = siblings[pos - 1]
  const next = siblings[pos + 1]
  const related = relatedGuides(guide)
  const toc = guide.headings.filter((h) => h.level === 2)

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <article className="min-w-0">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
          <Link to="/learn" className="hover:underline">
            Guides
          </Link>{' '}
          /{' '}
          <Link to={`/learn/c/${cat.id}`} className="hover:underline">
            {cat.title}
          </Link>
        </nav>
        <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">{guide.title}</h1>
        <p className="mt-2 text-lg text-slate-600">{guide.summary}</p>
        <p className="mt-3">
          <GuideMeta g={guide} />
        </p>

        {toc.length > 2 && (
          <nav aria-label="On this page" className="mt-6 rounded-lg border border-slate-200 bg-white p-4 lg:hidden">
            <p className="text-sm font-semibold text-slate-900">On this page</p>
            <ul className="mt-2 space-y-1 text-sm">
              {toc.map((h) => (
                <li key={h.id}>
                  <a className={linkCls} href={`#${h.id}`}>
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="prose prose-slate mt-8 max-w-none prose-a:text-brand-700 prose-headings:text-slate-900 prose-table:text-sm">
          <Markdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {guide.body}
          </Markdown>
        </div>

        {related.length > 0 && (
          <section aria-labelledby="related" className="mt-12">
            <h2 id="related" className="text-xl font-bold text-slate-900">
              Related guides
            </h2>
            <ul className={cardList}>
              {related.map((g) => (
                <GuideCard key={g.slug} g={g} />
              ))}
            </ul>
          </section>
        )}

        <nav aria-label="More in this topic" className="mt-10 flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-6 text-sm">
          {prev ? (
            <Link to={`/learn/${prev.slug}`} className={linkCls}>
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link to={`/learn/${next.slug}`} className={linkCls}>
              {next.title} →
            </Link>
          )}
        </nav>
      </article>

      {toc.length > 2 && (
        <aside className="hidden lg:block">
          <nav aria-label="On this page" className="sticky top-24">
            <Card className="!p-4">
              <p className="text-sm font-semibold text-slate-900">On this page</p>
              <ul className="mt-3 space-y-2 text-sm">
                {toc.map((h) => (
                  <li key={h.id}>
                    <a className="text-slate-700 hover:text-brand-700 hover:underline" href={`#${h.id}`}>
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          </nav>
        </aside>
      )}
    </div>
  )
}
