import cors from 'cors'
import express from 'express'
import type { ErrorRequestHandler } from 'express'
import helmet from 'helmet'
import { authenticate } from './auth/middleware.js'
import type { Config } from './config.js'
import type { Pool } from './db/pool.js'
import { HttpError } from './lib/errors.js'
import type { Mailer } from './lib/mailer.js'
import { createRateLimits } from './lib/rateLimits.js'
import { authRouter } from './routes/auth.js'
import { healthRouter } from './routes/health.js'

export function createApp(deps: { config: Config; pool: Pool; mailer: Mailer }) {
  const { config, pool, mailer } = deps
  const limits = createRateLimits(config)
  const app = express()

  app.disable('x-powered-by')
  app.set('trust proxy', 1) // Render terminates TLS in front of the service; needed for real client IPs

  app.use(helmet())
  const allowed = new Set(config.corsOrigins)
  app.use(
    cors({
      // Browsers only: requests with no Origin (curl, server-to-server) are not CORS-checked.
      origin: (origin, cb) => cb(null, !origin || allowed.has(origin)),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Authorization', 'Content-Type'],
      maxAge: 600,
    }),
  )
  app.use(express.json({ limit: '100kb' }))

  const api = express.Router()
  api.use(limits.global)
  api.use(healthRouter(pool, config))
  api.use(authenticate(pool))
  api.use('/auth', authRouter({ pool, config, mailer, limits }))
  api.use((_req, _res, next) => next(new HttpError(404, 'NOT_FOUND', 'No such endpoint.')))
  app.use('/api', api)

  app.get('/', (_req, res) => {
    res.json({ service: 'smartnest-api', docs: 'See /api/health' })
  })

  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof HttpError) {
      res.status(err.status).json({ error: { code: err.code, message: err.message, fields: err.fields } })
      return
    }
    const type = (err as { type?: string }).type
    if (type === 'entity.too.large') {
      res.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'That request is too large.' } })
      return
    }
    if (type === 'entity.parse.failed') {
      res.status(400).json({ error: { code: 'INVALID_JSON', message: 'The request body is not valid JSON.' } })
      return
    }
    console.error('[error]', err)
    res.status(500).json({ error: { code: 'INTERNAL', message: 'Something went wrong on our side. Please try again.' } })
  }
  app.use(onError)

  return app
}
