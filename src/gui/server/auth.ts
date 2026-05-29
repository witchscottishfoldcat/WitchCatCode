import { randomBytes, timingSafeEqual } from 'crypto'

export function generateToken(): string {
  return randomBytes(32).toString('hex')
}

export function validateToken(
  requestToken: string | null | undefined,
  expectedToken: string,
): boolean {
  if (!requestToken) return false
  const a = Buffer.from(requestToken)
  const b = Buffer.from(expectedToken)
  // timingSafeEqual requires equal-length buffers; differing length means
  // a mismatch, but still run a comparison to keep timing roughly constant.
  if (a.length !== b.length) {
    timingSafeEqual(b, b)
    return false
  }
  return timingSafeEqual(a, b)
}
