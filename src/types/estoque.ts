export interface MovimentacaoEstoque {
  produtoId: string
  quantidade: number
  observacao?: string
}

export interface EntradaEstoque extends MovimentacaoEstoque {}
export interface AjusteEstoque extends MovimentacaoEstoque {}

export interface EstoqueProduto {
  id: string
  nome: string
  codigo?: string | null
  categoriaId: string
  grupoId: string
  estoqueAtual: number
  estoqueMinimo: number
  ativo: boolean
}

export interface EstoqueBaixo {
  produtoId: string
  nome: string
  estoqueAtual: number
  estoqueMinimo: number
}

export type EstoqueZerado = EstoqueBaixo

export interface HistoricoMovimentacao {
  id?: string
  produtoId?: string
  tipo?: string
  quantidade?: number
  estoqueAnterior?: number
  estoquePosterior?: number
  usuario?: string
  observacao?: string | null
  data?: string
  dataCriacao?: string
}
