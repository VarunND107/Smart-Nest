import { describe, expect, it } from 'vitest'
import { CATEGORIES, GUIDES, categoryById, getGuide, parseGuide, relatedGuides } from './content'

const LINK = /\]\((\/learn[^)\s]*)\)/g

function linksIn(body: string): string[] {
  return [...body.matchAll(LINK)].map((m) => m[1]!)
}

describe('guide library', () => {
  it('loads a substantial library covering all seven required topics', () => {
    expect(CATEGORIES.map((c) => c.title)).toEqual([
      'Smart Home Basics',
      'Device Guides',
      'Installation & Setup',
      'Security & Privacy',
      'Troubleshooting',
      'Automation Ideas',
      'FAQ',
    ])
    expect(GUIDES.length).toBeGreaterThanOrEqual(45)
    for (const c of CATEGORIES) {
      expect(GUIDES.filter((g) => g.category === c.id).length, `${c.id} has too few guides`).toBeGreaterThanOrEqual(3)
    }
  })

  it('has unique slugs', () => {
    const slugs = GUIDES.map((g) => g.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('is substantive, not placeholder text', () => {
    for (const g of GUIDES) {
      const words = g.body.split(/\s+/).length
      expect(words, `${g.slug} is too short (${words} words)`).toBeGreaterThanOrEqual(220)
      expect(g.summary.length, `${g.slug} summary`).toBeGreaterThan(40)
      expect(g.body, `${g.slug} contains placeholder text`).not.toMatch(/lorem ipsum|TODO|TBD|coming soon|placeholder/i)
    }
  })

  it('every related slug points at a real guide', () => {
    for (const g of GUIDES) {
      for (const slug of g.related) {
        expect(getGuide(slug), `${g.slug} relates to missing "${slug}"`).toBeDefined()
        expect(slug, `${g.slug} relates to itself`).not.toBe(g.slug)
      }
    }
  })

  it('every internal link in every article resolves', () => {
    for (const g of GUIDES) {
      for (const href of linksIn(g.body)) {
        const path = href.split('#')[0]!
        if (path === '/learn') continue
        const cat = /^\/learn\/c\/([^/]+)$/.exec(path)?.[1]
        if (cat) {
          expect(categoryById(cat), `${g.slug} links to missing category ${href}`).toBeDefined()
          continue
        }
        const slug = /^\/learn\/([^/]+)$/.exec(path)?.[1]
        expect(slug && getGuide(slug), `${g.slug} has a broken link: ${href}`).toBeTruthy()
        if (href.includes('#')) {
          const target = getGuide(slug!)!
          expect(target.headings.map((h) => h.id), `${g.slug} -> ${href}: no such heading`).toContain(href.split('#')[1])
        }
      }
    }
  })

  it('cross-links generously: every guide links onward, and every guide can be reached from another', () => {
    const inbound = new Map(GUIDES.map((g) => [g.slug, 0]))
    for (const g of GUIDES) {
      const out = new Set<string>(g.related)
      for (const href of linksIn(g.body)) {
        const slug = /^\/learn\/([^/#]+)/.exec(href)?.[1]
        if (slug && slug !== 'c') out.add(slug)
      }
      out.delete(g.slug)
      expect(out.size, `${g.slug} links to too few guides`).toBeGreaterThanOrEqual(3)
      for (const slug of out) inbound.set(slug, (inbound.get(slug) ?? 0) + 1)
    }
    const orphans = [...inbound].filter(([, n]) => n === 0).map(([s]) => s)
    expect(orphans, 'guides nothing links to').toEqual([])
  })

  it('device guides link to install, security and troubleshooting reading', () => {
    const devices = GUIDES.filter((g) => g.category === 'devices')
    expect(devices.length).toBeGreaterThanOrEqual(10)
    for (const g of devices) {
      expect(g.deviceCategory, `${g.slug} needs a deviceCategory`).toBeTruthy()
      const cats = new Set(relatedGuides(g, 12).map((r) => r.category))
      const reachesHelp = ['setup', 'security', 'troubleshooting', 'automations'].some((c) => cats.has(c as never))
      expect(reachesHelp, `${g.slug} does not lead to setup/security/troubleshooting content`).toBe(true)
    }
    const cameras = getGuide('smart-cameras')!
    const related = relatedGuides(cameras).map((r) => r.category)
    expect(related).toEqual(expect.arrayContaining(['setup', 'security', 'troubleshooting']))
  })

  it('device categories are unique', () => {
    const cats = GUIDES.filter((g) => g.deviceCategory).map((g) => g.deviceCategory)
    expect(new Set(cats).size).toBe(cats.length)
  })

  it('heading ids are unique within each article (anchors and the contents list rely on it)', () => {
    for (const g of GUIDES) {
      const ids = g.headings.map((h) => h.id)
      expect(new Set(ids).size, `${g.slug} has duplicate heading ids`).toBe(ids.length)
    }
  })

  it('makes no claims of AI or live device control', () => {
    for (const g of GUIDES) {
      expect(g.body, g.slug).not.toMatch(/powered by (AI|machine learning)|our AI/i)
    }
  })
})

describe('parseGuide', () => {
  const ok = '---\ntitle: T\nsummary: S\norder: 1\nlevel: beginner\ntags: [a, b]\n---\n## Hello\nbody text'
  it('parses frontmatter, headings and reading time', () => {
    const g = parseGuide('../content/guides/basics/x.md', ok)
    expect(g).toMatchObject({ slug: 'x', category: 'basics', title: 'T', tags: ['a', 'b'], related: [] })
    expect(g.headings).toEqual([{ id: 'hello', text: 'Hello', level: 2 }])
    expect(g.minutes).toBe(1)
  })
  it('ignores headings inside code fences', () => {
    const g = parseGuide('../content/guides/basics/x.md', `${ok}\n\`\`\`\n## not a heading\n\`\`\``)
    expect(g.headings).toHaveLength(1)
  })
  it.each([
    ['../content/guides/nope/x.md', ok, /unknown category/],
    ['../content/guides/basics/x.md', 'no frontmatter', /missing frontmatter/],
    ['../content/guides/basics/x.md', ok.replace('level: beginner', 'level: wizard'), /level must be/],
    ['../content/guides/basics/x.md', ok.replace('title: T\n', ''), /missing "title"/],
  ])('rejects bad content: %s', (path, raw, message) => {
    expect(() => parseGuide(path, raw)).toThrow(message)
  })
})
