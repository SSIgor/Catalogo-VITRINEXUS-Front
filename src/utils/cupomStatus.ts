export type CupomStatus = 'Ativo' | 'Inativo' | 'Expirado'

export function normalizarCodigoCupom(valor: string): string {
  return valor.trim().toUpperCase().replace(/\s+/g, '')
}

export function getCupomStatus({ inativo, dataValidade }: { inativo?: boolean | null; dataValidade?: string | null }): CupomStatus {
  if (inativo) return 'Inativo'

  if (!dataValidade) return 'Ativo'

  const validade = new Date(dataValidade)
  if (!Number.isNaN(validade.getTime()) && validade.getTime() < Date.now()) return 'Expirado'

  return 'Ativo'
}
