import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import type { Pool } from './pool.js'

// src/db/ and dist/db/ are both two levels below server/, so this resolves to server/migrations.
const MIGRATIONS_DIR = fileURLToPath(new URL('../../migrations/', import.meta.url))

// Arbitrary constant so concurrent boots (e.g. a rolling deploy) serialise on the same lock.
const LOCK_KEY = 7_340_001

/**
 * Applies every migrations/*.sql file that has not run yet, in filename order, each in its own
 * transaction. Safe to call on every boot. Returns the names applied this time.
 */
export async function runMigrations(pool: Pool, log: (msg: string) => void = console.log): Promise<string[]> {
  const client = await pool.connect()
  const applied: string[] = []
  try {
    await client.query('select pg_advisory_lock($1)', [LOCK_KEY])
    await client.query(`
      create table if not exists schema_migrations (
        name text primary key,
        applied_at timestamptz not null default now()
      )`)
    const done = new Set(
      (await client.query<{ name: string }>('select name from schema_migrations')).rows.map((r) => r.name),
    )
    const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort()
    for (const file of files) {
      if (done.has(file)) continue
      const sql = await readFile(MIGRATIONS_DIR + file, 'utf8')
      try {
        await client.query('begin')
        await client.query(sql)
        await client.query('insert into schema_migrations (name) values ($1)', [file])
        await client.query('commit')
      } catch (err) {
        await client.query('rollback').catch(() => {})
        throw new Error(`Migration ${file} failed: ${(err as Error).message}`)
      }
      applied.push(file)
      log(`[migrate] applied ${file}`)
    }
  } finally {
    await client.query('select pg_advisory_unlock($1)', [LOCK_KEY]).catch(() => {})
    client.release()
  }
  return applied
}
