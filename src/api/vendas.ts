import api from './api'
import type { Venda, VendaCreateDto } from '../types/venda'

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

function extractVendasPage(value: unknown): { vendas: Venda[]; total?: number } {
  if (Array.isArray(value)) return { vendas: value as Venda[] }
  if (!isRecord(value)) throw new Error('Formato inesperado na resposta de vendas.')

  for (const key of ['itens', 'items', 'data', 'vendas', 'resultados', 'dados', 'results', 'records', 'content', 'value']) {
    if (Array.isArray(value[key])) {
      const total = Number(value.total)
      return { vendas: value[key] as Venda[], total: Number.isFinite(total) ? total : undefined }
    }
  }

  return { vendas: extractVendas(value) }
}

export async function listarVendas(): Promise<Venda[]> {
  const tamanho = 100
  const primeiraResposta = await api.get<unknown>('/api/vendas', { params: { pagina: 1, tamanho } })
  const primeiraPagina = extractVendasPage(primeiraResposta.data)
  if (primeiraPagina.total === undefined) return primeiraPagina.vendas

  const totalPaginas = Math.ceil(primeiraPagina.total / tamanho)
  const vendas = [...primeiraPagina.vendas]
  for (let pagina = 2; pagina <= totalPaginas; pagina += 1) {
    const { data } = await api.get<unknown>('/api/vendas', { params: { pagina, tamanho } })
    vendas.push(...extractVendasPage(data).vendas)
  }
  return vendas
}

export async function obterVenda(id: string): Promise<Venda> {
  const { data } = await api.get<Venda>(`/api/vendas/${id}`)
  return data
}

export async function criarVenda(payload: VendaCreateDto): Promise<Venda> {
  const { data } = await api.post<Venda>('/api/vendas', payload)
  return data
}

export async function confirmarVenda(id: string): Promise<void> {
  await api.put(`/api/vendas/${id}/confirmar`)
}

export async function confirmarPagamentoVenda(id: string): Promise<void> {
  await api.put(`/api/vendas/${id}/confirmar-pagamento`)
}

export async function concluirVenda(id: string): Promise<void> {
  await api.put(`/api/vendas/${id}/concluir`)
}

export async function cancelarVenda(id: string): Promise<void> {
  await api.put(`/api/vendas/${id}/cancelar`)
}

