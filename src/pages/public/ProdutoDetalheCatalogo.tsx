import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { obterProdutoCatalogo } from '../../api/catalogo'
import { PublicLayout } from '../../components/layout/PublicLayout'
import { messageForApiError } from '../../utils/apiError'
import { useState } from 'react'

export function ProdutoDetalheCatalogo() {
  const { id, slug } = useParams<{ id: string; slug: string }>()
  const navigate = useNavigate()
  const [imagemSelecionada, setImagemSelecionada] = useState(0)

  const produtoQuery = useQuery({
    queryKey: ['catalogo', slug, 'produto', id],
    queryFn: () => (id ? obterProdutoCatalogo(id, slug) : Promise.reject('ID não fornecido')),
    enabled: !!id,
  })

  const produto = produtoQuery.data
  const imagens = produto?.imagens ?? []
  const imagemAtual = imagens[imagemSelecionada]

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
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-paper">
                {imagemAtual?.url ? (
                  <img src={imagemAtual.url} alt={produto.nome} className="h-full w-full object-cover" />
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
                <div className="flex gap-2 overflow-x-auto">
                  {imagens.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setImagemSelecionada(idx)}
                      className={`h-16 w-16 shrink-0 rounded-lg border-2 transition-colors ${
                        idx === imagemSelecionada ? 'border-teal' : 'border-ink/15 hover:border-teal/50'
                      }`}
                    >
                      <img src={img.url} alt={`${produto.nome} ${idx + 1}`} className="h-full w-full object-cover rounded-lg" />
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
                  R$ {produto.preco.toFixed(2).replace('.', ',')}
                </p>

                {produto.descricao && (
                  <div className="mt-6 space-y-4">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-ink/45">Descrição</h2>
                    <p className="leading-relaxed text-ink/55">{produto.descricao}</p>
                  </div>
                )}
              </div>

              {/* Ações */}
              <button className="mt-8 w-full rounded-xl bg-teal py-3.5 text-center font-semibold text-white transition-colors hover:bg-teal/90 disabled:opacity-50">
                Adicionar ao carrinho
              </button>

              <p className="mt-3 text-center text-xs text-ink/50">Funcionalidade disponível em breve</p>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  )
}
