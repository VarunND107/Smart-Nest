import { useState } from 'react'
import type { FormEvent } from 'react'
import type { ZodType } from 'zod'
import { ApiError } from './api'

/**
 * Small form helper: zod validation on submit, server field errors mapped back onto inputs,
 * a form-level message for everything else, and focus moved to the first problem.
 */
export function useForm<V extends Record<string, string>, T = V>(schema: ZodType<T, V>, initial: V) {
  const [values, setValues] = useState<V>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof V, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const setValue = (key: keyof V, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  const focusFirst = (errs: Partial<Record<keyof V, string>>) => {
    const first = (Object.keys(initial) as (keyof V)[]).find((k) => errs[k])
    if (first) requestAnimationFrame(() => document.getElementById(`field-${String(first)}`)?.focus())
  }

  const handleSubmit = (onValid: (data: T) => Promise<void>) => async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setFormError(null)

    const parsed = schema.safeParse(values)
    if (!parsed.success) {
      const next: Partial<Record<keyof V, string>> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof V | undefined
        if (key !== undefined && !next[key]) next[key] = issue.message
      }
      setErrors(next)
      focusFirst(next)
      return
    }

    setErrors({})
    setSubmitting(true)
    try {
      await onValid(parsed.data)
    } catch (err) {
      if (err instanceof ApiError) {
        const known = Object.keys(initial)
        const fieldErrs: Partial<Record<keyof V, string>> = {}
        for (const [k, msg] of Object.entries(err.fields)) if (known.includes(k)) fieldErrs[k as keyof V] = msg
        if (Object.keys(fieldErrs).length) {
          setErrors(fieldErrs)
          focusFirst(fieldErrs)
        } else {
          setFormError(err.message)
        }
      } else {
        setFormError('Something unexpected went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return { values, errors, formError, submitting, setValue, setFormError, handleSubmit }
}
