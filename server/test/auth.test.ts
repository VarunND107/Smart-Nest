import express from 'express'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { authenticate, requireRole } from '../src/auth/middleware.js'
import { bootstrapAdmin } from '../src/bootstrap.js'
import { runMigrations } from '../src/db/migrate.js'
import { bearer, resetDb, setup, signUp, strongPassword } from './helpers.js'

let ctx: Awaited<ReturnType<typeof setup>>

beforeAll(async () => {
  ctx = await setup()
})
beforeEach(async () => {
  await resetDb(ctx.pool)
  ctx.sent.length = 0
})
afterAll(async () => {
  await ctx.pool.end()
})

describe('signup', () => {
  it('creates a customer, returns a session, and never exposes the password hash', async () => {
    const res = await signUp(ctx.http)
    expect(res.status).toBe(201)
    expect(res.body.token).toMatch(/^[\w-]{40,}$/)
    expect(res.body.user).toMatchObject({ email: 'asha@example.com', name: 'Asha Rao', role: 'customer' })
    expect(JSON.stringify(res.body)).not.toMatch(/password|scrypt/i)

    const { rows } = await ctx.pool.query('select password_hash from users')
    expect(rows[0].password_hash).toMatch(/^scrypt\$/)
    expect(rows[0].password_hash).not.toContain(strongPassword)
  })

  it('normalises the email and stores only a hash of the session token', async () => {
    const res = await signUp(ctx.http, { email: '  Asha@Example.COM ' })
    expect(res.status).toBe(201)
    expect(res.body.user.email).toBe('asha@example.com')
    const { rows } = await ctx.pool.query('select token_hash from sessions')
    expect(rows[0].token_hash).not.toBe(res.body.token)
    expect(rows[0].token_hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('cannot self-select admin: a role in the body is ignored', async () => {
    const res = await ctx.http
      .post('/api/auth/signup')
      .send({ name: 'Mallory', email: 'mallory@example.com', password: strongPassword, role: 'admin' })
    expect(res.status).toBe(201)
    expect(res.body.user.role).toBe('customer')
    const { rows } = await ctx.pool.query("select role from users where email = 'mallory@example.com'")
    expect(rows[0].role).toBe('customer')
  })

  it.each([
    [{ password: 'short1' }, 'password', /at least 8/],
    [{ password: 'alllettersnodigits' }, 'password', /number/],
    [{ password: '1234567890' }, 'password', /letter/],
    [{ email: 'not-an-email' }, 'email', /valid email/],
    [{ name: '   ' }, 'name', /name/],
  ])('rejects invalid input %j with a field message', async (override, field, message) => {
    const res = await signUp(ctx.http, override)
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(res.body.error.fields[field]).toMatch(message)
  })

  it('rejects a duplicate email (case-insensitively) with 409', async () => {
    expect((await signUp(ctx.http)).status).toBe(201)
    const dup = await signUp(ctx.http, { email: 'ASHA@example.com' })
    expect(dup.status).toBe(409)
    expect(dup.body.error.code).toBe('EMAIL_TAKEN')
    expect(dup.body.error.fields.email).toBeTruthy()
  })
})

describe('login / me / logout', () => {
  it('logs in with correct credentials and updates last_login_at', async () => {
    await signUp(ctx.http)
    const res = await ctx.http.post('/api/auth/login').send({ email: 'ASHA@example.com', password: strongPassword })
    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe('asha@example.com')
    const { rows } = await ctx.pool.query('select last_login_at from users')
    expect(rows[0].last_login_at).not.toBeNull()
  })

  it('gives the same error for a wrong password and an unknown email', async () => {
    await signUp(ctx.http)
    const wrong = await ctx.http.post('/api/auth/login').send({ email: 'asha@example.com', password: 'WrongPass123' })
    const unknown = await ctx.http.post('/api/auth/login').send({ email: 'nobody@example.com', password: 'WrongPass123' })
    expect(wrong.status).toBe(401)
    expect(unknown.status).toBe(401)
    expect(wrong.body.error).toEqual(unknown.body.error)
    expect(wrong.body.error.code).toBe('INVALID_CREDENTIALS')
  })

  it('serves /me only with a valid token', async () => {
    const { body } = await signUp(ctx.http)
    const ok = await ctx.http.get('/api/auth/me').set(bearer(body.token))
    expect(ok.status).toBe(200)
    expect(ok.body.user.id).toBe(body.user.id)

    expect((await ctx.http.get('/api/auth/me')).status).toBe(401)
    const bad = await ctx.http.get('/api/auth/me').set(bearer('definitely-not-a-real-token-xxxxxxxx'))
    expect(bad.status).toBe(401)
    expect(bad.body.error.code).toBe('SESSION_EXPIRED')
    expect((await ctx.http.get('/api/auth/me').set({ Authorization: 'Basic abc' })).status).toBe(401)
  })

  it('logout revokes the session server-side', async () => {
    const { body } = await signUp(ctx.http)
    expect((await ctx.http.post('/api/auth/logout').set(bearer(body.token))).status).toBe(204)
    expect((await ctx.http.get('/api/auth/me').set(bearer(body.token))).status).toBe(401)
    const { rows } = await ctx.pool.query('select count(*)::int as n from sessions')
    expect(rows[0].n).toBe(0)
  })

  it('rejects an expired session', async () => {
    const { body } = await signUp(ctx.http)
    await ctx.pool.query("update sessions set expires_at = now() - interval '1 minute'")
    const res = await ctx.http.get('/api/auth/me').set(bearer(body.token))
    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('SESSION_EXPIRED')
  })

  it('keeps separate sessions per login and logout only ends the one used', async () => {
    await signUp(ctx.http)
    const a = (await ctx.http.post('/api/auth/login').send({ email: 'asha@example.com', password: strongPassword })).body.token
    const b = (await ctx.http.post('/api/auth/login').send({ email: 'asha@example.com', password: strongPassword })).body.token
    await ctx.http.post('/api/auth/logout').set(bearer(a))
    expect((await ctx.http.get('/api/auth/me').set(bearer(a))).status).toBe(401)
    expect((await ctx.http.get('/api/auth/me').set(bearer(b))).status).toBe(200)
  })
})

describe('password reset', () => {
  const tokenFrom = (link: string) => new URL(link).searchParams.get('token')!

  it('answers identically for known and unknown emails, and only mails the real account', async () => {
    await signUp(ctx.http)
    const known = await ctx.http.post('/api/auth/forgot-password').send({ email: 'asha@example.com' })
    const unknown = await ctx.http.post('/api/auth/forgot-password').send({ email: 'ghost@example.com' })
    expect(known.status).toBe(200)
    expect(unknown.status).toBe(200)
    expect(known.body).toEqual(unknown.body)
    await new Promise((r) => setTimeout(r, 50))
    expect(ctx.sent).toHaveLength(1)
    expect(ctx.sent[0]!.to).toBe('asha@example.com')
    expect(ctx.sent[0]!.link.startsWith('https://smartnest.example/reset-password?token=')).toBe(true)
  })

  it('resets the password, is single-use, and signs out every existing session', async () => {
    const { body } = await signUp(ctx.http)
    await ctx.http.post('/api/auth/forgot-password').send({ email: 'asha@example.com' })
    await new Promise((r) => setTimeout(r, 50))
    const token = tokenFrom(ctx.sent[0]!.link)

    const reset = await ctx.http.post('/api/auth/reset-password').send({ token, password: 'BrandNew2024pw' })
    expect(reset.status).toBe(200)

    expect((await ctx.http.get('/api/auth/me').set(bearer(body.token))).status).toBe(401)
    expect(
      (await ctx.http.post('/api/auth/login').send({ email: 'asha@example.com', password: strongPassword })).status,
    ).toBe(401)
    expect(
      (await ctx.http.post('/api/auth/login').send({ email: 'asha@example.com', password: 'BrandNew2024pw' })).status,
    ).toBe(200)

    const reuse = await ctx.http.post('/api/auth/reset-password').send({ token, password: 'AnotherOne2024' })
    expect(reuse.status).toBe(400)
    expect(reuse.body.error.code).toBe('INVALID_RESET_TOKEN')
  })

  it('a newer request invalidates the older link', async () => {
    await signUp(ctx.http)
    await ctx.http.post('/api/auth/forgot-password').send({ email: 'asha@example.com' })
    await ctx.http.post('/api/auth/forgot-password').send({ email: 'asha@example.com' })
    await new Promise((r) => setTimeout(r, 50))
    const [first, second] = ctx.sent.map((m) => tokenFrom(m.link))
    expect((await ctx.http.post('/api/auth/reset-password').send({ token: first, password: 'BrandNew2024pw' })).status).toBe(400)
    expect((await ctx.http.post('/api/auth/reset-password').send({ token: second, password: 'BrandNew2024pw' })).status).toBe(200)
  })

  it('rejects expired, unknown, and weak-password resets', async () => {
    await signUp(ctx.http)
    await ctx.http.post('/api/auth/forgot-password').send({ email: 'asha@example.com' })
    await new Promise((r) => setTimeout(r, 50))
    const token = tokenFrom(ctx.sent[0]!.link)

    const weak = await ctx.http.post('/api/auth/reset-password').send({ token, password: 'short' })
    expect(weak.status).toBe(400)
    expect(weak.body.error.fields.password).toBeTruthy()

    const unknown = await ctx.http.post('/api/auth/reset-password').send({ token: 'x'.repeat(43), password: 'BrandNew2024pw' })
    expect(unknown.body.error.code).toBe('INVALID_RESET_TOKEN')

    await ctx.pool.query("update password_reset_tokens set expires_at = now() - interval '1 minute'")
    const expired = await ctx.http.post('/api/auth/reset-password').send({ token, password: 'BrandNew2024pw' })
    expect(expired.body.error.code).toBe('INVALID_RESET_TOKEN')
  })

  it('stores only a hash of the reset token', async () => {
    await signUp(ctx.http)
    await ctx.http.post('/api/auth/forgot-password').send({ email: 'asha@example.com' })
    await new Promise((r) => setTimeout(r, 50))
    const token = tokenFrom(ctx.sent[0]!.link)
    const { rows } = await ctx.pool.query('select token_hash from password_reset_tokens')
    expect(rows[0].token_hash).not.toBe(token)
  })
})

describe('authorisation', () => {
  it('requireRole lets admins in and keeps customers out, based on the database, not the request', async () => {
    const app = express()
    app.use(authenticate(ctx.pool))
    app.get('/admin-only', requireRole('admin'), (_req, res) => void res.json({ ok: true }))
    app.use((err: { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      res.status(err.status ?? 500).json({})
    })
    const http = request(app)

    const customer = await signUp(ctx.http)
    expect((await http.get('/admin-only')).status).toBe(401)
    expect((await http.get('/admin-only').set(bearer(customer.body.token))).status).toBe(403)

    // Elevation happens out-of-band (SQL / bootstrap), never through an API payload.
    await ctx.pool.query("update users set role = 'admin' where email = 'asha@example.com'")
    expect((await http.get('/admin-only').set(bearer(customer.body.token))).status).toBe(200)
  })

  it('the role column rejects values other than customer/admin', async () => {
    await signUp(ctx.http)
    await expect(ctx.pool.query("update users set role = 'superuser'")).rejects.toThrow(/users_role_valid/)
  })
})

describe('admin bootstrap', () => {
  it('creates an admin once, can sign in, and never promotes an existing customer', async () => {
    const cfg = { ...ctx.config, BOOTSTRAP_ADMIN_EMAIL: 'boss@example.com', BOOTSTRAP_ADMIN_PASSWORD: 'Chairman-Passphrase-1' }
    const logs: string[] = []
    await bootstrapAdmin(ctx.pool, cfg, (m) => logs.push(m))
    await bootstrapAdmin(ctx.pool, cfg, (m) => logs.push(m))
    const { rows } = await ctx.pool.query("select role from users where email = 'boss@example.com'")
    expect(rows).toEqual([{ role: 'admin' }])
    const login = await ctx.http.post('/api/auth/login').send({ email: 'boss@example.com', password: 'Chairman-Passphrase-1' })
    expect(login.body.user.role).toBe('admin')
    expect(logs.some((l) => l.includes('already exists'))).toBe(true)

    await signUp(ctx.http, { email: 'squatter@example.com' })
    await bootstrapAdmin(ctx.pool, { ...cfg, BOOTSTRAP_ADMIN_EMAIL: 'squatter@example.com' }, (m) => logs.push(m))
    const squatter = await ctx.pool.query("select role from users where email = 'squatter@example.com'")
    expect(squatter.rows[0].role).toBe('customer')
    expect(logs.some((l) => l.includes('NOT promoted'))).toBe(true)
  })
})

describe('platform', () => {
  it('health reports ok with a working database', async () => {
    const res = await ctx.http.get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ status: 'ok', db: 'ok', service: 'smartnest-api' })
  })

  it('health says honestly whether password-reset email can be delivered', async () => {
    expect((await ctx.http.get('/api/health')).body.features).toEqual({ passwordResetEmail: false })
    const mailed = await setup({ RESEND_API_KEY: 're_test_key', MAIL_FROM: 'SmartNest <noreply@example.com>' })
    try {
      expect((await mailed.http.get('/api/health')).body.features).toEqual({ passwordResetEmail: true })
    } finally {
      await mailed.pool.end()
    }
  })

  it('unknown API routes return JSON 404', async () => {
    const res = await ctx.http.get('/api/nope')
    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })

  it('malformed JSON is a 400, not a 500', async () => {
    const res = await ctx.http.post('/api/auth/login').set('Content-Type', 'application/json').send('{"email":')
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('INVALID_JSON')
  })

  it('answers CORS only for configured origins', async () => {
    const allowed = await ctx.http.get('/api/health').set('Origin', 'https://smartnest.example')
    expect(allowed.headers['access-control-allow-origin']).toBe('https://smartnest.example')
    const denied = await ctx.http.get('/api/health').set('Origin', 'https://evil.example')
    expect(denied.headers['access-control-allow-origin']).toBeUndefined()
    const preflight = await ctx.http
      .options('/api/auth/login')
      .set('Origin', 'https://smartnest.example')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'authorization,content-type')
    expect(preflight.status).toBe(204)
    expect(preflight.headers['access-control-allow-headers']).toMatch(/authorization/i)
  })

  it('migrations are idempotent', async () => {
    expect(await runMigrations(ctx.pool, () => {})).toEqual([])
  })

  it('throttles repeated failed logins for one account', async () => {
    const limited = await setup({ RATE_LIMITS: 'on' })
    try {
      await signUp(limited.http)
      let last = 0
      for (let i = 0; i < 12; i++) {
        last = (await limited.http.post('/api/auth/login').send({ email: 'asha@example.com', password: 'WrongPass123' })).status
      }
      expect(last).toBe(429)
    } finally {
      await limited.pool.end()
    }
  })
})
