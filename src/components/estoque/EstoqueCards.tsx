import { AlertTriangle, Boxes, CircleOff } from 'lucide-react'

interface Props { total: number; baixo: number; zerado: number; loading: boolean }
export function EstoqueCards({ total, baixo, zerado, loading }: Props) {
  const cards = [{ label: 'Produtos', value: total, icon: Boxes, color: 'bg-teal' }, { label: 'Estoque baixo', value: baixo, icon: AlertTriangle, color: 'bg-amber-500' }, { label: 'Sem estoque', value: zerado, icon: CircleOff, color: 'bg-coral' }]
  return <section className="grid gap-4 sm:grid-cols-3">{cards.map(({ label, value, icon: Icon, color }) => <article key={label} className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm"><div><p className="text-xs font-semibold uppercase tracking-widest text-ink/45">{label}</p><p className="mt-2 font-display text-3xl font-bold">{loading ? '...' : value}</p></div><div className={`grid h-11 w-11 place-items-center rounded-xl text-white ${color}`}><Icon size={20} /></div></article>)}</section>
}
