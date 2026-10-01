import { useNavigate, useParams } from 'react-router-dom'
import type { ProdutoCatalogo } from '../../types/catalogo'
import { ShoppingBag } from 'lucide-react'

export function ProdutoCatalogoCard({ produto }: { produto: ProdutoCatalogo }) {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const imagemPrincipal = produto.imagens?.find((img) => img.principal) ?? produto.imagens?.[0]

  const handleVerProduto = () => {
    navigate(`/catalogo/${slug}/produto/${produto.id}`)
  }

  return (
    <article className="group h-full overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md">
      {/* Imagem */}
      <div className="aspect-square overflow-hidden bg-paper">
        {imagemPrincipal?.url ? (
          <img
            src={imagemPrincipal.url}
            alt={produto.nome}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingBag className="text-ink/15" size={48} />
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col p-4 sm:p-5">
        <h3 className="font-semibold text-ink">{produto.nome}</h3>

        <div className="mt-1 text-sm text-ink/55">
          {produto.categoria?.nome && <span>{produto.categoria.nome}</span>}
          {produto.categoria?.nome && produto.grupo?.nome && <span> • </span>}
          {produto.grupo?.nome && <span>{produto.grupo.nome}</span>}
        </div>

        <div className="mt-3 flex items-end justify-between gap-2">
          <p className="font-display text-xl font-bold text-teal">R$ {produto.preco.toFixed(2).replace('.', ',')}</p>
        </div>

        <button
          onClick={handleVerProduto}
          className="mt-4 w-full rounded-lg bg-teal/10 py-2.5 text-sm font-semibold text-teal transition-colors hover:bg-teal/20"
        >
          Ver produto
        </button>
      </div>
    </article>
  )
}
