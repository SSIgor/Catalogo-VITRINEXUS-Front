import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { normalizarAtivo } from '../../utils/catalogoDisponibilidade'

export function Carrinho() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const {
    items,
    subtotal,
    desconto,
    total,
    itemCount,
    coupon,
    couponError,
    isApplyingCoupon,
    updateQuantity,
    removeItem,
    aplicarCupom,
    removerCupom,
    limparErroCupom,
  } = useCart()
  const [codigoCupom, setCodigoCupom] = useState('')

  const voltarAoCatalogo = () => {
    if (slug) {
      navigate(`/catalogo/${slug}`)
      return
    }

    navigate('/login')
  }

  const hasUnavailableItems = items.some((item) => {
    const itemAtivo = normalizarAtivo(item.ativo)
    const itemInvalido = !itemAtivo || item.estoqueAtual <= 0 || item.quantidade > item.estoqueAtual || item.disponivel === false
    return itemInvalido
  })

  const temItemSemEstoque = items.some((item) => item.estoqueAtual <= 0 || item.quantidade > item.estoqueAtual || item.disponivel === false)

  const finalizarPedido = () => {
    if (hasUnavailableItems) {
      window.alert('Há produtos sem estoque no seu carrinho.')
      return
    }

    if (!slug) {
      navigate('/login')
      return
    }

    navigate(`/catalogo/${slug}/checkout`)
  }

  const handleAplicarCupom = async () => {
    const aplicado = await aplicarCupom(codigoCupom)

    if (aplicado) {
      setCodigoCupom('')
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <div className="mb-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={voltarAoCatalogo}
          className="inline-flex items-center gap-2 rounded-lg border border-ink/15 bg-white px-4 py-2 text-sm font-semibold text-ink/70 hover:border-teal hover:text-teal"
        >
          <ArrowLeft size={16} />
          Continuar comprando
        </button>
      </div>

      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">Carrinho</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink">{items.length === 0 ? 'Seu carrinho' : `${itemCount} item${itemCount === 1 ? '' : 's'}`}</h1>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-ink/20 bg-white p-10 text-center shadow-sm">
          <ShoppingBag className="mx-auto text-ink/20" size={48} />
          <h2 className="mt-5 font-display text-2xl font-bold text-ink">Seu carrinho está vazio</h2>
          <p className="mt-2 text-ink/55">Adicione produtos ao seu carrinho para continuar.</p>
          <button
            type="button"
            onClick={voltarAoCatalogo}
            className="mt-6 rounded-xl bg-teal px-5 py-3 text-sm font-semibold text-white hover:bg-teal/90"
          >
            Ver produtos
          </button>
        </div>
      ) : (
        <>
          {hasUnavailableItems && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
              Há produtos sem estoque no seu carrinho.
            </div>
          )}

          <div className="mb-6 rounded-2xl border border-ink/10 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-semibold text-ink">Cupom de desconto</h2>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={codigoCupom}
                onChange={(event) => {
                  setCodigoCupom(event.target.value)
                  if (couponError) limparErroCupom()
                }}
                placeholder="Digite seu cupom"
                className="flex-1 rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-teal focus:ring-4 focus:ring-teal/10"
              />
              <button
                type="button"
                onClick={handleAplicarCupom}
                disabled={isApplyingCoupon || !codigoCupom.trim()}
                className="rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isApplyingCoupon ? 'Aplicando...' : 'Aplicar'}
              </button>
            </div>

            {coupon && coupon.valido ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                ✓ Cupom {coupon.codigo} aplicado — {coupon.descontoPercentual}% OFF
              </div>
            ) : null}

            {couponError && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                {couponError}
              </div>
            )}

            {coupon && coupon.valido ? (
              <button
                type="button"
                onClick={removerCupom}
                className="mt-3 text-sm font-semibold text-ink/60 underline-offset-2 hover:text-teal hover:underline"
              >
                Remover cupom
              </button>
            ) : null}
          </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
          <div className="space-y-4">
            {items.map((item) => {
              const quantidadeMaxima = Number.isFinite(item.estoqueAtual) ? item.estoqueAtual : Number.POSITIVE_INFINITY
              const itemAtivo = normalizarAtivo(item.ativo)
              const itemDisponivel = typeof item.disponivel === 'boolean' ? item.disponivel : item.estoqueAtual > 0 && item.quantidade <= item.estoqueAtual && itemAtivo
              const mensagemItem = item.mensagem ?? (item.estoqueAtual <= 0 ? 'Produto sem estoque' : item.quantidade > item.estoqueAtual ? `Estoque insuficiente. Disponível: ${item.estoqueAtual}` : !itemAtivo ? 'Produto indisponível' : null)

              return (
                <div key={item.id} className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex gap-4">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-paper p-2 sm:h-28 sm:w-28">
                      {item.imagem ? (
                        <img src={item.imagem} alt={item.nome} className="h-full w-full object-contain" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-ink/15">
                          <ShoppingBag size={28} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-semibold text-ink">{item.nome}</h2>
                          <p className="mt-1 text-sm text-ink/55">
                            R$ {item.preco.toFixed(2).replace('.', ',')} cada
                          </p>
                        </div>

                        <div className="flex items-center gap-3 self-start sm:self-auto">
                          <div className="flex items-center rounded-xl border border-ink/15 bg-paper">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                              className="grid h-10 w-10 place-items-center text-ink/65 transition-colors hover:text-teal"
                              aria-label={`Diminuir quantidade de ${item.nome}`}
                            >
                              <Minus size={16} />
                            </button>
                            <span className="min-w-10 text-center text-sm font-semibold text-ink">{item.quantidade}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                              disabled={!Number.isFinite(quantidadeMaxima) || item.quantidade >= quantidadeMaxima}
                              className="grid h-10 w-10 place-items-center text-ink/65 transition-colors hover:text-teal disabled:cursor-not-allowed disabled:text-ink/30"
                              aria-label={`Aumentar quantidade de ${item.nome}`}
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
                          >
                            <Trash2 size={16} />
                            Remover
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-ink/60">
                          {item.quantidade} × R$ {item.preco.toFixed(2).replace('.', ',')}
                        </p>

                        <p className="text-sm font-semibold text-ink/70">
                          Subtotal: <span className="text-base text-teal">R$ {item.subtotal.toFixed(2).replace('.', ',')}</span>
                        </p>
                      </div>

                      {mensagemItem && (
                        <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
                          {mensagemItem}
                        </div>
                      )}

                      {!itemDisponivel && item.quantidade > item.estoqueAtual && item.estoqueAtual > 0 && (
                        <div className="mt-2 text-xs font-medium text-amber-700">
                          Quantidade solicitada maior que o estoque disponível.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <aside className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-ink">Resumo do pedido</h2>

            <div className="mt-5 space-y-3 text-sm text-ink/60">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{coupon && coupon.valido ? `Desconto (${coupon.codigo} - ${coupon.descontoPercentual}%)` : 'Desconto'}</span>
                <span>-R$ {desconto.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex items-center justify-between border-t border-ink/10 pt-3 text-base font-semibold text-ink">
                <span>Total</span>
                <span>R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            {hasUnavailableItems && (
              <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
                Há produtos sem estoque no seu carrinho.
              </div>
            )}

            <button
              type="button"
              onClick={finalizarPedido}
              className="mt-6 w-full rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal/90 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={items.length === 0 || hasUnavailableItems}
            >
              FINALIZAR PEDIDO
            </button>

            <Link
              to={slug ? `/catalogo/${slug}` : '/catalogo'}
              className="mt-3 block w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-center text-sm font-semibold text-ink/70 hover:border-teal hover:text-teal"
            >
              Continuar comprando
            </Link>
          </aside>
        </div>
        </>
      )}
    </div>
  )
}
