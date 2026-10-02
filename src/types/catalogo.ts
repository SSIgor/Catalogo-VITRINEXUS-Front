import type { Categoria } from './categoria'
import type { Grupo } from './grupo'

export interface ImagemProdutoCatalogo {
  id: string
  url: string
  ordem: number
  principal: boolean
}

export interface ProdutoCatalogo {
  id: string
  nome: string
  descricao?: string | null
  preco: number | string
  imagens?: ImagemProdutoCatalogo[] | null
  imagemPrincipal?: ImagemProdutoCatalogo | null
  categoria?: Categoria
  categoriaId?: string
  grupo?: Grupo
  grupoId?: string
  ativo?: boolean
  estoqueAtual?: number | string | null
}

export interface CategoriaCatalogo extends Categoria {}

export interface GrupoCatalogo extends Grupo {}
