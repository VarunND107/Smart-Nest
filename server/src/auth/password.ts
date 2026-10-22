import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto'

// OWASP-recommended scrypt parameters (N=2^15, r=8, p=3 ≈ 32 MiB). Built into Node, so
// there is no native module to compile on the host. Parameters are stored with each hash.
const N = 32_768
const R = 8
const P = 3
const KEY_LEN = 64
const MAX_MEM = 128 * N * R * 2

function derive(password: string, salt: Buffer, n: number, r: number, p: number, keyLen: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCb(password.normalize('NFKC'), salt, keyLen, { N: n, r, p, maxmem: Math.max(MAX_MEM, 128 * n * r * 2) }, (err, key) =>
      err ? reject(err) : resolve(key),
    )
  })
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const key = await derive(password, salt, N, R, P, KEY_LEN)
  return ['scrypt', N, R, P, salt.toString('base64'), key.toString('base64')].join('$')
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, n, r, p, saltB64, keyB64] = stored.split('$')
  if (scheme !== 'scrypt' || !n || !r || !p || !saltB64 || !keyB64) return false
  const expected = Buffer.from(keyB64, 'base64')
  const actual = await derive(password, Buffer.from(saltB64, 'base64'), Number(n), Number(r), Number(p), expected.length)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

let dummy: Promise<string> | undefined
/**
 * Verify against a throwaway hash so "unknown email" costs the same as "wrong password",
 * instead of returning instantly and revealing which emails have accounts.
 */
export async function burnPasswordCheck(password: string): Promise<void> {
  dummy ??= hashPassword('not-a-real-password')
  await verifyPassword(password, await dummy)
}
