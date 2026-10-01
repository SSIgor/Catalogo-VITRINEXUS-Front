import { CircleCheck, Clock3 } from 'lucide-react'
import type { StatusPagamento } from '../../types/venda'

export function normalizeStatusPagamento(value: unknown): StatusPagamento | null {
  if (value === 'Pendente' || value === 'Pago') return value
  return null
}

export function StatusPagamentoBadge({ status }: { status: unknown }) {
  const normalized = normalizeStatusPagamento(status)
  if (normalized === 'Pago') return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700"><CircleCheck size={14} />Pago</span>
  if (normalized === 'Pendente') return <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700"><Clock3 size={14} />Pendente</span>
  return <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/10 px-2.5 py-1 text-xs font-semibold text-ink/55">Pagamento desconhecido</span>
}