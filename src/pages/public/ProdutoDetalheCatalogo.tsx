import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, RotateCw, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react'
import { obterProdutoCatalogo } from '../../api/catalogo'
import { PublicLayout } from '../../components/layout/PublicLayout'
import { useCart } from '../../contexts/CartContext'
import { messageForApiError } from '../../utils/apiError'
import { canIncreaseQuantity, getProdutoButtonLabel, isProdutoDisponivel, normalizarAtivo, normalizarEstoque } from '../../utils/catalogoDisponibilidade'
import { getImagemPrincipalCatalogo, ordenarImagensGaleria } from '../../utils/catalogoImagens'
import { useEffect, useState } from 'react'

export function ProdutoDetalheCatalogo() {
  const { id, slug } = useParams<{ id: string; slug: string }>()
  const navigate = useNavigate()
  const [imagemSelecionada, setImagemSelecionada] = useState(0)
  const { items, addItem, updateQuantity } = useCart()

  const produtoQuery = useQuery({
    queryKey: ['catalogo', slug, 'produto', id],
    queryFn: () => (id ? obterProdutoCatalogo(id, slug) : Promise.reject('ID não fornecido')),
    enabled: !!id,
  })

  const produto = produtoQuery.data
  const imagemPrincipal = getImagemPrincipalCatalogo(produto)
  const imagens = ordenarImagensGaleria(produto)

  useEffect(() => {
    setImagemSelecionada(0)
  }, [produto?.id])

  const imagemAtual = imagens[imagemSelecionada] ?? imagemPrincipal ?? null
  const itemNoCarrinho = items.find((item) => item.id === produto?.id)
  const quantidadeNoCarrinho = itemNoCarrinho?.quantidade ?? 0
  const preco = Number(produto?.preco ?? 0)
  const ativo = produto ? normalizarAtivo(produto.ativo) : true
  const estoqueDisponivel = produto ? normalizarEstoque(produto.estoqueAtual) : Number.POSITIVE_INFINITY
  const produtoDisponivel = produto ? isProdutoDisponivel({ ativo: produto.ativo, estoqueAtual: produto.estoqueAtual }) : false

  const handleProxima = () => {
    if (imagemSelecionada < imagens.length - 1) {
      setImagemSelecionada(imagemSelecionada + 1)
    }
  }

  const handleAnterior = () => {
    if (imagemSelecionada > 0) {
      setImagemSelecionada(imagemSelecionada - 1)
    }
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        {/* Botão voltar */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-lg border border-ink/15 px-4 py-2 text-sm font-semibold hover:bg-paper"
        >
          <ArrowLeft size={18} />
          Voltar
        </button>

        {/* Erro */}
        {produtoQuery.error && (
          <div className="space-y-3 rounded-xl bg-rose-50 p-4 text-rose-700">
            <p className="font-semibold">Erro ao carregar produto</p>
            <p className="text-sm">{messageForApiError(produtoQuery.error, 'Produto não encontrado.')}</p>
            <button
              onClick={() => produtoQuery.refetch()}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-100 px-4 py-2 text-sm font-semibold hover:bg-rose-200"
            >
              <RotateCw size={16} />
              Tentar novamente
            </button>
          </div>
        )}

        {/* Carregando */}
        {produtoQuery.isLoading && (
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="aspect-square rounded-2xl bg-paper animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 w-64 rounded-lg bg-paper animate-pulse" />
              <div className="h-4 w-40 rounded-lg bg-paper animate-pulse" />
              <div className="h-4 w-48 rounded-lg bg-paper animate-pulse" />
            </div>
          </div>
        )}

        {/* Produto */}
        {produto && (
          <div className="grid gap-8 sm:grid-cols-2">
            {/* Galeria */}
            <div className="space-y-4">
              <div className="relative flex aspect-[4/4.4] w-full items-center justify-center overflow-hidden rounded-2xl bg-paper p-4 sm:p-5">
                {imagemAtual?.url ? (
                  <img src={imagemAtual.url} alt={produto.nome} className="h-full w-full object-contain" />
                ) : (
                  <div className="flex h-full items-center justify-center text-ink/15">Sem imagem</div>
                )}

                {/* Navegação */}
                {imagens.length > 1 && (
                  <>
                    <button
                      onClick={handleAnterior}
                      disabled={imagemSelecionada === 0}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white transition-colors hover:bg-black/50 disabled:opacity-30"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={handleProxima}
                      disabled={imagemSelecionada === imagens.length - 1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white transition-colors hover:bg-black/50 disabled:opacity-30"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Miniaturas */}
              {imagens.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {imagens.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setImagemSelecionada(idx)}
                      className={`h-18 w-18 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-paper p-1 transition-colors ${
                        idx === imagemSelecionada ? 'border-teal' : 'border-ink/15 hover:border-teal/50'
                      }`}
                    >
                      <img src={img.url} alt={`${produto.nome} ${idx + 1}`} className="h-full w-full rounded-md object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Detalhes */}
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="font-display text-4xl font-bold text-ink">{produto.nome}</h1>

                <div className="mt-3 flex gap-2 text-sm text-ink/55">
                  {produto.categoria?.nome && <span>{produto.categoria.nome}</span>}
                  {produto.categoria?.nome && produto.grupo?.nome && <span>•</span>}
                  {produto.grupo?.nome && <span>{produto.grupo.nome}</span>}
                </div>

                <p className="mt-8 font-display text-3xl font-bold text-teal">
                  R$ {preco.toFixed(2).replace('.', ',')}
                </p>

                {produto.descricao && (
                  <div className="mt-6 space-y-4">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-ink/45">Descrição</h2>
                    <p className="leading-relaxed text-ink/55">{produto.descricao}</p>
                  </div>
                )}
              </div>

              {/* Ações */}
              {produtoDisponivel ? (
                quantidadeNoCarrinho > 0 ? (
                  <div className="mt-8 flex items-center justify-center gap-3 rounded-xl border border-ink/15 bg-paper px-4 py-3">
                    <button
                      type="button"
                      onClick={() => updateQuantity(produto.id, quantidadeNoCarrinho - 1)}
                      className="grid h-10 w-10 place-items-center rounded-lg bg-white text-ink/70 hover:text-teal"
                      aria-label={`Diminuir quantidade de ${produto.nome}`}
                    >
                      <Minus size={18} />
                    </button>
                    <span className="min-w-10 text-center text-lg font-semibold text-ink">{quantidadeNoCarrinho}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(produto.id, quantidadeNoCarrinho + 1)}
                      disabled={!canIncreaseQuantity(quantidadeNoCarrinho, estoqueDisponivel)}
                      className="grid h-10 w-10 place-items-center rounded-lg bg-white text-ink/70 hover:text-teal disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Aumentar quantidade de ${produto.nome}`}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      addItem({
                        id: produto.id,
                        nome: produto.nome,
                        imagem: imagemPrincipal?.url ?? imagemAtual?.url ?? null,
                        preco,
                        estoqueAtual: estoqueDisponivel,
                        ativo,
                      })
                    }
                    className="mt-8 w-full rounded-xl bg-teal py-3.5 text-center font-semibold text-white transition-colors hover:bg-teal/90"
                  >
                    Adicionar ao carrinho
                  </button>
                )
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-8 w-full rounded-xl bg-ink/10 px-4 py-3 text-center text-sm font-semibold text-ink/45 disabled:cursor-not-allowed"
                >
                  {getProdutoButtonLabel({ ativo: produto.ativo, estoqueAtual: produto.estoqueAtual })}
                </button>
              )}

              <button
                type="button"
                onClick={() => navigate(`/catalogo/${slug}/carrinho`)}
                className="mt-3 w-full rounded-xl border border-ink/15 bg-white py-3 text-sm font-semibold text-ink/70 transition-colors hover:border-teal hover:text-teal"
              >
                Ver carrinho
              </button>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  )
}
