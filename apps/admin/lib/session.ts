export const ADMIN_COOKIE = 'ac_ops_session'
export const ADMIN_SESSION_MS = 7 * 24 * 60 * 60 * 1000

function toHex(bytes: Uint8Array): string {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const buf = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(message)
  )
  return toHex(new Uint8Array(buf))
}

function timingSafeEqualHex(left: string, right: string): boolean {
  if (left.length !== right.length) return false
  let diff = 0
  for (let i = 0; i < left.length; i += 1) {
    diff |= left.charCodeAt(i) ^ right.charCodeAt(i)
  }
  return diff === 0
}

export async function signAdminSession(
  secret: string,
  now = Date.now()
): Promise<string> {
  const exp = String(now + ADMIN_SESSION_MS)
  const sig = await hmacSha256Hex(secret, `ac-ops:${exp}`)
  return `${exp}.${sig}`
}

export async function verifyAdminSession(
  token: string | undefined,
  secret: string,
  now = Date.now()
): Promise<boolean> {
  if (!token || !secret) return false
  const split = token.indexOf('.')
  if (split < 1) return false
  const exp = token.slice(0, split)
  const sig = token.slice(split + 1)
  const expected = await hmacSha256Hex(secret, `ac-ops:${exp}`)
  if (!timingSafeEqualHex(sig, expected)) return false
  const expMs = Number(exp)
  if (!Number.isFinite(expMs) || expMs < now) return false
  return true
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: Math.floor(ADMIN_SESSION_MS / 1000),
  }
}
