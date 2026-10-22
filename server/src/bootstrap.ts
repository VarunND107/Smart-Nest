import type { Config } from './config.js'
import type { Pool } from './db/pool.js'
import { hashPassword } from './auth/password.js'

/**
 * The only way an admin account comes into existence besides manual SQL: the person who controls
 * the server's environment variables names one. It creates the account if the email is unused and
 * never promotes an existing account, because an existing account's password may be someone else's.
 * Remove BOOTSTRAP_ADMIN_PASSWORD from the environment once the admin has signed in.
 */
export async function bootstrapAdmin(pool: Pool, config: Config, log: (m: string) => void = console.log): Promise<void> {
  const { BOOTSTRAP_ADMIN_EMAIL: email, BOOTSTRAP_ADMIN_PASSWORD: pw, BOOTSTRAP_ADMIN_NAME: name } = config
  if (!email || !pw) return
  const address = email.trim().toLowerCase()
  const { rows } = await pool.query<{ role: string }>('select role from users where email = $1', [address])
  if (rows[0]) {
    log(
      rows[0].role === 'admin'
        ? `[bootstrap] admin ${address} already exists`
        : `[bootstrap] ${address} exists as a customer and was NOT promoted. Promote it with SQL: update users set role = 'admin' where email = '${address}';`,
    )
    return
  }
  await pool.query(`insert into users (email, name, password_hash, role) values ($1, $2, $3, 'admin')`, [
    address,
    name,
    await hashPassword(pw),
  ])
  log(`[bootstrap] created admin ${address}`)
}
