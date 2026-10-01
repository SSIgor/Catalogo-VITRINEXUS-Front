export function ProdutoStatusBadge({ ativo }: { ativo: boolean }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-ink/10 text-ink/55'}`}>{ativo ? 'Ativo' : 'Inativo'}</span>
}

export function EstoqueBadge({ atual, minimo }: { atual: number; minimo: number }) {
  if (atual <= 0) return <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">Sem estoque</span>
  if (atual <= minimo) return <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">Estoque baixo</span>
  return <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Normal</span>
}
