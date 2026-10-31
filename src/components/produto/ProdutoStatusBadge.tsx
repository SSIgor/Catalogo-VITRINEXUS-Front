import { StatusBadge } from '../ui/StatusBadge'

export function ProdutoStatusBadge({ ativo }: { ativo: boolean }) {
  return <StatusBadge tone={ativo ? 'success' : 'neutral'}>{ativo ? 'Ativo' : 'Inativo'}</StatusBadge>
}

export function EstoqueBadge({ atual, minimo }: { atual: number; minimo: number }) {
  if (atual <= 0) return <StatusBadge tone="danger">Sem estoque</StatusBadge>
  if (atual <= minimo) return <StatusBadge tone="warning">Estoque baixo</StatusBadge>
  return <StatusBadge tone="success">Normal</StatusBadge>
}
