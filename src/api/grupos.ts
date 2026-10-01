import api from './api'
import type { Grupo, GrupoCreate, GrupoUpdate } from '../types/grupo'

export async function listarGrupos(): Promise<Grupo[]> {
  const { data } = await api.get<Grupo[]>('/api/grupos')
  return data
}

export async function obterGrupo(id: string): Promise<Grupo> {
  const { data } = await api.get<Grupo>(`/api/grupos/${id}`)
  return data
}

export async function criarGrupo(data: GrupoCreate): Promise<Grupo> {
  const { data: created } = await api.post<Grupo>('/api/grupos', data)
  return created
}

export async function atualizarGrupo(id: string, data: GrupoUpdate): Promise<Grupo> {
  const { data: updated } = await api.put<Grupo>(`/api/grupos/${id}`, data)
  return updated
}

export async function excluirGrupo(id: string): Promise<void> {
  await api.delete(`/api/grupos/${id}`)
}

export async function ativarGrupo(id: string): Promise<void> {
  await api.put(`/api/grupos/${id}/ativar`)
}

export async function desativarGrupo(id: string): Promise<void> {
  await api.put(`/api/grupos/${id}/desativar`)
}
