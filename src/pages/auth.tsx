import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Alert, Button, Card, Field, PasswordField } from '../components/ui'
import { useToast } from '../components/toast'
import { api } from '../lib/api'
import type { Health } from '../lib/api'
import { useAuth } from '../lib/auth'
import { useForm } from '../lib/useForm'
import { forgotSchema, loginSchema, passwordRules, resetSchema, signupSchema } from '../lib/validation'

function AuthShell({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md py-6 sm:py-10">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {intro && <p className="mt-2 text-slate-600">{intro}</p>}
      <Card className="mt-6">{children}</Card>
    </div>
  )
}

const linkCls = 'font-medium text-brand-700 underline underline-offset-2'

export function Login() {
  const { login } = useAuth()
  const form = useForm(loginSchema, { email: '', password: '' })

  return (
    <AuthShell title="Sign in" intro="Welcome back to SmartNest.">
      <form noValidate onSubmit={form.handleSubmit((data) => login(data))} className="space-y-4">
        {form.formError && <Alert tone="error">{form.formError}</Alert>}
        <Field
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={form.values.email}
          onChange={(v) => form.setValue('email', v)}
          error={form.errors.email}
        />
        <PasswordField
          name="password"
          label="Password"
          autoComplete="current-password"
          value={form.values.password}
          onChange={(v) => form.setValue('password', v)}
          error={form.errors.password}
        />
        <Button type="submit" loading={form.submitting} className="w-full">
          {form.submitting ? 'Signing in…' : 'Sign in'}
        </Button>
        <div className="flex flex-wrap justify-between gap-2 text-sm text-slate-600">
          <Link to="/forgot-password" className={linkCls}>
            Forgot password?
          </Link>
          <span>
            New here?{' '}
            <Link to="/signup" className={linkCls}>
              Create an account
            </Link>
          </span>
        </div>
      </form>
    </AuthShell>
  )
}

export function Signup() {
  const { signup } = useAuth()
  const toast = useToast()
  const form = useForm(signupSchema, { name: '', email: '', password: '' })
  const pw = form.values.password

  return (
    <AuthShell title="Create your account" intro="Free. Plan, organise and get help with your smart home.">
      <form
        noValidate
        onSubmit={form.handleSubmit(async (data) => {
          await signup(data)
          toast.success(`Welcome to SmartNest, ${data.name.split(' ')[0]}!`)
        })}
        className="space-y-4"
      >
        {form.formError && <Alert tone="error">{form.formError}</Alert>}
        <Field
          name="name"
          label="Your name"
          autoComplete="name"
          value={form.values.name}
          onChange={(v) => form.setValue('name', v)}
          error={form.errors.name}
        />
        <Field
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={form.values.email}
          onChange={(v) => form.setValue('email', v)}
          error={
            form.errors.email && form.errors.email.includes('already exists') ? (
              <>
                {form.errors.email}.{' '}
                <Link to="/login" className="underline">
                  Sign in instead
                </Link>
              </>
            ) : (
              form.errors.email
            )
          }
        />
        <PasswordField
          name="password"
          label="Password"
          autoComplete="new-password"
          value={pw}
          onChange={(v) => form.setValue('password', v)}
          error={form.errors.password}
          hint={
            <ul aria-label="Password requirements">
              {passwordRules.map((r) => (
                <li key={r.id} className={r.test(pw) ? 'text-emerald-800' : undefined}>
                  <span aria-hidden="true">{r.test(pw) ? '✓ ' : '• '}</span>
                  {r.label}
                  {r.test(pw) && <span className="sr-only"> (met)</span>}
                </li>
              ))}
            </ul>
          }
        />
        <Button type="submit" loading={form.submitting} className="w-full">
          {form.submitting ? 'Creating account…' : 'Create account'}
        </Button>
        <p className="text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className={linkCls}>
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}

export function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const form = useForm(forgotSchema, { email: '' })
  // Be straight about whether this deployment can actually send email.
  const health = useQuery({
    queryKey: ['health'],
    queryFn: ({ signal }) => api<Health>('/health', { auth: false, signal }),
    retry: false,
    staleTime: 60_000,
  })
  const emailOff = health.data?.features?.passwordResetEmail === false

  if (sent) {
    return (
      <AuthShell title="Check your email">
        <div className="space-y-4">
          <Alert tone="success">If an account exists for {form.values.email.trim()}, a reset link is on its way.</Alert>
          {emailOff && (
            <Alert tone="warning" title="Email delivery isn't set up on this demo server">
              No email will arrive. The site owner can enable it (see the README) or look in the server log.
            </Alert>
          )}
          <p className="text-sm text-slate-600">The link works once and expires in an hour.</p>
          <Link to="/login" className={linkCls}>
            Back to sign in
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Reset your password" intro="Enter your email and we'll send you a link to choose a new password.">
      <form
        noValidate
        onSubmit={form.handleSubmit(async (data) => {
          await api('/auth/forgot-password', { body: data, auth: false })
          setSent(true)
        })}
        className="space-y-4"
      >
        {form.formError && <Alert tone="error">{form.formError}</Alert>}
        {emailOff && (
          <Alert tone="warning" title="Email delivery isn't set up on this demo server">
            You can still submit the form, but no email will be sent.
          </Alert>
        )}
        <Field
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={form.values.email}
          onChange={(v) => form.setValue('email', v)}
          error={form.errors.email}
        />
        <Button type="submit" loading={form.submitting} className="w-full">
          {form.submitting ? 'Sending…' : 'Send reset link'}
        </Button>
        <Link to="/login" className={`${linkCls} text-sm`}>
          Back to sign in
        </Link>
      </form>
    </AuthShell>
  )
}

export function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [done, setDone] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const toast = useToast()
  const form = useForm(resetSchema, { password: '' })
  const pw = form.values.password

  if (!token || invalid) {
    return (
      <AuthShell title="Reset link problem">
        <div className="space-y-4">
          <Alert tone="error">This reset link is missing, invalid, or has expired.</Alert>
          <Link to="/forgot-password" className={linkCls}>
            Request a new link
          </Link>
        </div>
      </AuthShell>
    )
  }

  if (done) {
    return (
      <AuthShell title="Password updated">
        <div className="space-y-4">
          <Alert tone="success">Your password has been changed and you were signed out everywhere.</Alert>
          <Link to="/login" className={linkCls}>
            Sign in with your new password
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Choose a new password">
      <form
        noValidate
        onSubmit={form.handleSubmit(async (data) => {
          try {
            await api('/auth/reset-password', { body: { token, password: data.password }, auth: false })
          } catch (err) {
            if ((err as { code?: string }).code === 'INVALID_RESET_TOKEN') {
              setInvalid(true)
              return
            }
            throw err
          }
          toast.success('Password updated.')
          setDone(true)
        })}
        className="space-y-4"
      >
        {form.formError && <Alert tone="error">{form.formError}</Alert>}
        <PasswordField
          name="password"
          label="New password"
          autoComplete="new-password"
          value={pw}
          onChange={(v) => form.setValue('password', v)}
          error={form.errors.password}
          hint={
            <ul aria-label="Password requirements">
              {passwordRules.map((r) => (
                <li key={r.id} className={r.test(pw) ? 'text-emerald-800' : undefined}>
                  <span aria-hidden="true">{r.test(pw) ? '✓ ' : '• '}</span>
                  {r.label}
                </li>
              ))}
            </ul>
          }
        />
        <Button type="submit" loading={form.submitting} className="w-full">
          {form.submitting ? 'Saving…' : 'Update password'}
        </Button>
      </form>
    </AuthShell>
  )
}
