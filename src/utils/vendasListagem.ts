import type { Venda } from '../types/venda'

export const VENDAS_POR_PAGINA = 10

export interface FiltrosVendas {
  busca: string
  pagamento: 'todos' | 'pagas' | 'nao-pagas'
  situacao: 'todas' | 'pendentes' | 'canceladas'
  dataInicial: string
  dataFinal: string
}

export interface PaginaVendas {
  itens: Venda[]
  pagina: number
  totalPaginas: number
  podeVoltar: boolean
  podeAvancar: boolean
}

export function dataLocalParaInput(data: Date): string {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

function dataCriacaoLocal(venda: Venda): string | null {
  const data = new Date(venda.dataCriacao)
  return Number.isNaN(data.getTime()) ? null : dataLocalParaInput(data)
}

function clienteSearchText(cliente: Venda['cliente']) {
  if (!cliente) return ''
  if (typeof cliente === 'string') return cliente.toLocaleLowerCase('pt-BR')
  return `${cliente.nome ?? ''} ${cliente.telefone ?? ''} ${cliente.whatsApp ?? ''}`.toLocaleLowerCase('pt-BR')
}

export function filtrarVendas(vendas: Venda[], filtros: FiltrosVendas): Venda[] {
  const texto = filtros.busca.trim().toLocaleLowerCase('pt-BR')
  return vendas.filter((venda) => {
    const matchesSearch = !texto || String(venda.numero ?? '').includes(texto) || clienteSearchText(venda.cliente).includes(texto)
    const matchesPayment = filtros.pagamento === 'todos' || (filtros.pagamento === 'pagas'
      ? venda.statusPagamento === 'Pago'
      : venda.statusPagamento !== 'Pago')
    const matchesSituation = filtros.situacao === 'todas' || (filtros.situacao === 'pendentes'
      ? venda.status === 'Pendente'
      : venda.status === 'Cancelada')
    const dataCriacao = filtros.dataInicial || filtros.dataFinal ? dataCriacaoLocal(venda) : null
    const matchesDate = (!filtros.dataInicial && !filtros.dataFinal) || (dataCriacao !== null &&
      (!filtros.dataInicial || dataCriacao >= filtros.dataInicial) &&
      (!filtros.dataFinal || dataCriacao <= filtros.dataFinal))
    return matchesSearch && matchesPayment && matchesSituation && matchesDate
  })
}

export function paginarVendas(vendas: Venda[], paginaSolicitada: number): PaginaVendas {
  const totalPaginas = Math.ceil(vendas.length / VENDAS_POR_PAGINA)
  const paginaNormalizada = Number.isFinite(paginaSolicitada) ? Math.max(1, Math.floor(paginaSolicitada)) : 1
  const pagina = totalPaginas ? Math.min(paginaNormalizada, totalPaginas) : 1
  const inicio = (pagina - 1) * VENDAS_POR_PAGINA
  return {
    itens: vendas.slice(inicio, inicio + VENDAS_POR_PAGINA),
    pagina,
    totalPaginas,
    podeVoltar: pagina > 1,
    podeAvancar: pagina < totalPaginas,
  }
}
