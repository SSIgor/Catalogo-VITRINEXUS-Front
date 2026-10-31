import type { CupomStatus } from '../../utils/cupomStatus'
import { StatusBadge } from '../ui/StatusBadge'

const badgeToneByStatus = {
  Ativo: 'success',
  Inativo: 'neutral',
  Expirado: 'danger',
} as const

export function CupomStatusBadge({ status }: { status: CupomStatus }) {
  return <StatusBadge tone={badgeToneByStatus[status]}>{status}</StatusBadge>
}
