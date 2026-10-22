import { Router } from 'express'
import type { Config } from '../config.js'
import type { Pool } from '../db/pool.js'

const startedAt = Date.now()

/**
 * Public liveness + dependency check. The frontend's /status page and Render's health check
 * both call this, so "ok" must mean the database actually answered.
 */
export function healthRouter(pool: Pool, config: Pick<Config, 'RESEND_API_KEY' | 'MAIL_FROM'>): Router {
  const router = Router()
  router.get('/health', async (_req, res) => {
    let db: 'ok' | 'error' = 'ok'
    try {
      await pool.query('select 1')
    } catch {
      db = 'error'
    }
    res.status(db === 'ok' ? 200 : 503).json({
      status: db === 'ok' ? 'ok' : 'degraded',
      db,
      service: 'smartnest-api',
      uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
      time: new Date().toISOString(),
      // Lets the UI say plainly whether a password-reset email can really be delivered.
      features: { passwordResetEmail: Boolean(config.RESEND_API_KEY && config.MAIL_FROM) },
    })
  })
  return router
}
