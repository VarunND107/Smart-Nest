import pg from 'pg'
import type { Config } from '../config.js'

export type Pool = pg.Pool
export type Queryable = Pick<pg.Pool, 'query'>

// Postgres returns timestamptz as JS Dates and numeric/bigint as strings; keep the defaults,
// but make sure `date` columns (purchase/warranty dates) stay as plain YYYY-MM-DD strings.
pg.types.setTypeParser(1082, (v) => v)

function sslFor(config: Config): pg.PoolConfig['ssl'] {
  let mode = config.DATABASE_SSL
  if (!mode) {
    let host = ''
    try {
      host = new URL(config.DATABASE_URL).hostname
    } catch {
      /* invalid URL is reported by pg on connect */
    }
    mode = host.endsWith('.render.com') ? 'no-verify' : 'off'
  }
  if (mode === 'off') return undefined
  return mode === 'require' ? true : { rejectUnauthorized: false }
}

export function createPool(config: Config): Pool {
  const pool = new pg.Pool({
    connectionString: config.DATABASE_URL,
    ssl: sslFor(config),
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    statement_timeout: 15_000,
  })
  pool.on('error', (err) => {
    // Idle-client errors (e.g. the database restarted) must not crash the process.
    console.error('[db] idle client error:', err.message)
  })
  return pool
}

/** Run `fn` inside a transaction; rolls back on throw. */
export async function withTransaction<T>(pool: Pool, fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('begin')
    const result = await fn(client)
    await client.query('commit')
    return result
  } catch (err) {
    await client.query('rollback').catch(() => {})
    throw err
  } finally {
    client.release()
  }
}
