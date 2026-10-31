import { StatusBadge } from '../ui/StatusBadge'

export function CategoriaStatusBadge({ ativo }: { ativo: boolean }) {
  return <StatusBadge tone={ativo ? 'success' : 'neutral'}>{ativo ? 'Ativa' : 'Inativa'}</StatusBadge>
}
