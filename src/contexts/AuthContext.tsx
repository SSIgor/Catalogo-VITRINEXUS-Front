import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { loginRequest, trocarSenhaRequest, type LoginPayload } from '../api/auth'
import type { TrocarSenhaPayload, Usuario } from '../types'
import { readAuthTokenClaims, type AuthTokenClaims } from '../utils/authTokenClaims'

interface AuthContextValue {
  usuario: Usuario | null
  isAuthenticated: boolean
  isLoading: boolean
  isSuperAdmin: boolean
  requiresPasswordChange: boolean
  login: (payload: LoginPayload) => Promise<boolean>
  changePassword: (payload: TrocarSenhaPayload) => Promise<void>
  logout: () => void
  getEmpresaId: () => string | null
  hasUserType: (tipo: string) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)
const USER_KEY = 'catalogo_usuario'
const TOKEN_KEY = 'catalogo_token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [claims, setClaims] = useState<AuthTokenClaims>({ superAdmin: false, mustChangePassword: false })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const syncSession = () => {
      const savedUser = localStorage.getItem(USER_KEY)
      const token = localStorage.getItem(TOKEN_KEY)
      if (savedUser) {
        try { setUsuario(JSON.parse(savedUser) as Usuario) } catch { localStorage.removeItem(USER_KEY); setUsuario(null) }
      } else {
        setUsuario(null)
      }
      setClaims(token ? readAuthTokenClaims(token) : { superAdmin: false, mustChangePassword: false })
    }
    syncSession()
    window.addEventListener('storage', syncSession)
    setIsLoading(false)
    return () => window.removeEventListener('storage', syncSession)
  }, [])

  async function login(payload: LoginPayload): Promise<boolean> {
    const response = await loginRequest(payload)
    const nextClaims = readAuthTokenClaims(response.token)
    localStorage.setItem(TOKEN_KEY, response.token)
    localStorage.setItem(USER_KEY, JSON.stringify(response.usuario))
    setClaims(nextClaims)
    setUsuario(response.usuario)
    return nextClaims.mustChangePassword
  }

  async function changePassword(payload: TrocarSenhaPayload) {
    const response = await trocarSenhaRequest(payload)
    const nextClaims = readAuthTokenClaims(response.token)
    localStorage.setItem(TOKEN_KEY, response.token)
    localStorage.setItem(USER_KEY, JSON.stringify(response.usuario))
    setClaims(nextClaims)
    setUsuario(response.usuario)
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setClaims({ superAdmin: false, mustChangePassword: false })
    setUsuario(null)
  }

  return <AuthContext.Provider value={{
    usuario,
    isAuthenticated: Boolean(usuario),
    isLoading,
    isSuperAdmin: claims.superAdmin,
    requiresPasswordChange: claims.mustChangePassword,
    login,
    changePassword,
    logout,
    getEmpresaId: () => usuario?.empresaId ?? null,
    hasUserType: (tipo) => usuario?.tipo === tipo,
  }}>
    {children}
  </AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return context
}
