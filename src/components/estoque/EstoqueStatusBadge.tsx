import { StatusBadge } from '../ui/StatusBadge'

export function EstoqueStatusBadge({ atual, minimo }: { atual: number; minimo: number }) {
  if (atual <= 0) return <StatusBadge tone="danger">Sem estoque</StatusBadge>
  if (atual <= minimo) return <StatusBadge tone="warning">Estoque baixo</StatusBadge>
  return <StatusBadge tone="success">Normal</StatusBadge>
}
