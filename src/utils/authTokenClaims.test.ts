import { describe, expect, it } from 'vitest'
import { readAuthTokenClaims } from './authTokenClaims'

const tokenFor = (claims: Record<string, unknown>) => `header.${btoa(JSON.stringify(claims))}.signature`

describe('claims de autenticação', () => {
  it('identifica o SuperAdmin pela claim emitida pelo backend', () => {
    expect(readAuthTokenClaims(tokenFor({ SuperAdmin: 'true' }))).toEqual({ superAdmin: true, mustChangePassword: false })
    expect(readAuthTokenClaims(tokenFor({ SuperAdmin: true }))).toEqual({ superAdmin: true, mustChangePassword: false })
  })

  it('identifica a troca de senha obrigatória', () => {
    expect(readAuthTokenClaims(tokenFor({ DeveTrocarSenha: 'true' }))).toEqual({ superAdmin: false, mustChangePassword: true })
  })

  it('não concede privilégios quando token ou claims são inválidos', () => {
    expect(readAuthTokenClaims('inválido')).toEqual({ superAdmin: false, mustChangePassword: false })
    expect(readAuthTokenClaims(tokenFor({ TipoUsuario: 'SuperAdmin' }))).toEqual({ superAdmin: false, mustChangePassword: false })
  })
})
