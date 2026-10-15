import type { FaturamentoDiario } from '../api/dashboard'

export interface DiaFaturamento {
  chave: string
  rotulo: string
  faturamento: number
  quantidadeVendas: number
}

export function saudacaoParaHora(date: Date): string {
  const hour = date.getHours()
  if (hour >= 5 && hour < 12) return 'Bom dia'
  if (hour >= 12 && hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function chaveDataLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function ultimosSeteDias(entries: FaturamentoDiario[], today: Date): DiaFaturamento[] {
  const byDate = new Map(entries.map((entry) => [entry.data.slice(0, 10), entry]))
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (6 - index))
    const chave = chaveDataLocal(date)
    const entry = byDate.get(chave)
    return {
      chave,
      rotulo: new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date).replace('.', ''),
      faturamento: entry?.faturamento ?? 0,
      quantidadeVendas: entry?.quantidadeVendas ?? 0,
    }
  })
}

export function formatarMoedaCompacta(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}
