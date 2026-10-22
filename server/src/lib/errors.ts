import type { ZodType } from 'zod'

/** An error that is safe to show to the client: status + stable code + human message. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message)
  }
}

export const badRequest = (code: string, message: string, fields?: Record<string, string>) =>
  new HttpError(400, code, message, fields)
export const unauthorized = (message = 'Please sign in to continue.', code = 'UNAUTHENTICATED') =>
  new HttpError(401, code, message)
export const forbidden = (message = 'You do not have permission to do that.') =>
  new HttpError(403, 'FORBIDDEN', message)
export const notFound = (message = 'Not found.') => new HttpError(404, 'NOT_FOUND', message)
export const conflict = (code: string, message: string, fields?: Record<string, string>) =>
  new HttpError(409, code, message, fields)

/** Validate untrusted input. Throws a 400 with one message per field (the first that failed). */
export function parse<T>(schema: ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input)
  if (result.success) return result.data
  const fields: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = issue.path.join('.') || '_'
    fields[key] ??= issue.message
  }
  throw badRequest('VALIDATION_ERROR', 'Please check the highlighted fields.', fields)
}
