import api from './api'
import type { Venda } from '../types/venda'

type ApiRecord = Record<string, unknown>

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === 'object' && value !== null
}

function extractVendas(value: unknown): Venda[] {
  if (Array.isArray(value)) return value as Venda[]
  if (!isRecord(value)) throw new Error('Formato inesperado na resposta de vendas.')

  for (const key of ['items', 'data', 'vendas', 'resultados', 'dados', 'results', 'records', 'content', 'value']) {
    const nested: unknown = value[key]
    if (nested !== value && nested !== undefined) return extractVendas(nested)
  }

  for (const nested of Object.values(value)) {
    if (Array.isArray(nested)) return nested as Venda[]
    if (isRecord(nested)) {
      try { return extractVendas(nested) } catch { }
    }
  }

  throw new Error('Formato inesperado na resposta de vendas.')
}

export async function listarVendas(): Promise<Venda[]> {
  const { data } = await api.get<unknown>('/api/vendas')
  return extractVendas(data)
}

export async function obterVenda(id: string): Promise<Venda> {
  const { data } = await api.get<Venda>(`/api/vendas/${id}`)
  return data
}

export async function concluirVenda(id: string): Promise<void> {
  await api.put(`/api/vendas/${id}/concluir`)
}

export async function cancelarVenda(id: string): Promise<void> {
  await api.put(`/api/vendas/${id}/cancelar`)
}

