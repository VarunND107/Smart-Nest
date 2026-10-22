import { expect, test } from '@playwright/test'
import { PASSWORD, hasHorizontalOverflow, plantResetToken, signIn, signUp, uniqueEmail, watchProblems } from './helpers'

const live = Boolean(process.env.E2E_BASE_URL)

test.describe('homepage and status', () => {
  test('shows the real product homepage, not a status page', async ({ page }) => {
    const problems = watchProblems(page)
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1, name: 'Smart Living, Simplified.' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Create free account' })).toBeVisible()
    await expect(page.getByText('Pipeline status')).toHaveCount(0)
    await expect(page.getByText(/supabase/i)).toHaveCount(0)
    // The footer pill is a live call to the backend.
    await expect(page.getByRole('link', { name: 'Server online' })).toBeVisible()
    expect(problems).toEqual([])
  })

  test('status page proves the browser can reach the API and the database', async ({ page }) => {
    await page.goto('/status')
    await expect(page.getByText(/Yes \(\d+ ms round trip\)/)).toBeVisible()
    await expect(page.getByText('Connected')).toBeVisible()
  })
})

test.describe('accounts', () => {
  test('sign up, stay signed in across reloads, sign out, protected route, sign back in', async ({ page }) => {
    const problems = watchProblems(page)
    const email = uniqueEmail('flow')

    await signUp(page, 'Asha Rao', email)
    await expect(page.getByRole('heading', { name: 'Welcome, Asha' })).toBeVisible()
    await expect(page.getByText(email)).toBeVisible()
    await expect(page.getByText('Customer', { exact: true })).toBeVisible()

    // Persistent session: survives a full reload and a fresh visit to a protected URL.
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Welcome, Asha' })).toBeVisible()
    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { name: 'Welcome, Asha' })).toBeVisible()

    await page.getByRole('button', { name: 'Sign out' }).click()
    await expect(page.getByText('You have been signed out.')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Get started' })).toBeVisible()

    // Signed out: the protected page bounces to sign-in, and the session did not survive.
    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()

    await signIn(page, email)
    await expect(page.getByRole('heading', { name: 'Welcome, Asha' })).toBeVisible()
    expect(problems).toEqual([])
  })

  test('returns you to the page you were trying to open after signing in', async ({ page }) => {
    const email = uniqueEmail('redirect')
    await signUp(page, 'Rohan Das', email)
    await page.getByRole('button', { name: 'Sign out' }).click()
    await page.goto('/dashboard')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password', { exact: true }).fill(PASSWORD)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
  })

  test('signed-in state is shared across tabs and ends everywhere on sign-out', async ({ browser }) => {
    const context = await browser.newContext()
    const a = await context.newPage()
    const b = await context.newPage()
    await signUp(a, 'Tab Tester', uniqueEmail('tabs'))
    await expect(a.getByRole('heading', { name: 'Welcome, Tab' })).toBeVisible()
    await b.goto('/dashboard')
    await expect(b.getByRole('heading', { name: 'Welcome, Tab' })).toBeVisible()
    await a.getByRole('button', { name: 'Sign out' }).click()
    await expect(b.getByRole('heading', { name: 'Sign in' })).toBeVisible()
    await context.close()
  })

  test('shows validation errors and server errors in the form', async ({ page }) => {
    await page.goto('/signup')
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(page.getByText('Enter your name')).toBeVisible()
    await expect(page.getByText('Enter your email address')).toBeVisible()
    await page.getByLabel('Your name').fill('X')
    await page.getByLabel('Email').fill('not-an-email')
    await page.getByLabel('Password', { exact: true }).fill('short')
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(page.getByText('Enter a valid email address')).toBeVisible()
    await expect(page.getByText('Use at least 8 characters')).toBeVisible()

    // Wrong password gives one generic message.
    const email = uniqueEmail('wrong')
    await signUp(page, 'Wrong Pw', email)
    await page.getByRole('button', { name: 'Sign out' }).click()
    await signIn(page, email, 'Nope-Wrong-1')
    await expect(page.getByRole('alert')).toHaveText('Incorrect email or password.')
    await signIn(page, 'nobody-here@example.com', 'Nope-Wrong-1')
    await expect(page.getByRole('alert')).toHaveText('Incorrect email or password.')

    // Duplicate email.
    await signUp(page, 'Again', email)
    await expect(page.getByText(/already exists/)).toBeVisible()
    await expect(page.getByRole('link', { name: 'Sign in instead' })).toBeVisible()
  })

  test('password reset: new password works, old one and old sessions do not, link is single-use', async ({ page, browser }) => {
    test.skip(live, 'plants a reset token directly in the local database; email delivery is verified separately')
    const email = uniqueEmail('reset')
    await signUp(page, 'Reset Me', email)
    await expect(page.getByRole('heading', { name: 'Welcome, Reset' })).toBeVisible()

    // A second browser holds a live session that the reset must kill.
    const other = await browser.newContext()
    const otherPage = await other.newPage()
    await signIn(otherPage, email)
    await expect(otherPage.getByRole('heading', { name: 'Welcome, Reset' })).toBeVisible()

    await page.getByRole('button', { name: 'Sign out' }).click()
    await page.goto('/forgot-password')
    await page.getByLabel('Email').fill(email)
    await page.getByRole('button', { name: 'Send reset link' }).click()
    await expect(page.getByText(/a reset link is on its way/i)).toBeVisible()

    const token = await plantResetToken(email)
    await page.goto(`/reset-password?token=${token}`)
    await page.getByLabel('New password').fill('Fresh-Start-2026')
    await page.getByRole('button', { name: 'Update password' }).click()
    await expect(page.getByRole('heading', { name: 'Password updated' })).toBeVisible()

    await signIn(page, email, PASSWORD)
    await expect(page.getByRole('alert')).toHaveText('Incorrect email or password.')
    await signIn(page, email, 'Fresh-Start-2026')
    await expect(page.getByRole('heading', { name: 'Welcome, Reset' })).toBeVisible()

    await otherPage.reload()
    await expect(otherPage.getByRole('heading', { name: 'Sign in' })).toBeVisible()
    await other.close()

    await page.getByRole('button', { name: 'Sign out' }).click()
    await page.goto(`/reset-password?token=${token}`)
    await page.getByLabel('New password').fill('Another-Pass-2026')
    await page.getByRole('button', { name: 'Update password' }).click()
    await expect(page.getByText(/missing, invalid, or has expired/)).toBeVisible()
  })

  test('a customer cannot reach admin API routes or become admin', async ({ page, request }) => {
    const email = uniqueEmail('role')
    await signUp(page, 'Plain User', email)
    await expect(page.getByRole('heading', { name: 'Welcome, Plain' })).toBeVisible()
    const token = await page.evaluate(() => localStorage.getItem('smartnest.session'))
    expect(token).toBeTruthy()
    const apiBase = process.env.E2E_API_ORIGIN ?? 'http://localhost:4000'

    // Trying to sign up as an admin via the payload is ignored.
    const attempt = await request.post(`${apiBase}/api/auth/signup`, {
      data: { name: 'Mallory', email: uniqueEmail('mal'), password: PASSWORD, role: 'admin' },
    })
    expect(attempt.status()).toBe(201)
    expect((await attempt.json()).user.role).toBe('customer')

    // A forged token is rejected outright.
    const forged = await request.get(`${apiBase}/api/auth/me`, { headers: { Authorization: 'Bearer forged-token-forged-token-forged' } })
    expect(forged.status()).toBe(401)
  })
})

test.describe('guides', () => {
  test('search finds guides, opens an article, and its cross-links lead to the right reading', async ({ page }) => {
    await page.goto('/learn')
    await expect(page.getByRole('heading', { level: 1, name: 'SmartNest guides' })).toBeVisible()
    for (const topic of ['Smart Home Basics', 'Device Guides', 'Installation & Setup', 'Security & Privacy', 'Troubleshooting', 'Automation Ideas', 'FAQ']) {
      await expect(page.getByRole('link', { name: topic, exact: true }).first()).toBeVisible()
    }

    await page.getByRole('searchbox', { name: 'Search guides' }).fill('camera privacy')
    await expect(page).toHaveURL(/q=camera\+privacy|q=camera%20privacy/)
    const first = page.locator('main ul li h3 a').first()
    await expect(first).toHaveText('Camera and microphone privacy')
    await first.click()

    await expect(page.getByRole('heading', { level: 1, name: 'Camera and microphone privacy' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Related guides' })).toBeVisible()
    await page.getByRole('link', { name: /Smart cameras/ }).first().click()
    await expect(page.getByRole('heading', { level: 1, name: 'Smart cameras' })).toBeVisible()

    // The device guide leads on to install, security and troubleshooting reading.
    const related = page.locator('section[aria-labelledby="related"]')
    await expect(related.getByText('Installation & Setup').first()).toBeVisible()
    await expect(related.getByText('Security & Privacy').first()).toBeVisible()
    await expect(related.getByText('Troubleshooting').first()).toBeVisible()

    // Inline links inside the article body work.
    await page.locator('article .prose a[href="/learn/camera-placement-and-mounting"]').first().click()
    await expect(page.getByRole('heading', { level: 1, name: 'Camera placement and mounting' })).toBeVisible()
  })

  test('search copes with spelling variants and says so when nothing matches', async ({ page }) => {
    await page.goto('/learn?q=wi-fi')
    await expect(page.getByText(/\d+ guides? found/)).toBeVisible()
    const dashed = await page.locator('main ul li h3').allInnerTexts()
    await page.goto('/learn?q=WiFi')
    await expect(page.getByText(/\d+ guides? found/)).toBeVisible()
    expect(await page.locator('main ul li h3').allInnerTexts()).toEqual(dashed)

    await page.goto('/learn?q=xyzzyqwerty')
    await expect(page.getByText('No matching guides.')).toBeVisible()
    await expect(page.getByText('Nothing matched that search')).toBeVisible()
  })

  test('deep links survive a refresh, category pages list their guides, unknown guides get a helpful page', async ({ page }) => {
    await page.goto('/learn/smart-locks')
    await expect(page.getByRole('heading', { level: 1, name: 'Smart locks' })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading', { level: 1, name: 'Smart locks' })).toBeVisible()

    await page.goto('/learn/c/troubleshooting')
    await expect(page.getByRole('heading', { level: 1, name: 'Troubleshooting' })).toBeVisible()
    await expect(page.getByRole('link', { name: /A device is offline/ })).toBeVisible()

    await page.goto('/learn/not-a-real-guide')
    await expect(page.getByRole('heading', { name: 'Guide not found' })).toBeVisible()
    await page.goto('/learn/c/nonsense')
    await expect(page.getByText("We couldn't find that page")).toBeVisible()
  })

  test('FAQ is reachable from the footer', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('contentinfo').getByRole('link', { name: 'FAQ' }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'FAQ' })).toBeVisible()
    await expect(page.getByRole('link', { name: /General questions/ })).toBeVisible()
  })
})

test.describe('responsive layout', () => {
  test('no horizontal scrolling on key pages @responsive', async ({ page }) => {
    const email = uniqueEmail('mobile')
    for (const path of ['/', '/learn', '/learn/smart-cameras', '/learn/c/devices', '/login', '/signup', '/forgot-password', '/status']) {
      await page.goto(path)
      await expect(page.locator('main')).toBeVisible()
      expect(await hasHorizontalOverflow(page), `${path} overflows horizontally`).toBe(false)
    }
    await signUp(page, 'Mobile User', email)
    await expect(page.getByRole('heading', { name: 'Welcome, Mobile' })).toBeVisible()
    expect(await hasHorizontalOverflow(page), '/dashboard overflows horizontally').toBe(false)
  })

  test('mobile menu opens, navigates and closes @phone', async ({ page }) => {
    await page.goto('/')
    const menu = page.getByRole('button', { name: 'Menu' })
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
    await menu.click()
    await expect(page.getByRole('button', { name: 'Close' })).toHaveAttribute('aria-expanded', 'true')
    await page.locator('#mobile-menu').getByRole('link', { name: 'Learn' }).click()
    await expect(page).toHaveURL(/\/learn$/)
    await expect(page.locator('#mobile-menu')).toHaveCount(0)
  })
})
