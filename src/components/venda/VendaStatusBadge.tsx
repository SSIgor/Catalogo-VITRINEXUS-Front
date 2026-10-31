import { Ban, CheckCircle2, Clock3, Circle } from 'lucide-react'
import type { StatusVenda } from '../../types/venda'
import { StatusBadge } from '../ui/StatusBadge'

export function normalizeStatusVenda(value: unknown): StatusVenda | null {
  if (value === 'Pendente' || value === 'Confirmada' || value === 'Concluida' || value === 'Concluída' || value === 'Cancelada') return value
  return null
}

export function VendaStatusBadge({ status }: { status: unknown }) {
  const normalized = normalizeStatusVenda(status)
  if (normalized === 'Cancelada') return <StatusBadge tone="danger"><Ban size={14} />Cancelada</StatusBadge>
  if (normalized === 'Concluida' || normalized === 'Concluída') return <StatusBadge tone="success"><CheckCircle2 size={14} />Concluída</StatusBadge>
  if (normalized === 'Confirmada') return <StatusBadge tone="info"><CheckCircle2 size={14} />Confirmada</StatusBadge>
  if (normalized === 'Pendente') return <StatusBadge tone="warning"><Clock3 size={14} />Pendente</StatusBadge>
  return <StatusBadge tone="neutral"><Circle size={14} />Venda desconhecida</StatusBadge>
}