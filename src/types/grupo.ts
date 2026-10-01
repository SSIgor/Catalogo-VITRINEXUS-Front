export interface Grupo {
  id: string
  empresaId: string
  nome: string
  descricao?: string | null
  ordem: number
  ativo: boolean
  quantidadeProdutos?: number
  dataCriacao?: string
  dataAtualizacao?: string | null
}

export interface GrupoCreate {
  nome: string
  descricao?: string
  ordem: number
  ativo: boolean
}

export type GrupoUpdate = GrupoCreate
