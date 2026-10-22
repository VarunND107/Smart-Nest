import { GUIDES } from './content'
import type { Guide } from './content'

export interface SearchHit {
  guide: Guide
  score: number
  snippet: string
}

const STOP = new Set(['the', 'a', 'an', 'to', 'is', 'of', 'and', 'or', 'how', 'do', 'does', 'my', 'i', 'in', 'on', 'for', 'it', 'what', 'why'])

/** Lower-case and fold spellings people type differently, so "wi-fi", "WiFi" and "wi fi" all match. */
export function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/wi[\s-]?fi/g, 'wifi')
    .replace(/z[\s-]?wave/g, 'zwave')
    .replace(/\bcctv\b/g, 'camera')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // markdown links -> their text
    .replace(/[`*_>#|]/g, ' ')
}

export function tokenise(query: string): string[] {
  return normalise(query)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOP.has(t))
}

interface Indexed {
  title: string
  titleWords: string[]
  summary: string
  tags: string
  headings: string
  body: string
}

const index = new Map<string, Indexed>()
function indexed(g: Guide): Indexed {
  let e = index.get(g.slug)
  if (!e) {
    const title = normalise(g.title)
    e = {
      title,
      titleWords: title.split(/[^a-z0-9]+/).filter(Boolean),
      summary: normalise(g.summary),
      tags: normalise(g.tags.join(' ')),
      headings: normalise(g.headings.map((h) => h.text).join(' ')),
      body: normalise(g.body),
    }
    index.set(g.slug, e)
  }
  return e
}

/** Crude plural folding so "cameras" and "camera" are the same search. */
const stem = (term: string) => (term.length > 3 && term.endsWith('s') ? term.slice(0, -1) : term)
const isWord = (words: string[], s: string) => words.some((w) => w === s || w === `${s}s` || w === `${s}es`)
const count = (haystack: string, needle: string) => haystack.split(needle).length - 1

function snippetFor(g: Guide, terms: string[]): string {
  const plain = g.body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#+\s.*$/gm, ' ')
    .replace(/[*_`>|]/g, '')
  for (const sentence of plain.split(/(?<=[.!?])\s+|\n+/)) {
    const s = normalise(sentence)
    if (terms.some((t) => s.includes(stem(t)))) {
      const clean = sentence.replace(/\s+/g, ' ').trim()
      return clean.length > 170 ? `${clean.slice(0, 167)}…` : clean
    }
  }
  return g.summary
}

/**
 * Every search word must appear somewhere in the guide. Ranking: title > tags > headings > summary > body.
 * Deliberately simple and deterministic: no external service, nothing sent anywhere.
 */
export function searchGuides(query: string, guides: Guide[] = GUIDES, limit = 25): SearchHit[] {
  const terms = tokenise(query)
  if (!terms.length) return []
  const hits: SearchHit[] = []
  for (const guide of guides) {
    const f = indexed(guide)
    let score = 0
    let all = true
    let titleHits = 0
    for (const term of terms) {
      const t = stem(term)
      let sc = 0
      if (f.title.includes(t)) {
        sc = isWord(f.titleWords, t) ? 14 : 10
        titleHits++
      }
      if (f.tags.includes(t)) sc = Math.max(sc, 7)
      if (f.headings.includes(t)) sc = Math.max(sc, 5)
      if (f.summary.includes(t)) sc = Math.max(sc, 4)
      const n = count(f.body, t)
      if (n > 0) sc = Math.max(sc, 1) + Math.min(n, 5) * 0.2
      if (sc === 0) {
        all = false
        break
      }
      score += sc
    }
    // Prefer the guide whose title is *about* the query over one that merely contains the words.
    if (all) score += (6 * titleHits) / Math.max(1, f.titleWords.length)
    if (all) hits.push({ guide, score, snippet: snippetFor(guide, terms) })
  }
  return hits.sort((a, b) => b.score - a.score || a.guide.title.localeCompare(b.guide.title)).slice(0, limit)
}
