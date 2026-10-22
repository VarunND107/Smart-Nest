import type { Request, RequestHandler } from 'express'
import { ipKeyGenerator, rateLimit } from 'express-rate-limit'
import type { Config } from '../config.js'

const noop: RequestHandler = (_req, _res, next) => next()

function limiter(opts: { windowMs: number; limit: number; keyByEmail?: boolean; skipSuccess?: boolean }): RequestHandler {
  return rateLimit({
    windowMs: opts.windowMs,
    limit: opts.limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skipSuccessfulRequests: opts.skipSuccess ?? false,
    keyGenerator: (req: Request) => {
      const ip = ipKeyGenerator(req.ip ?? '')
      const email = opts.keyByEmail && typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
      return email ? `${ip}|${email}` : ip
    },
    handler: (_req, res) => {
      res.status(429).json({
        error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please wait a few minutes and try again.' },
      })
    },
  })
}

/** Throttles brute force without locking real users out of the whole site. */
export function createRateLimits(config: Pick<Config, 'RATE_LIMITS'>) {
  if (config.RATE_LIMITS === 'off') {
    return { global: noop, login: noop, signup: noop, forgot: noop, reset: noop }
  }
  return {
    global: limiter({ windowMs: 60_000, limit: 300 }),
    login: limiter({ windowMs: 15 * 60_000, limit: 10, keyByEmail: true, skipSuccess: true }),
    // Generous on purpose: a campus or demo room shares one public IP.
    signup: limiter({ windowMs: 60 * 60_000, limit: 60 }),
    forgot: limiter({ windowMs: 60 * 60_000, limit: 5 }),
    reset: limiter({ windowMs: 15 * 60_000, limit: 10 }),
  }
}

export type RateLimits = ReturnType<typeof createRateLimits>
