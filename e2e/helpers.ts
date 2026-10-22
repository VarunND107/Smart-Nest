import type { Page } from '@playwright/test'
import { createHash, randomBytes } from 'node:crypto'
import pg from 'pg'

export const PASSWORD = 'Sup3rSecret99'
export const uniqueEmail = (tag = 'user') => `e2e-${tag}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`

/** Records anything the browser would call a security or script problem. Assert it is empty. */
export function watchProblems(page: Page): string[] {
  const problems: string[] = []
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    const text = m.text()
    if (m.type() === 'error' && /content security policy|refused to|cors|blocked/i.test(text)) problems.push(`console: ${text}`)
  })
  return problems
}

export async function signUp(page: Page, name: string, email: string, password = PASSWORD) {
  await page.goto('/signup')
  await page.getByLabel('Your name').fill(name)
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Create account' }).click()
}

export async function signIn(page: Page, email: string, password = PASSWORD) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
}

export async function hasHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
}

/**
 * Local runs only: plants a known reset token for an existing user, standing in for the emailed link
 * (no mail provider is involved in local tests). Everything after that, the page and the API, is real.
 */
export async function plantResetToken(email: string): Promise<string> {
  const url = process.env.E2E_DATABASE_URL ?? 'postgres://smartnest:smartnest@localhost:5432/smartnest_dev'
  const client = new pg.Client({ connectionString: url })
  await client.connect()
  try {
    const token = randomBytes(32).toString('base64url')
    const hash = createHash('sha256').update(token).digest('hex')
    const { rowCount } = await client.query(
      `insert into password_reset_tokens (user_id, token_hash, expires_at)
       select id, $2, now() + interval '30 minutes' from users where email = $1`,
      [email, hash],
    )
    if (!rowCount) throw new Error(`no user ${email}`)
    return token
  } finally {
    await client.end()
  }
}
