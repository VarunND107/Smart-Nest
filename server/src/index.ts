import 'dotenv/config'
import { createApp } from './app.js'
import { deleteExpiredSessions } from './auth/sessions.js'
import { bootstrapAdmin } from './bootstrap.js'
import { loadConfig } from './config.js'
import { runMigrations } from './db/migrate.js'
import { createPool } from './db/pool.js'
import { createMailer } from './lib/mailer.js'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function main() {
  const config = loadConfig()
  const pool = createPool(config)

  // A freshly provisioned or waking database can refuse connections for a few seconds.
  for (let attempt = 1; ; attempt++) {
    try {
      await runMigrations(pool)
      break
    } catch (err) {
      if (attempt >= 6) throw err
      console.warn(`[boot] database not ready (attempt ${attempt}): ${(err as Error).message}`)
      await sleep(attempt * 2000)
    }
  }
  await bootstrapAdmin(pool, config)

  const app = createApp({ config, pool, mailer: createMailer(config) })
  // Render injects PORT and requires binding 0.0.0.0.
  const server = app.listen(config.PORT, '0.0.0.0', () => {
    console.log(`[boot] SmartNest API listening on :${config.PORT} (${config.NODE_ENV})`)
  })

  const cleanup = setInterval(() => {
    deleteExpiredSessions(pool).catch((err: Error) => console.error('[cleanup]', err.message))
  }, 3_600_000)
  cleanup.unref()

  const shutdown = (signal: string) => {
    console.log(`[boot] ${signal} received, shutting down`)
    clearInterval(cleanup)
    server.close(() => void pool.end().finally(() => process.exit(0)))
    setTimeout(() => process.exit(1), 10_000).unref()
  }
  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

main().catch((err) => {
  console.error('[boot] fatal:', err instanceof Error ? err.message : err)
  process.exit(1)
})
