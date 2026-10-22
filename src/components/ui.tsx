import { useId, useState } from 'react'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'
import type { LinkProps } from 'react-router'

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ')

// --- Buttons ---------------------------------------------------------------------------------
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
const variants: Record<Variant, string> = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800 disabled:bg-brand-700/60',
  secondary: 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 disabled:text-slate-400',
  ghost: 'text-slate-700 hover:bg-slate-100 disabled:text-slate-400',
  danger: 'bg-red-700 text-white hover:bg-red-800 disabled:bg-red-700/60',
}
const base =
  'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed'

export function Button({
  variant = 'primary',
  loading = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(base, variants[variant], className)}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  )
}

export function ButtonLink({ variant = 'primary', className, ...rest }: LinkProps & { variant?: Variant }) {
  return <Link {...rest} className={cx(base, variants[variant], className)} />
}

// --- Feedback --------------------------------------------------------------------------------
export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={cx('animate-spin', className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function PageLoading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-24 text-slate-600">
      <Spinner />
      <span>{label}</span>
    </div>
  )
}

type Tone = 'info' | 'success' | 'warning' | 'error'
const tones: Record<Tone, string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-950',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-950',
  warning: 'border-amber-200 bg-amber-50 text-amber-950',
  error: 'border-red-200 bg-red-50 text-red-950',
}

export function Alert({
  tone = 'info',
  title,
  children,
  className,
}: {
  tone?: Tone
  title?: string
  children?: ReactNode
  className?: string
}) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cx('rounded-md border px-4 py-3 text-sm', tones[tone], className)}
    >
      {title && <p className="font-semibold">{title}</p>}
      {children && <div className={title ? 'mt-1' : undefined}>{children}</div>}
    </div>
  )
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <p className="text-base font-semibold text-slate-900">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-md text-sm text-slate-600">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'brand' | 'soon'; children: ReactNode }) {
  const t = {
    neutral: 'bg-slate-100 text-slate-700',
    brand: 'bg-brand-100 text-brand-900',
    soon: 'bg-amber-100 text-amber-900',
  }[tone]
  return <span className={cx('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold', t)}>{children}</span>
}

// --- Forms -----------------------------------------------------------------------------------
interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'name' | 'onChange' | 'value'> {
  name: string
  label: string
  value: string
  onChange(value: string): void
  error?: ReactNode
  hint?: ReactNode
}

export function Field({ name, label, value, onChange, error, hint, className, ...rest }: FieldProps) {
  const hintId = useId()
  const errId = useId()
  return (
    <div>
      <label htmlFor={`field-${name}`} className="block text-sm font-medium text-slate-900">
        {label}
      </label>
      <input
        {...rest}
        id={`field-${name}`}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={cx(error ? errId : null, hint ? hintId : null) || undefined}
        className={cx(
          'mt-1 block w-full rounded-md border bg-white px-3 py-2 text-base text-slate-900 placeholder:text-slate-400 sm:text-sm',
          error ? 'border-red-600' : 'border-slate-300',
          className,
        )}
      />
      {hint && (
        <div id={hintId} className="mt-1 text-xs text-slate-600">
          {hint}
        </div>
      )}
      {error && (
        <p id={errId} className="mt-1 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}

export function PasswordField(props: Omit<FieldProps, 'type'>) {
  const [shown, setShown] = useState(false)
  return (
    <div>
      <Field {...props} type={shown ? 'text' : 'password'} spellCheck={false} autoCapitalize="none" />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        aria-pressed={shown}
        className="mt-1 text-xs font-medium text-brand-700 underline underline-offset-2"
      >
        {shown ? 'Hide password' : 'Show password'}
      </button>
    </div>
  )
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx('rounded-lg border border-slate-200 bg-white p-5 sm:p-6', className)}>{children}</div>
}

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
      {children && <p className="mt-2 max-w-2xl text-slate-600">{children}</p>}
    </header>
  )
}
