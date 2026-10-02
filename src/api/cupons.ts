import api from './api'
import type { Cupom, CupomCreate, CupomUpdate } from '../types/cupom'

export async function listarCupons(): Promise<Cupom[]> {
  const { data } = await api.get<Cupom[]>('/api/cupons')
  return data
}

export async function obterCupom(id: string): Promise<Cupom> {
  const { data } = await api.get<Cupom>(`/api/cupons/${id}`)
  return data
}

export async function criarCupom(data: CupomCreate): Promise<Cupom> {
  const response = await api.post<Cupom>('/api/cupons', data)
  return response.data
}

export async function atualizarCupom(id: string, data: CupomUpdate): Promise<Cupom> {
  const response = await api.put<Cupom>(`/api/cupons/${id}`, data)
  return response.data
}

export async function excluirCupom(id: string): Promise<void> {
  await api.delete(`/api/cupons/${id}`)
}
