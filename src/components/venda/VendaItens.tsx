import { Package } from 'lucide-react'
import type { VendaItem } from '../../types/venda'
import { money } from '../../utils/format'

export function VendaItens({ itens }: { itens?: VendaItem[] | null }) {
  return <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6"><h2 className="font-display text-lg font-bold">Produtos</h2><div className="mt-5 divide-y divide-ink/10">{itens?.map((item, index) => { const unit = item.precoUnitario ?? 0; const subtotal = item.subtotal ?? unit * item.quantidade; const name = item.nomeProduto ?? item.produto?.nome ?? 'Produto não informado'; const image = item.imagemUrl ?? item.produto?.imagemUrl; return <div key={item.id ?? `${item.produtoId}-${index}`} className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"><div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-mint text-teal">{image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <Package size={18} />}</div><div className="min-w-0 flex-1"><p className="truncate font-semibold">{name}</p><p className="mt-1 text-sm text-ink/50">{item.quantidade} × {money.format(unit)}</p></div><strong className="font-display">{money.format(subtotal)}</strong></div> })}{(!itens || itens.length === 0) && <p className="py-4 text-sm text-ink/50">Nenhum item informado.</p>}</div></section>
}
