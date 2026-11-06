import * as jose from 'jose'

const JWT_ALG = 'HS256'
const JWT_ISSUER = 'financy-backend'
const JWT_AUDIENCE = 'financy-frontend'

export type AccessTokenPayload = {
  sub: string
  sessionVersion: number
}

function encodeSecret(secret: string): Uint8Array {
  return new TextEncoder().encode(secret)
}

export async function signAccessToken(
  userId: string,
  sessionVersion: number,
  secret: string,
  expiresIn: string,
): Promise<string> {
  return new jose.SignJWT({ sv: sessionVersion })
    .setProtectedHeader({ alg: JWT_ALG })
    .setSubject(userId)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(encodeSecret(secret))
}

export async function verifyAccessToken(
  token: string,
  secret: string,
): Promise<AccessTokenPayload> {
  const { payload } = await jose.jwtVerify(token, encodeSecret(secret), {
    algorithms: [JWT_ALG],
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  })

  if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
    throw new Error('Invalid token subject')
  }

  const sessionVersion =
    typeof payload.sv === 'number' && Number.isInteger(payload.sv) ? payload.sv : 0

  return { sub: payload.sub, sessionVersion }
}

export function extractBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) {
    return null
  }

  const [scheme, token] = authorizationHeader.split(' ')

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null
  }

  return token.trim() || null
}
