import type { CupomStatus } from '../../utils/cupomStatus'

const badgeClassByStatus: Record<CupomStatus, string> = {
  Ativo: 'bg-emerald-100 text-emerald-700',
  Inativo: 'bg-ink/10 text-ink/55',
  Expirado: 'bg-rose-100 text-rose-700',
}

export function CupomStatusBadge({ status }: { status: CupomStatus }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClassByStatus[status]}`}>{status}</span>
}
