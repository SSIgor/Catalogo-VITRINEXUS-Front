export interface Categoria {
  id: string
  empresaId: string
  nome: string
  descricao?: string | null
  imagemUrl?: string | null
  ordem: number
  ativo: boolean
  dataCriacao?: string
}

export interface CategoriaCreate {
  nome: string
  descricao?: string
  imagemUrl?: string
  ordem: number
  ativo: boolean
}

export type CategoriaUpdate = CategoriaCreate
