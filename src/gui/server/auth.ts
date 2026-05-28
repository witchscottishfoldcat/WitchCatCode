import { randomBytes } from 'crypto'

export function generateToken(): string {
  return randomBytes(32).toString('hex')
}

export function validateToken(
  requestToken: string | null,
  expectedToken: string,
): boolean {
  if (!requestToken) return false
  return requestToken === expectedToken
}
