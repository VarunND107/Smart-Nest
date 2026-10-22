import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { RequireAuth } from '../components/guards'
import { getToken, setToken } from '../lib/session'
import { mockApi, renderAt, user } from './utils'

const health = { status: 'ok', db: 'ok', service: 'smartnest-api', uptimeSeconds: 5, time: 'now', features: { passwordResetEmail: false } }
const base = { 'GET /health': { body: health } }

beforeEach(() => {
  window.scrollTo = vi.fn()
})

describe('protected routes', () => {
  it('sends a signed-out visitor from /dashboard to the sign-in page', async () => {
    mockApi(base)
    renderAt(<App />, '/dashboard')
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('keeps a customer out of admin-only routes', async () => {
    setToken('tok')
    mockApi({ ...base, 'GET /auth/me': { body: { user } } })
    renderAt(
      <Routes>
        <Route element={<RequireAuth role="admin" />}>
          <Route path="/admin" element={<p>secret admin page</p>} />
        </Route>
      </Routes>,
      '/admin',
    )
    expect(await screen.findByText(/don't have access/i)).toBeInTheDocument()
    expect(screen.queryByText('secret admin page')).not.toBeInTheDocument()
  })

  it('lets an admin into admin-only routes', async () => {
    setToken('tok')
    mockApi({ ...base, 'GET /auth/me': { body: { user: { ...user, role: 'admin' } } } })
    renderAt(
      <Routes>
        <Route element={<RequireAuth role="admin" />}>
          <Route path="/admin" element={<p>secret admin page</p>} />
        </Route>
      </Routes>,
      '/admin',
    )
    expect(await screen.findByText('secret admin page')).toBeInTheDocument()
  })
})

describe('sign in', () => {
  it('shows field errors without calling the server when the form is empty', async () => {
    const { calls } = mockApi(base)
    renderAt(<App />, '/login')
    await userEvent.click(await screen.findByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Enter your email address')).toBeInTheDocument()
    expect(screen.getByText('Enter your password')).toBeInTheDocument()
    expect(calls.some((c) => c.key === 'POST /auth/login')).toBe(false)
    // Focus jumps to the first invalid field (set on the next animation frame).
    await waitFor(() => expect(document.activeElement?.id).toBe('field-email'))
  })

  it('signs in, stores the session, and lands on the dashboard', async () => {
    const { calls } = mockApi({
      ...base,
      'POST /auth/login': { body: { token: 'tok-123', expiresAt: 'x', user } },
    })
    renderAt(<App />, '/login')
    await userEvent.type(await screen.findByLabelText('Email'), 'Asha@Example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'Sup3rSecret99')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('heading', { name: 'Welcome, Asha' })).toBeInTheDocument()
    expect(getToken()).toBe('tok-123')
    expect(calls.find((c) => c.key === 'POST /auth/login')?.body).toEqual({ email: 'asha@example.com', password: 'Sup3rSecret99' })
  })

  it('shows a clear error for wrong credentials and does not store a session', async () => {
    mockApi({
      ...base,
      'POST /auth/login': { status: 401, body: { error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect email or password.' } } },
    })
    renderAt(<App />, '/login')
    await userEvent.type(await screen.findByLabelText('Email'), 'asha@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'nope')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect email or password.')
    expect(getToken()).toBeNull()
  })

  it('explains when the server cannot be reached', async () => {
    mockApi({ ...base, 'POST /auth/login': { networkError: true } })
    renderAt(<App />, '/login')
    await userEvent.type(await screen.findByLabelText('Email'), 'asha@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'x')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/can't reach the SmartNest server/i)
  })

  it('shows the throttling message when rate limited', async () => {
    mockApi({
      ...base,
      'POST /auth/login': { status: 429, body: { error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please wait a few minutes and try again.' } } },
    })
    renderAt(<App />, '/login')
    await userEvent.type(await screen.findByLabelText('Email'), 'asha@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'x')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/too many attempts/i)
  })
})

describe('sign up', () => {
  it('validates the password rules live and on submit', async () => {
    mockApi(base)
    renderAt(<App />, '/signup')
    await userEvent.type(await screen.findByLabelText('Your name'), 'Asha')
    await userEvent.type(screen.getByLabelText('Email'), 'asha@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'abc')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByText('Use at least 8 characters')).toBeInTheDocument()
  })

  it('offers sign-in when the email is taken', async () => {
    mockApi({
      ...base,
      'POST /auth/signup': {
        status: 409,
        body: { error: { code: 'EMAIL_TAKEN', message: 'exists', fields: { email: 'An account with this email already exists' } } },
      },
    })
    renderAt(<App />, '/signup')
    await userEvent.type(await screen.findByLabelText('Your name'), 'Asha')
    await userEvent.type(screen.getByLabelText('Email'), 'asha@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'Sup3rSecret99')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByText(/already exists/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Sign in instead' })).toHaveAttribute('href', '/login')
  })
})

describe('persistent sessions', () => {
  it('restores a stored session on load without asking for credentials', async () => {
    setToken('stored-token')
    const { calls } = mockApi({ ...base, 'GET /auth/me': { body: { user } } })
    renderAt(<App />, '/dashboard')
    expect(await screen.findByRole('heading', { name: 'Welcome, Asha' })).toBeInTheDocument()
    expect(calls.find((c) => c.key === 'GET /auth/me')?.headers.Authorization).toBe('Bearer stored-token')
  })

  it('drops an expired session and returns to sign-in', async () => {
    setToken('old-token')
    mockApi({
      ...base,
      'GET /auth/me': { status: 401, body: { error: { code: 'SESSION_EXPIRED', message: 'Your session has expired.' } } },
    })
    renderAt(<App />, '/dashboard')
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(getToken()).toBeNull()
  })

  it('keeps the session if the server is merely asleep, and offers a retry', async () => {
    setToken('keep-me')
    mockApi({ ...base, 'GET /auth/me': { networkError: true } })
    renderAt(<App />, '/dashboard')
    expect(await screen.findByText(/couldn't reach the server/i)).toBeInTheDocument()
    expect(getToken()).toBe('keep-me')
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('signs out: revokes on the server, clears the token and returns home', async () => {
    setToken('tok')
    const { calls } = mockApi({
      ...base,
      'GET /auth/me': { body: { user } },
      'POST /auth/logout': { status: 204 },
    })
    renderAt(<App />, '/dashboard')
    await screen.findByRole('heading', { name: 'Welcome, Asha' })
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    await waitFor(() => expect(getToken()).toBeNull())
    expect(calls.some((c) => c.key === 'POST /auth/logout')).toBe(true)
    expect(await screen.findByText('You have been signed out.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Get started' })).toBeInTheDocument()
  })

  it('sends signed-in people away from the sign-in page', async () => {
    setToken('tok')
    mockApi({ ...base, 'GET /auth/me': { body: { user } } })
    renderAt(<App />, '/login')
    expect(await screen.findByRole('heading', { name: 'Welcome, Asha' })).toBeInTheDocument()
  })
})

describe('password reset pages', () => {
  it('tells the truth when email delivery is not configured', async () => {
    mockApi({ ...base, 'POST /auth/forgot-password': { body: { message: 'ok' } } })
    renderAt(<App />, '/forgot-password')
    expect(await screen.findByText(/Email delivery isn't set up/)).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText('Email'), 'asha@example.com')
    await userEvent.click(screen.getByRole('button', { name: 'Send reset link' }))
    expect(await screen.findByText(/a reset link is on its way/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Email delivery isn't set up/).length).toBeGreaterThan(0)
  })

  it('submits a new password with the token from the link', async () => {
    const { calls } = mockApi({ ...base, 'POST /auth/reset-password': { body: { message: 'ok' } } })
    renderAt(<App />, '/reset-password?token=abcdefghijklmnopqrstuvwxyz0123456789')
    await userEvent.type(await screen.findByLabelText('New password'), 'BrandNew2024pw')
    await userEvent.click(screen.getByRole('button', { name: 'Update password' }))
    expect(await screen.findByRole('heading', { name: 'Password updated' })).toBeInTheDocument()
    expect(calls.find((c) => c.key === 'POST /auth/reset-password')?.body).toEqual({
      token: 'abcdefghijklmnopqrstuvwxyz0123456789',
      password: 'BrandNew2024pw',
    })
  })

  it('shows a recovery path for a missing or expired link', async () => {
    mockApi({
      ...base,
      'POST /auth/reset-password': { status: 400, body: { error: { code: 'INVALID_RESET_TOKEN', message: 'bad' } } },
    })
    renderAt(<App />, '/reset-password')
    expect(await screen.findByText(/missing, invalid, or has expired/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Request a new link' })).toBeInTheDocument()
  })
})
