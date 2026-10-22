import { Router } from 'express'
import { z } from 'zod'
import { burnPasswordCheck, hashPassword, verifyPassword } from '../auth/password.js'
import { requireAuth } from '../auth/middleware.js'
import type { AuthUser, Role } from '../auth/middleware.js'
import { createSession } from '../auth/sessions.js'
import { generateToken, hashToken } from '../auth/tokens.js'
import type { Config } from '../config.js'
import { withTransaction } from '../db/pool.js'
import type { Pool } from '../db/pool.js'
import { badRequest, conflict, parse, unauthorized } from '../lib/errors.js'
import type { Mailer } from '../lib/mailer.js'
import type { RateLimits } from '../lib/rateLimits.js'

const email = z
  .string('Enter your email address')
  .trim()
  .toLowerCase()
  .max(254, 'That email address is too long')
  .pipe(z.email('Enter a valid email address'))

const password = z
  .string('Enter a password')
  .min(8, 'Use at least 8 characters')
  .max(128, 'Use at most 128 characters')
  .regex(/[A-Za-z]/, 'Include at least one letter')
  .regex(/[0-9]/, 'Include at least one number')

// zod strips unknown keys, so a client sending {"role":"admin"} gets no special treatment:
// nothing here, or anywhere else in the API, writes users.role.
const signupSchema = z.object({
  name: z.string('Enter your name').trim().min(1, 'Enter your name').max(100, 'Use at most 100 characters'),
  email,
  password,
})
const loginSchema = z.object({
  email,
  password: z.string('Enter your password').min(1, 'Enter your password').max(128),
})
const forgotSchema = z.object({ email })
const resetSchema = z.object({
  token: z.string('Missing reset token').min(20, 'Invalid reset link').max(200, 'Invalid reset link'),
  password,
})

interface UserRow {
  id: string
  email: string
  name: string
  role: Role
  created_at: Date
  password_hash: string
}

const toAuthUser = (r: UserRow): AuthUser => ({
  id: r.id,
  email: r.email,
  name: r.name,
  role: r.role,
  createdAt: r.created_at.toISOString(),
})

export function authRouter(deps: { pool: Pool; config: Config; mailer: Mailer; limits: RateLimits }): Router {
  const { pool, config, mailer, limits } = deps
  const router = Router()

  router.post('/signup', limits.signup, async (req, res) => {
    const body = parse(signupSchema, req.body)
    const hash = await hashPassword(body.password)
    let user: UserRow
    try {
      const { rows } = await pool.query<UserRow>(
        `insert into users (email, name, password_hash) values ($1, $2, $3)
         returning id, email, name, role, created_at, password_hash`,
        [body.email, body.name, hash],
      )
      user = rows[0]!
    } catch (err) {
      if ((err as { code?: string }).code === '23505') {
        throw conflict('EMAIL_TAKEN', 'An account with this email already exists.', {
          email: 'An account with this email already exists',
        })
      }
      throw err
    }
    const session = await createSession(pool, user.id, req.get('user-agent'), config)
    res.status(201).json({ ...session, user: toAuthUser(user) })
  })

  router.post('/login', limits.login, async (req, res) => {
    const body = parse(loginSchema, req.body)
    const { rows } = await pool.query<UserRow>(
      'select id, email, name, role, created_at, password_hash from users where email = $1',
      [body.email],
    )
    const user = rows[0]
    // Same error and same work whether the email exists or the password is wrong.
    if (!user) {
      await burnPasswordCheck(body.password)
      throw unauthorized('Incorrect email or password.', 'INVALID_CREDENTIALS')
    }
    if (!(await verifyPassword(body.password, user.password_hash))) {
      throw unauthorized('Incorrect email or password.', 'INVALID_CREDENTIALS')
    }
    await pool.query('update users set last_login_at = now() where id = $1', [user.id])
    const session = await createSession(pool, user.id, req.get('user-agent'), config)
    res.json({ ...session, user: toAuthUser(user) })
  })

  router.post('/logout', requireAuth, async (req, res) => {
    await pool.query('delete from sessions where id = $1', [req.sessionId])
    res.status(204).end()
  })

  router.get('/me', requireAuth, (req, res) => {
    res.json({ user: req.user })
  })

  router.post('/forgot-password', limits.forgot, async (req, res) => {
    const { email: address } = parse(forgotSchema, req.body)
    const { rows } = await pool.query<{ id: string }>('select id from users where email = $1', [address])
    const user = rows[0]
    if (user) {
      const token = generateToken()
      await withTransaction(pool, async (c) => {
        await c.query('update password_reset_tokens set used_at = now() where user_id = $1 and used_at is null', [user.id])
        await c.query(
          `insert into password_reset_tokens (user_id, token_hash, expires_at)
           values ($1, $2, now() + make_interval(mins => $3))`,
          [user.id, hashToken(token), config.RESET_TOKEN_TTL_MINUTES],
        )
      })
      const link = `${config.APP_URL.replace(/\/+$/, '')}/reset-password?token=${token}`
      // Not awaited: response time must not reveal whether the account exists.
      void mailer.sendPasswordReset(address, link).catch((err: Error) => console.error('[mail] send failed:', err.message))
    }
    // Identical response either way, so this endpoint cannot be used to discover accounts.
    res.json({ message: 'If an account exists for that email, a reset link is on its way.' })
  })

  router.post('/reset-password', limits.reset, async (req, res) => {
    const body = parse(resetSchema, req.body)
    const newHash = await hashPassword(body.password)
    const ok = await withTransaction(pool, async (c) => {
      const { rows } = await c.query<{ id: string; user_id: string }>(
        `select id, user_id from password_reset_tokens
          where token_hash = $1 and used_at is null and expires_at > now()
            for update`,
        [hashToken(body.token)],
      )
      const row = rows[0]
      if (!row) return false
      await c.query('update password_reset_tokens set used_at = now() where id = $1', [row.id])
      await c.query('update users set password_hash = $1 where id = $2', [newHash, row.user_id])
      // A reset means the old password may be compromised: sign out everywhere.
      await c.query('delete from sessions where user_id = $1', [row.user_id])
      return true
    })
    if (!ok) throw badRequest('INVALID_RESET_TOKEN', 'This reset link is invalid or has expired. Request a new one.')
    res.json({ message: 'Password updated. Please sign in with your new password.' })
  })

  return router
}
