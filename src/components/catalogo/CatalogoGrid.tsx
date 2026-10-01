import type { ProdutoCatalogo } from '../../types/catalogo'
import { ProdutoCatalogoCard } from './ProdutoCatalogoCard'
import { ShoppingBag } from 'lucide-react'

export function CatalogoGrid({ produtos }: { produtos: ProdutoCatalogo[] }) {
  if (produtos.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-ink/20 bg-paper p-12 text-center">
        <ShoppingBag className="mx-auto text-ink/25" size={40} />
        <p className="mt-4 text-sm text-ink/50">Nenhum produto encontrado.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {produtos.map((produto) => (
        <ProdutoCatalogoCard key={produto.id} produto={produto} />
      ))}
    </div>
  )
}
