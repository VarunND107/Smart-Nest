import type { Config } from '../config.js'
import type { Queryable } from '../db/pool.js'
import { generateToken, hashToken } from './tokens.js'

export async function createSession(
  db: Queryable,
  userId: string,
  userAgent: string | undefined,
  config: Pick<Config, 'SESSION_TTL_DAYS'>,
): Promise<{ token: string; expiresAt: string }> {
  const token = generateToken()
  const { rows } = await db.query<{ expires_at: Date }>(
    `insert into sessions (user_id, token_hash, user_agent, expires_at)
     values ($1, $2, $3, now() + make_interval(days => $4))
     returning expires_at`,
    [userId, hashToken(token), userAgent?.slice(0, 300) ?? null, config.SESSION_TTL_DAYS],
  )
  return { token, expiresAt: rows[0]!.expires_at.toISOString() }
}

export async function deleteExpiredSessions(db: Queryable): Promise<number> {
  const res = await db.query('delete from sessions where expires_at < now()')
  await db.query('delete from password_reset_tokens where expires_at < now() - interval \'1 day\'')
  return res.rowCount ?? 0
}
