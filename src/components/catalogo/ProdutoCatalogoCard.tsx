import { useNavigate, useParams } from 'react-router-dom'
import type { ProdutoCatalogo } from '../../types/catalogo'
import { Minus, Plus, ShoppingBag } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { canIncreaseQuantity, getEstoqueBaixoLabel, getProdutoButtonLabel, isProdutoDisponivel, normalizarAtivo, normalizarEstoque } from '../../utils/catalogoDisponibilidade'
import { getImagemPrincipalCatalogo } from '../../utils/catalogoImagens'

export function ProdutoCatalogoCard({ produto }: { produto: ProdutoCatalogo }) {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { items, addItem, updateQuantity } = useCart()
  const imagemPrincipal = getImagemPrincipalCatalogo(produto)
  const itemNoCarrinho = items.find((item) => item.id === produto.id)
  const quantidadeNoCarrinho = itemNoCarrinho?.quantidade ?? 0
  const preco = Number(produto.preco ?? 0)
  const ativo = normalizarAtivo(produto.ativo)
  const estoqueDisponivel = normalizarEstoque(produto.estoqueAtual)
  const produtoDisponivel = isProdutoDisponivel({ ativo: produto.ativo, estoqueAtual: produto.estoqueAtual })
  const estoqueBaixoTexto = produtoDisponivel ? getEstoqueBaixoLabel(produto.estoqueAtual) : null

  const handleVerProduto = () => {
    navigate(`/catalogo/${slug}/produto/${produto.id}`)
  }

  const handleAdicionarAoCarrinho = () => {
    if (!ativo) {
      window.alert('Este produto está indisponível no momento.')
      return
    }

    if (estoqueDisponivel <= 0) {
      window.alert('Produto sem estoque no momento.')
      return
    }

    addItem({
      id: produto.id,
      nome: produto.nome,
      imagem: imagemPrincipal?.url,
      preco,
      estoqueAtual: estoqueDisponivel,
      ativo,
    })
  }

  return (
    <article className="group h-full overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md">
      {/* Imagem */}
      <div className="relative aspect-[4/4.4] w-full overflow-hidden bg-paper p-3 sm:p-4">
        {imagemPrincipal?.url ? (
          <img
            src={imagemPrincipal.url}
            alt={produto.nome}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
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
          <p className="font-display text-xl font-bold text-teal">R$ {preco.toFixed(2).replace('.', ',')}</p>
        </div>

        {estoqueBaixoTexto && (
          <div className="mt-3 inline-flex w-fit rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
            {estoqueBaixoTexto}
          </div>
        )}

        {!produtoDisponivel && (
          <div className="mt-3 inline-flex w-fit rounded-full bg-ink/5 px-2.5 py-1 text-xs font-semibold text-ink/55">
            {getProdutoButtonLabel({ ativo: produto.ativo, estoqueAtual: produto.estoqueAtual })}
          </div>
        )}

        {quantidadeNoCarrinho > 0 ? (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-ink/15 bg-paper px-2 py-2">
            <button
              type="button"
              onClick={() => updateQuantity(produto.id, quantidadeNoCarrinho - 1)}
              className="grid h-9 w-9 place-items-center rounded-md text-ink/65 hover:bg-white hover:text-teal"
              aria-label={`Diminuir quantidade de ${produto.nome}`}
            >
              <Minus size={16} />
            </button>
            <span className="min-w-10 text-center text-sm font-semibold text-ink">{quantidadeNoCarrinho}</span>
            <button
              type="button"
              onClick={() => updateQuantity(produto.id, quantidadeNoCarrinho + 1)}
              disabled={!canIncreaseQuantity(quantidadeNoCarrinho, estoqueDisponivel)}
              className="grid h-9 w-9 place-items-center rounded-md text-ink/65 hover:bg-white hover:text-teal disabled:cursor-not-allowed disabled:text-ink/30"
              aria-label={`Aumentar quantidade de ${produto.nome}`}
            >
              <Plus size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAdicionarAoCarrinho}
            disabled={!produtoDisponivel}
            className="mt-4 w-full rounded-lg bg-teal px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal/90 disabled:cursor-not-allowed disabled:bg-ink/10 disabled:text-ink/40"
          >
            {getProdutoButtonLabel({ ativo: produto.ativo, estoqueAtual: produto.estoqueAtual })}
          </button>
        )}

        <button
          type="button"
          onClick={handleVerProduto}
          className="mt-3 w-full rounded-lg bg-teal/10 py-2.5 text-sm font-semibold text-teal transition-colors hover:bg-teal/20"
        >
          Ver produto
        </button>
      </div>
    </article>
  )
}
