export type StatusVenda = 'Pendente' | 'Confirmada' | 'Concluida' | 'Concluída' | 'ConcluÃ­da' | 'Cancelada'
export type StatusPagamento = 'Pendente' | 'Pago'
export type FormaPagamento = 'Dinheiro' | 'Pix' | 'CartaoCredito' | 'CartaoDebito' | 'Outro' | string

export interface ClienteVenda {
  nome?: string
  telefone?: string
  whatsApp?: string
}

export interface VendaItem {
  id?: string
  produtoId: string
  nomeProduto?: string
  produto?: {
    nome?: string
    imagemUrl?: string
  }
  imagemUrl?: string
  quantidade: number
  precoUnitario: number
  desconto: number
  subtotal: number
}

export interface Venda {
  id: string
  empresaId: string
  clienteId: string
  cliente?: string | ClienteVenda | null
  numero: number
  total: number
  status: StatusVenda | string
  statusPagamento: StatusPagamento
  formaPagamento?: FormaPagamento
  itens?: VendaItem[] | null
  valorProdutos: number
  valorDesconto: number
  valorEntrega: number
  valorTotal: number
  observacao: string
  dataCriacao: string
  criadaEm?: string
  logradouroEntrega?: string
  numeroEntrega?: string
  bairroEntrega?: string
  cidadeEntrega?: string
  estadoEntrega?: string
  cepEntrega?: string
  complementoEntrega?: string
  referenciaEntrega?: string
}
