export const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatDate(value?: string) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

export function vendaLabel(numero?: number, id?: string) {
  if (numero !== undefined) return `#${String(numero).padStart(6, '0')}`
  return id ? `#${id.slice(0, 6).toUpperCase()}` : 'Venda'
}
