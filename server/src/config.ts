import { z } from 'zod'

const bool = z.enum(['true', 'false', '1', '0', 'on', 'off']).transform((v) => v === 'true' || v === '1' || v === 'on')

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  /** Postgres connection string. On Render, use the database's *Internal* URL. */
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  /** off | require | no-verify. Default: no-verify for external *.render.com hosts, off otherwise. */
  DATABASE_SSL: z.enum(['off', 'require', 'no-verify']).optional(),

  /** Comma-separated list of browser origins allowed to call the API (your Vercel URL). */
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  /** Public URL of the frontend; used to build password-reset links. */
  APP_URL: z.string().url().default('http://localhost:5173'),

  SESSION_TTL_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  RESET_TOKEN_TTL_MINUTES: z.coerce.number().int().min(5).max(1440).default(60),

  /** Set to "off" to disable rate limiting (tests only). */
  RATE_LIMITS: z.enum(['on', 'off']).default('on'),

  /** Optional transactional email via Resend's HTTP API (Render's free tier blocks SMTP). */
  RESEND_API_KEY: z.string().optional(),
  MAIL_FROM: z.string().optional(),
  /** Log password-reset links instead of emailing them. Default: on outside production. */
  MAIL_LOG_LINKS: bool.optional(),

  /** Creates the first admin on boot if that email does not exist yet. Never promotes existing users. */
  BOOTSTRAP_ADMIN_EMAIL: z.string().email().optional(),
  BOOTSTRAP_ADMIN_PASSWORD: z.string().min(10, 'BOOTSTRAP_ADMIN_PASSWORD must be at least 10 characters').optional(),
  BOOTSTRAP_ADMIN_NAME: z.string().min(1).max(100).default('SmartNest Admin'),
})

export type Config = Omit<z.infer<typeof schema>, 'CORS_ORIGINS'> & {
  corsOrigins: string[]
  isProduction: boolean
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = schema.safeParse(env)
  if (!parsed.success) {
    const lines = parsed.error.issues.map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
    throw new Error(`Invalid environment configuration:\n${lines.join('\n')}`)
  }
  const { CORS_ORIGINS, ...rest } = parsed.data
  return {
    ...rest,
    corsOrigins: CORS_ORIGINS.split(',')
      .map((o) => o.trim().replace(/\/+$/, ''))
      .filter(Boolean),
    isProduction: rest.NODE_ENV === 'production',
  }
}
