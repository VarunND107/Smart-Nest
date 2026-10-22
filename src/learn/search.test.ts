import { describe, expect, it } from 'vitest'
import { normalise, searchGuides, tokenise } from './search'

const slugs = (q: string) => searchGuides(q).map((h) => h.guide.slug)

describe('search', () => {
  it('treats wi-fi, WiFi and "wi fi" as the same thing', () => {
    const a = slugs('wifi')
    expect(a.length).toBeGreaterThan(5)
    expect(slugs('Wi-Fi')).toEqual(a)
    expect(slugs('wi fi')).toEqual(a)
  })

  it('ranks the obviously relevant guide first', () => {
    expect(slugs('camera privacy')[0]).toBe('camera-and-microphone-privacy')
    expect(slugs('smart lock')[0]).toBe('smart-locks')
    expect(slugs('device offline')[0]).toBe('device-offline-troubleshooting-flow')
    expect(slugs('matter')[0]).toBe('matter-explained')
  })

  it('requires every word to match somewhere', () => {
    const both = slugs('camera lock')
    for (const s of both) {
      const g = searchGuides('camera lock').find((h) => h.guide.slug === s)!.guide
      const text = `${g.title} ${g.summary} ${g.tags.join(' ')} ${g.body}`.toLowerCase()
      expect(text).toContain('camera')
      expect(text).toContain('lock')
    }
    expect(slugs('camera xyzzyqwerty')).toEqual([])
  })

  it('handles plurals and ignores filler words', () => {
    expect(slugs('cameras')).toEqual(slugs('camera'))
    expect(tokenise('how do I fix the wifi')).toEqual(['fix', 'wifi'])
  })

  it('finds terms that appear only in the body, with a readable snippet', () => {
    const hits = searchGuides('monsoon')
    expect(hits.length).toBeGreaterThan(0)
    expect(hits[0]!.snippet.toLowerCase()).toContain('monsoon')
    expect(hits[0]!.snippet.length).toBeLessThanOrEqual(171)
  })

  it('returns nothing for empty or stop-word-only queries', () => {
    expect(searchGuides('')).toEqual([])
    expect(searchGuides('   ')).toEqual([])
    expect(searchGuides('the and of')).toEqual([])
  })

  it('maps cctv to camera and folds markdown noise', () => {
    expect(slugs('cctv')).toEqual(slugs('camera'))
    expect(normalise('[Z-Wave](/learn/x) **hub**').trim().split(/\s+/)).toEqual(['zwave', 'hub'])
  })

  it('does not match ordinary words inside the longer word "wifi" spelling variants by accident', () => {
    expect(slugs('zigbee').length).toBeGreaterThan(3)
  })
})
