import api from './api'

export interface DashboardResumo {
  totalVendas: number
  quantidadeVendas: number
  ticketMedio: number
  quantidadeProdutosVendidos: number
  produtosEstoqueBaixo: number
  produtosSemEstoque: number
}

export interface FaturamentoDiario {
  data: string
  quantidadeVendas: number
  faturamento: number
}

export async function obterDashboard(dataInicio: string, dataFim: string): Promise<DashboardResumo> {
  const { data } = await api.get<DashboardResumo>('/api/dashboard', { params: { dataInicio, dataFim } })
  return data
}

export async function obterFaturamentoDiario(dataInicio: string, dataFim: string): Promise<FaturamentoDiario[]> {
  const { data } = await api.get<FaturamentoDiario[]>('/api/relatorios/faturamento-diario', {
    params: { dataInicio, dataFim },
  })
  return data
}
