import type { RequestHandler } from 'express'
import type { Pool } from '../db/pool.js'
import { forbidden, unauthorized } from '../lib/errors.js'
import { hashToken } from './tokens.js'

export type Role = 'customer' | 'admin'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: Role
  createdAt: string
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser
      sessionId?: string
    }
  }
}

interface SessionRow {
  session_id: string
  last_used_at: Date
  id: string
  email: string
  name: string
  role: Role
  created_at: Date
}

/**
 * Resolves `Authorization: Bearer <token>` to req.user. No header means anonymous (public routes
 * still work); a header that does not match a live session is a hard 401, so a stale token is
 * noticed immediately instead of silently behaving like a logged-out visitor.
 */
export function authenticate(pool: Pool): RequestHandler {
  return async (req, _res, next) => {
    const header = req.get('authorization')
    if (!header) return next()
    const match = /^Bearer\s+(\S+)$/i.exec(header)
    if (!match?.[1]) throw unauthorized('Malformed Authorization header.', 'INVALID_TOKEN')

    const { rows } = await pool.query<SessionRow>(
      `select s.id as session_id, s.last_used_at, u.id, u.email, u.name, u.role, u.created_at
         from sessions s join users u on u.id = s.user_id
        where s.token_hash = $1 and s.expires_at > now()`,
      [hashToken(match[1])],
    )
    const row = rows[0]
    if (!row) throw unauthorized('Your session has expired. Please sign in again.', 'SESSION_EXPIRED')

    // Sliding "last seen", written at most hourly so reads do not become writes.
    if (Date.now() - row.last_used_at.getTime() > 3_600_000) {
      void pool.query('update sessions set last_used_at = now() where id = $1', [row.session_id]).catch(() => {})
    }
    req.sessionId = row.session_id
    req.user = { id: row.id, email: row.email, name: row.name, role: row.role, createdAt: row.created_at.toISOString() }
    next()
  }
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  if (!req.user) throw unauthorized()
  next()
}

/** Authorisation lives here, in code the server runs, never in anything the client can edit. */
export const requireRole =
  (role: Role): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) throw unauthorized()
    if (req.user.role !== role) throw forbidden()
    next()
  }
