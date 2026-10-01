import { Ban, CheckCircle2, Clock3, Circle } from 'lucide-react'
import type { StatusVenda } from '../../types/venda'

export function normalizeStatusVenda(value: unknown): StatusVenda | null {
  if (value === 'Pendente' || value === 'Confirmada' || value === 'Concluida' || value === 'Concluída' || value === 'Cancelada') return value
  return null
}

export function VendaStatusBadge({ status }: { status: unknown }) {
  const normalized = normalizeStatusVenda(status)
  if (normalized === 'Cancelada') return <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700"><Ban size={14} />Cancelada</span>
  if (normalized === 'Concluida' || normalized === 'Concluída') return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700"><CheckCircle2 size={14} />Concluída</span>
  if (normalized === 'Confirmada') return <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700"><CheckCircle2 size={14} />Confirmada</span>
  if (normalized === 'Pendente') return <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700"><Clock3 size={14} />Pendente</span>
  return <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/10 px-2.5 py-1 text-xs font-semibold text-ink/55"><Circle size={14} />Venda desconhecida</span>
}