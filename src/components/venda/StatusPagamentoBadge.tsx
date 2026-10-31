import { CircleCheck, Clock3 } from 'lucide-react'
import type { StatusPagamento } from '../../types/venda'
import { StatusBadge } from '../ui/StatusBadge'

export function normalizeStatusPagamento(value: unknown): StatusPagamento | null {
  if (value === 'Pendente' || value === 'Pago') return value
  return null
}

export function StatusPagamentoBadge({ status }: { status: unknown }) {
  const normalized = normalizeStatusPagamento(status)
  if (normalized === 'Pago') return <StatusBadge tone="success"><CircleCheck size={14} />Pago</StatusBadge>
  if (normalized === 'Pendente') return <StatusBadge tone="warning"><Clock3 size={14} />Pendente</StatusBadge>
  return <StatusBadge tone="neutral">Pagamento desconhecido</StatusBadge>
}