export interface Usuario {
  id: string
  nome: string
  email: string
  tipo: string
  empresaId: string
}

export interface Empresa {
  id: string
  nome: string
  slug: string
  descricao?: string
  logoUrl?: string
}

export type { Categoria, ImagemProduto, Produto, ProdutoCreate, ProdutoUpdate, ReordenarImagem, ReordenarImagens } from './produto'

export type { FormaPagamento, StatusPagamento, StatusVenda, Venda, VendaItem } from './venda'

export interface Cliente {
  id: string
  nome: string
  email: string
  telefone?: string
}

export type { CategoriaCreate, CategoriaUpdate } from './categoria'
export type { Grupo, GrupoCreate, GrupoUpdate } from './grupo'
export type { Cupom, CupomCreate, CupomUpdate } from './cupom'
export type { AjusteEstoque, EntradaEstoque, EstoqueBaixo, EstoqueProduto, EstoqueZerado, HistoricoMovimentacao, MovimentacaoEstoque } from './estoque'

export interface LoginResponse {
  token: string
  usuario: Usuario
}
