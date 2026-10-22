import { z } from 'zod'

// Mirrors the server's rules so people get instant feedback. The server stays authoritative:
// it re-validates everything and is the only thing that decides what is allowed.

export const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Enter your email address')
  .max(254, 'That email address is too long')
  .pipe(z.email('Enter a valid email address'))

export const passwordRules = [
  { id: 'len', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { id: 'letter', label: 'At least one letter', test: (p: string) => /[A-Za-z]/.test(p) },
  { id: 'digit', label: 'At least one number', test: (p: string) => /[0-9]/.test(p) },
] as const

export const newPasswordField = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(128, 'Use at most 128 characters')
  .regex(/[A-Za-z]/, 'Include at least one letter')
  .regex(/[0-9]/, 'Include at least one number')

export const signupSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(100, 'Use at most 100 characters'),
  email: emailField,
  password: newPasswordField,
})

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Enter your password'),
})

export const forgotSchema = z.object({ email: emailField })

export const resetSchema = z.object({ password: newPasswordField })
