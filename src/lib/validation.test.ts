import { describe, expect, it } from 'vitest'
import { loginSchema, resetSchema, signupSchema } from './validation'

const firstMessage = (r: { success: boolean; error?: { issues: { message: string; path: PropertyKey[] }[] } }, field: string) =>
  r.error?.issues.find((i) => i.path[0] === field)?.message

describe('signupSchema', () => {
  it('accepts valid input and normalises the email and name', () => {
    const r = signupSchema.parse({ name: '  Asha Rao ', email: ' Asha@Example.COM ', password: 'Sup3rSecret99' })
    expect(r).toEqual({ name: 'Asha Rao', email: 'asha@example.com', password: 'Sup3rSecret99' })
  })

  it.each([
    ['short1', 'password', 'at least 8'],
    ['onlyletters', 'password', 'number'],
    ['12345678', 'password', 'letter'],
  ])('rejects password %s', (password, field, text) => {
    const r = signupSchema.safeParse({ name: 'A', email: 'a@b.co', password })
    expect(r.success).toBe(false)
    expect(firstMessage(r, field)).toContain(text)
  })

  it('rejects bad emails and empty names', () => {
    expect(firstMessage(signupSchema.safeParse({ name: 'A', email: 'nope', password: 'abcdefg1' }), 'email')).toMatch(/valid email/)
    expect(firstMessage(signupSchema.safeParse({ name: ' ', email: 'a@b.co', password: 'abcdefg1' }), 'name')).toMatch(/name/)
    expect(firstMessage(signupSchema.safeParse({ name: 'A', email: '', password: 'abcdefg1' }), 'email')).toMatch(/Enter your email/)
  })
})

describe('other schemas', () => {
  it('login only requires something in both fields', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true)
    expect(loginSchema.safeParse({ email: 'a@b.co', password: '' }).success).toBe(false)
  })
  it('reset enforces the same password rules as signup', () => {
    expect(resetSchema.safeParse({ password: 'short' }).success).toBe(false)
    expect(resetSchema.safeParse({ password: 'Longenough1' }).success).toBe(true)
  })
})
