export type { Categoria } from './categoria'

export interface ImagemProduto {
  id: string
  produtoId: string
  url: string
  ordem: number
  principal: boolean
  dataCriacao?: string
}

export interface Produto {
  id: string
  empresaId: string
  categoriaId: string
  grupoId: string
  nome: string
  descricao?: string | null
  codigo?: string | null
  preco: number
  estoqueAtual: number
  estoqueMinimo: number
  ativo: boolean
  destaque: boolean
  imagens?: ImagemProduto[] | null
}

export interface ProdutosPaginados {
  items: Produto[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface ProdutoCreate {
  categoriaId: string
  grupoId: string
  nome: string
  descricao?: string
  codigo?: string
  preco: number
  estoqueMinimo: number
  ativo: boolean
  destaque: boolean
}

export type ProdutoUpdate = ProdutoCreate

export interface ReordenarImagem {
  id: string
  ordem: number
}

export interface ReordenarImagens {
  imagens: ReordenarImagem[]
}
