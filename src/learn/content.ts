export const CATEGORIES = [
  {
    id: 'basics',
    title: 'Smart Home Basics',
    blurb: 'What a smart home is, how devices talk to each other, and how to plan without wasting money.',
  },
  {
    id: 'devices',
    title: 'Device Guides',
    blurb: 'Plugs, bulbs, switches, cameras, locks, sensors and more: how each works and what to check before buying.',
  },
  {
    id: 'setup',
    title: 'Installation & Setup',
    blurb: 'Pairing, placement, wiring safety and voice-assistant setup, done properly the first time.',
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    blurb: 'Protect your network, accounts and cameras, and understand what your devices share.',
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    blurb: 'Structured fixes for offline devices, failed pairing, flaky automations and more.',
  },
  {
    id: 'automations',
    title: 'Automation Ideas',
    blurb: 'Practical routines for lighting, security, comfort and energy, plus how to build them safely.',
  },
  {
    id: 'faq',
    title: 'FAQ',
    blurb: 'Short answers to the questions people ask most before and after buying smart devices.',
  },
] as const

export type CategoryId = (typeof CATEGORIES)[number]['id']
export const categoryById = (id: string) => CATEGORIES.find((c) => c.id === id)

export type Level = 'beginner' | 'intermediate' | 'advanced'

export interface Heading {
  id: string
  text: string
  level: 2 | 3
}

export interface Guide {
  slug: string
  title: string
  summary: string
  category: CategoryId
  order: number
  level: Level
  tags: string[]
  related: string[]
  /** Links a device guide to a device category used by the catalogue and My Home. */
  deviceCategory?: string
  body: string
  headings: Heading[]
  minutes: number
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseList(value: string): string[] {
  const inner = value.trim().replace(/^\[/, '').replace(/\]$/, '')
  return inner
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function extractHeadings(body: string): Heading[] {
  const headings: Heading[] = []
  let inFence = false
  for (const line of body.split('\n')) {
    if (line.trimStart().startsWith('```')) inFence = !inFence
    if (inFence) continue
    const m = /^(##|###)\s+(.+?)\s*$/.exec(line)
    if (m) headings.push({ id: slugify(m[2]!), text: m[2]!.replace(/[`*_]/g, ''), level: m[1] === '##' ? 2 : 3 })
  }
  return headings
}

const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced']

/** Parses `content/guides/<category>/<slug>.md`. Throws on malformed input so bad content fails the build/tests. */
export function parseGuide(path: string, raw: string): Guide {
  const m = /^\/?(?:.*\/)?guides\/([^/]+)\/([^/]+)\.md$/.exec(path)
  if (!m) throw new Error(`Unexpected guide path: ${path}`)
  const [, folder, slug] = m
  if (!categoryById(folder!)) throw new Error(`${path}: unknown category folder "${folder}"`)

  const fm = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw)
  if (!fm) throw new Error(`${path}: missing frontmatter`)
  const meta: Record<string, string> = {}
  for (const line of fm[1]!.split(/\r?\n/)) {
    if (!line.trim()) continue
    const idx = line.indexOf(':')
    if (idx < 0) throw new Error(`${path}: bad frontmatter line "${line}"`)
    meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
  }
  for (const key of ['title', 'summary', 'order', 'level']) {
    if (!meta[key]) throw new Error(`${path}: frontmatter is missing "${key}"`)
  }
  const level = meta.level as Level
  if (!LEVELS.includes(level)) throw new Error(`${path}: level must be one of ${LEVELS.join(', ')}`)

  const body = fm[2]!.trim()
  const words = body.split(/\s+/).length
  return {
    slug: slug!,
    title: meta.title!,
    summary: meta.summary!,
    category: folder as CategoryId,
    order: Number(meta.order),
    level,
    tags: parseList(meta.tags ?? ''),
    related: parseList(meta.related ?? ''),
    deviceCategory: meta.deviceCategory || undefined,
    body,
    headings: extractHeadings(body),
    minutes: Math.max(1, Math.round(words / 200)),
  }
}

const files = import.meta.glob('../content/guides/*/*.md', { query: '?raw', import: 'default', eager: true }) as Record<
  string,
  string
>

const categoryOrder = CATEGORIES.map((c) => c.id as string)

export const GUIDES: Guide[] = Object.entries(files)
  .map(([path, raw]) => parseGuide(path, raw))
  .sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category) || a.order - b.order)

const bySlug = new Map(GUIDES.map((g) => [g.slug, g]))

export const getGuide = (slug: string) => bySlug.get(slug)
export const guidesIn = (category: string) => GUIDES.filter((g) => g.category === category)

/** Guides for a device category (e.g. "camera"), used to link devices to the right reading. */
export const guidesForDeviceCategory = (deviceCategory: string) => GUIDES.filter((g) => g.deviceCategory === deviceCategory)

/** Hand-picked links first, then others that share tags, so every article leads somewhere useful. */
export function relatedGuides(guide: Guide, max = 6): Guide[] {
  const picked: Guide[] = []
  const seen = new Set([guide.slug])
  for (const slug of guide.related) {
    const g = bySlug.get(slug)
    if (g && !seen.has(slug)) {
      picked.push(g)
      seen.add(slug)
    }
  }
  const tagged = GUIDES.filter((g) => !seen.has(g.slug))
    .map((g) => ({ g, shared: g.tags.filter((t) => guide.tags.includes(t)).length }))
    .filter((x) => x.shared > 0)
    .sort((a, b) => b.shared - a.shared)
  for (const { g } of tagged) {
    if (picked.length >= max) break
    picked.push(g)
  }
  return picked.slice(0, max)
}
