export interface Cupom {
  id: string
  empresaId: string
  codigo: string
  descontoPercentual: number
  dataValidade: string
  inativo: boolean
  dataCriacao?: string
  dataAtualizacao?: string | null
}

export interface CupomCreate {
  codigo: string
  descontoPercentual: number
  dataValidade: string
  inativo: boolean
}

export type CupomUpdate = CupomCreate
