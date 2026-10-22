import request from 'supertest'
import { createApp } from '../src/app.js'
import { loadConfig } from '../src/config.js'
import type { Config } from '../src/config.js'
import { runMigrations } from '../src/db/migrate.js'
import { createPool } from '../src/db/pool.js'
import type { Pool } from '../src/db/pool.js'
import type { Mailer } from '../src/lib/mailer.js'

export const TEST_DB_URL =
  process.env.TEST_DATABASE_URL ?? 'postgres://smartnest:smartnest@localhost:5432/smartnest_test'

export function testConfig(overrides: Record<string, string> = {}): Config {
  return loadConfig({
    NODE_ENV: 'test',
    DATABASE_URL: TEST_DB_URL,
    RATE_LIMITS: 'off',
    CORS_ORIGINS: 'http://localhost:5173,https://smartnest.example',
    APP_URL: 'https://smartnest.example',
    ...overrides,
  })
}

export interface SentMail {
  to: string
  link: string
}

export async function resetDb(pool: Pool): Promise<void> {
  const { rows } = await pool.query<{ tablename: string }>(
    `select tablename from pg_tables where schemaname = 'public' and tablename <> 'schema_migrations'`,
  )
  if (rows.length) {
    await pool.query(`truncate ${rows.map((r) => `"${r.tablename}"`).join(', ')} restart identity cascade`)
  }
}

export async function setup(overrides: Record<string, string> = {}) {
  const config = testConfig(overrides)
  const pool = createPool(config)
  await runMigrations(pool, () => {})
  await resetDb(pool)
  const sent: SentMail[] = []
  const mailer: Mailer = {
    async sendPasswordReset(to, link) {
      sent.push({ to, link })
    },
  }
  const app = createApp({ config, pool, mailer })
  return { config, pool, app, sent, mailer, http: request(app) }
}

export const strongPassword = 'Sup3rSecret99'

export async function signUp(
  http: ReturnType<typeof request>,
  overrides: Partial<{ name: string; email: string; password: string }> = {},
) {
  const res = await http
    .post('/api/auth/signup')
    .send({ name: 'Asha Rao', email: 'asha@example.com', password: strongPassword, ...overrides })
  return res
}

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` })
