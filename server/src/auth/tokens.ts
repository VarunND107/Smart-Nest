import { createHash, randomBytes } from 'node:crypto'

/** 256 bits of randomness, URL-safe. This is what the client holds. */
export const generateToken = () => randomBytes(32).toString('base64url')

/** What the database holds: a leaked table must not contain usable tokens. */
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')
