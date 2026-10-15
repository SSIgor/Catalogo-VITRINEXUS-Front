export interface AuthTokenClaims {
  superAdmin: boolean
  mustChangePassword: boolean
}

export function readAuthTokenClaims(token: string): AuthTokenClaims {
  try {
    const encodedPayload = token.split('.')[1]
    if (!encodedPayload) return { superAdmin: false, mustChangePassword: false }
    const unpaddedBase64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/')
    const base64 = unpaddedBase64.padEnd(unpaddedBase64.length + (4 - unpaddedBase64.length % 4) % 4, '=')
    const payload = JSON.parse(atob(base64)) as Record<string, unknown>
    return {
      superAdmin: payload.SuperAdmin === true || payload.SuperAdmin === 'true',
      mustChangePassword: payload.DeveTrocarSenha === true || payload.DeveTrocarSenha === 'true',
    }
  } catch {
    return { superAdmin: false, mustChangePassword: false }
  }
}
