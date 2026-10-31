import { StatusBadge } from '../ui/StatusBadge'

export function ClienteStatusBadge({ ativo }: { ativo: boolean }) {
  return <StatusBadge tone={ativo ? 'success' : 'neutral'}>{ativo ? 'Ativo' : 'Inativo'}</StatusBadge>
}
