import api from './api'
import type { LoginResponse, TrocarSenhaPayload } from '../types'

export interface LoginPayload {
  email: string
  senha: string
}

export async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/api/auth/login', payload)
  return data
}

export async function trocarSenhaRequest(payload: TrocarSenhaPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/api/auth/trocar-senha', payload)
  return data
}
