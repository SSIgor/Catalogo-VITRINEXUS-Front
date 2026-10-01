import api from './api'
import type { Categoria, CategoriaCreate, CategoriaUpdate } from '../types/categoria'

export async function listarCategorias(): Promise<Categoria[]> {
  const { data } = await api.get<Categoria[]>('/api/categorias')
  return data
}

export async function obterCategoria(id: string): Promise<Categoria> {
  const { data } = await api.get<Categoria>(`/api/categorias/${id}`)
  return data
}

export async function criarCategoria(data: CategoriaCreate): Promise<Categoria> {
  const response = await api.post<Categoria>('/api/categorias', data)
  return response.data
}

export async function atualizarCategoria(id: string, data: CategoriaUpdate): Promise<Categoria> {
  const response = await api.put<Categoria>(`/api/categorias/${id}`, data)
  return response.data
}

export async function excluirCategoria(id: string): Promise<void> {
  await api.delete(`/api/categorias/${id}`)
}
