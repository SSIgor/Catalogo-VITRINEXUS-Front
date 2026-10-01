import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { loginRequest, type LoginPayload } from '../api/auth'
import type { Usuario } from '../types'

interface AuthContextValue {
  usuario: Usuario | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<void>
  logout: () => void
  getEmpresaId: () => string | null
  hasUserType: (tipo: string) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)
const USER_KEY = 'catalogo_usuario'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem(USER_KEY)
    if (savedUser) {
      try { setUsuario(JSON.parse(savedUser) as Usuario) } catch { localStorage.removeItem(USER_KEY) }
    }
    setIsLoading(false)
  }, [])

  async function login(payload: LoginPayload) {
    const response = await loginRequest(payload)
    localStorage.setItem('catalogo_token', response.token)
    localStorage.setItem(USER_KEY, JSON.stringify(response.usuario))
    setUsuario(response.usuario)
  }

  function logout() {
    localStorage.removeItem('catalogo_token')
    localStorage.removeItem(USER_KEY)
    setUsuario(null)
  }

  return <AuthContext.Provider value={{ usuario, isAuthenticated: Boolean(usuario), isLoading, login, logout, getEmpresaId: () => usuario?.empresaId ?? null, hasUserType: (tipo) => usuario?.tipo === tipo }}>
    {children}
  </AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return context
}
