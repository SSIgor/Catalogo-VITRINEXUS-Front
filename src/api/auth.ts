import api from './api'
import type { LoginResponse } from '../types'

export interface LoginPayload {
  email: string
  senha: string
}

export async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/api/auth/login', payload)
  return data
}
