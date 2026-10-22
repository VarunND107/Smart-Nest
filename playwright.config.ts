import { defineConfig } from '@playwright/test'

/**
 * Two ways to run:
 *   npm run e2e         -> builds against a local API, serves dist with vercel.json's headers, runs the
 *                          local backend, and tests all three together.
 *   E2E_BASE_URL=https://<your-vercel-url> npm run e2e   -> tests the live deployment instead.
 */
const live = process.env.E2E_BASE_URL
const apiOrigin = process.env.E2E_API_ORIGIN ?? 'http://localhost:4000'

export default defineConfig({
  testDir: 'e2e',
  testMatch: '**/*.spec.ts',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  workers: 1,
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: live ?? 'http://localhost:4173',
    trace: 'retain-on-failure',
    // CHROMIUM_PATH lets sandboxes with a pre-installed browser skip Playwright's own download.
    launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
  },
  // Tags: @responsive runs at every size; @phone only where the mobile menu exists.
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } }, grepInvert: /@phone/ },
    { name: 'tablet', use: { viewport: { width: 820, height: 1180 } }, grep: /@responsive/ },
    { name: 'mobile', use: { viewport: { width: 375, height: 740 } }, grep: /@responsive|@phone/ },
  ],
  webServer: live
    ? undefined
    : [
        {
          command: 'node e2e/serve-dist.mjs',
          url: 'http://localhost:4173',
          reuseExistingServer: true,
          env: { E2E_API_ORIGIN: apiOrigin },
        },
        {
          command: 'npm --prefix server run start',
          url: `${apiOrigin}/api/health`,
          reuseExistingServer: true,
          env: {
            NODE_ENV: 'test',
            PORT: '4000',
            DATABASE_URL: process.env.E2E_DATABASE_URL ?? 'postgres://smartnest:smartnest@localhost:5432/smartnest_dev',
            CORS_ORIGINS: 'http://localhost:4173',
            APP_URL: 'http://localhost:4173',
            RATE_LIMITS: 'off',
            BOOTSTRAP_ADMIN_EMAIL: 'admin@smartnest.test',
            BOOTSTRAP_ADMIN_PASSWORD: 'Local-Admin-Pass-1',
          },
        },
      ],
})
