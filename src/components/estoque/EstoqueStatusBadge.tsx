export function EstoqueStatusBadge({ atual, minimo }: { atual: number; minimo: number }) {
  if (atual <= 0) return <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">Sem estoque</span>
  if (atual <= minimo) return <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">Estoque baixo</span>
  return <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Normal</span>
}
