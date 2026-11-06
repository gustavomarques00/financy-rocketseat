import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

/** Opaque CSPRNG token with ≥256 bits of entropy (32 bytes → base64url). */
export function generateOpaqueToken(): string {
  return randomBytes(32).toString('base64url')
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}

export function safeEqualHex(a: string, b: string): boolean {
  try {
    const left = Buffer.from(a, 'hex')
    const right = Buffer.from(b, 'hex')
    if (left.length === 0 || left.length !== right.length) {
      return false
    }
    return timingSafeEqual(left, right)
  } catch {
    return false
  }
}
