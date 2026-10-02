import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { listarProdutosCatalogo, validarCupomCatalogo } from '../api/catalogo'
import { getCartItemStatus, normalizarAtivo, normalizarEstoque } from '../utils/catalogoDisponibilidade'
import { normalizarCodigoCupom } from '../utils/cupomStatus'

export interface CartCoupon {
  codigo: string
  descontoPercentual: number
  motivo?: string | null
  valido: boolean
}

export interface CartItem {
  id: string
  nome: string
  imagem?: string
  preco: number
  quantidade: number
  subtotal: number
  estoqueAtual: number
  ativo?: boolean
  disponivel?: boolean
  mensagem?: string | null
}

interface CartProduct {
  id: string
  nome: string
  imagem?: string
  preco: number
  estoqueAtual: number
  ativo?: boolean
}

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  subtotal: number
  desconto: number
  total: number
  cartKey: string
  coupon: CartCoupon | null
  couponError: string | null
  isApplyingCoupon: boolean
  addItem: (produto: CartProduct) => void
  updateQuantity: (produtoId: string, quantidade: number) => void
  removeItem: (produtoId: string) => void
  clearCart: () => void
  refreshAvailability: () => Promise<void>
  aplicarCupom: (codigo: string) => Promise<boolean>
  removerCupom: () => void
  limparErroCupom: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

function getCartKey(slug?: string) {
  return slug ? `cart_${slug}` : 'cart'
}

function normalizeStoredCartItem(item: unknown): CartItem | null {
  if (typeof item !== 'object' || item === null) return null

  const candidate = item as Record<string, unknown>
  if (typeof candidate.id !== 'string') return null

  const preco = Number(candidate.preco ?? 0)
  const quantidade = Number(candidate.quantidade ?? 0)
  const estoqueAtual = Number(candidate.estoqueAtual ?? Number.POSITIVE_INFINITY)
  const safeQuantidade = Number.isFinite(estoqueAtual)
    ? Math.min(Math.max(quantidade, 0), estoqueAtual)
    : Math.max(quantidade, 0)

  return {
    id: candidate.id,
    nome: typeof candidate.nome === 'string' ? candidate.nome : 'Produto',
    imagem: typeof candidate.imagem === 'string' ? candidate.imagem : undefined,
    preco: Number.isFinite(preco) ? preco : 0,
    quantidade: safeQuantidade,
    subtotal: Number.isFinite(preco) ? preco * safeQuantidade : 0,
    estoqueAtual: Number.isFinite(estoqueAtual) ? estoqueAtual : Number.POSITIVE_INFINITY,
    ativo: typeof candidate.ativo === 'boolean' ? candidate.ativo : undefined,
    disponivel: typeof candidate.disponivel === 'boolean' ? candidate.disponivel : undefined,
    mensagem: typeof candidate.mensagem === 'string' ? candidate.mensagem : null,
  }
}

function readCartState(slug?: string): { items: CartItem[]; coupon: CartCoupon | null } {
  if (typeof window === 'undefined') return { items: [], coupon: null }

  try {
    const cartKey = getCartKey(slug)
    const stored = window.localStorage.getItem(cartKey)
    if (!stored) return { items: [], coupon: null }

    const parsed = JSON.parse(stored)

    if (Array.isArray(parsed)) {
      return {
        items: parsed.map(normalizeStoredCartItem).filter((item): item is CartItem => item !== null),
        coupon: null,
      }
    }

    const items = Array.isArray(parsed?.items)
      ? parsed.items.map(normalizeStoredCartItem).filter((item: CartItem | null): item is CartItem => item !== null)
      : []

    const coupon = parsed?.coupon && typeof parsed.coupon === 'object' ? parsed.coupon as CartCoupon : null

    return { items, coupon }
  } catch {
    return { items: [], coupon: null }
  }
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function mapCouponError(motivo?: string | null): string {
  switch (motivo) {
    case 'CUPOM_NAO_ENCONTRADO':
      return 'Esse cupom não existe.'
    case 'CUPOM_INATIVO':
      return 'Esse cupom está inativo.'
    case 'CUPOM_EXPIRADO':
      return 'Esse cupom está expirado.'
    case 'CUPOM_INVALIDO':
      return 'Esse cupom não é válido.'
    default:
      return 'Não foi possível aplicar o cupom.'
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const slug = location.pathname.match(/^\/catalogo\/([^/]+)/)?.[1]
  const cartKey = getCartKey(slug)

  const initialCartState = readCartState(slug)
  const [items, setItems] = useState<CartItem[]>(() => initialCartState.items)
  const [coupon, setCoupon] = useState<CartCoupon | null>(() => initialCartState.coupon)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

  const refreshAvailability = useCallback(async () => {
    if (!slug) return

    try {
      const produtos = await listarProdutosCatalogo(slug)
      const catalogoPorId = new Map(produtos.map((produto) => [produto.id, produto]))

      setItems((current) =>
        current.map((item) => {
          const produtoAtual = catalogoPorId.get(item.id)

          if (!produtoAtual) {
            return {
              ...item,
              ativo: false,
              estoqueAtual: 0,
              disponivel: false,
              mensagem: 'Produto indisponível',
            }
          }

          const status = getCartItemStatus({
            ativo: produtoAtual.ativo,
            estoqueAtual: produtoAtual.estoqueAtual,
            quantidadeSolicitada: item.quantidade,
          })

          return {
            ...item,
            ativo: normalizarAtivo(produtoAtual.ativo),
            estoqueAtual: status.estoqueDisponivel,
            disponivel: status.disponivel,
            mensagem: status.mensagem,
          }
        })
      )
    } catch {
      // A validação é reexecutada em momentos específicos; ignoramos falhas para não quebrar o carrinho
    }
  }, [slug])

  useEffect(() => {
    const nextState = readCartState(slug)
    setItems(nextState.items)
    setCoupon(nextState.coupon)
    setCouponError(null)
  }, [slug])

  useEffect(() => {
    void refreshAvailability()
  }, [slug])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(cartKey, JSON.stringify({ items, coupon }))
  }, [items, coupon, cartKey])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleFocus = () => {
      void refreshAvailability()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refreshAvailability])

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantidade, 0),
    [items]
  )

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.preco * item.quantidade, 0),
    [items]
  )

  const desconto = useMemo(() => {
    if (!coupon || !coupon.valido) return 0
    return roundCurrency(subtotal * (coupon.descontoPercentual / 100))
  }, [coupon, subtotal])

  const total = useMemo(() => roundCurrency(subtotal - desconto), [subtotal, desconto])

  const aplicarCupom = useCallback(async (codigoInformado: string) => {
    if (!slug) return false

    const codigo = normalizarCodigoCupom(codigoInformado)
    if (!codigo) {
      setCouponError('Informe um cupom para continuar.')
      return false
    }

    setIsApplyingCoupon(true)
    setCouponError(null)

    try {
      const resposta = await validarCupomCatalogo(slug, codigo)

      if (!resposta.valido) {
        setCoupon(null)
        setCouponError(mapCouponError(resposta.motivo))
        setIsApplyingCoupon(false)
        return false
      }

      const cupomValido: CartCoupon = {
        codigo: resposta.codigo || codigo,
        descontoPercentual: Number(resposta.descontoPercentual ?? 0),
        motivo: null,
        valido: true,
      }

      setCoupon(cupomValido)
      setCouponError(null)
      setIsApplyingCoupon(false)
      return true
    } catch {
      setCoupon(null)
      setCouponError('Não foi possível validar este cupom no momento.')
      setIsApplyingCoupon(false)
      return false
    }
  }, [slug])

  const removerCupom = useCallback(() => {
    setCoupon(null)
    setCouponError(null)
  }, [])

  const limparErroCupom = useCallback(() => {
    setCouponError(null)
  }, [])

  useEffect(() => {
    if (!slug || !coupon || !coupon.valido) return

    const revalidarCupom = async () => {
      try {
        const resposta = await validarCupomCatalogo(slug, coupon.codigo)

        if (!resposta.valido) {
          setCoupon(null)
          setCouponError(mapCouponError(resposta.motivo))
        }
      } catch {
        setCoupon(null)
        setCouponError('O cupom salvo não pôde ser validado neste momento.')
      }
    }

    void revalidarCupom()
  }, [slug, coupon?.codigo])

  const addItem = (produto: CartProduct) => {
    const ativo = normalizarAtivo(produto.ativo)
    const estoqueDisponivel = normalizarEstoque(produto.estoqueAtual)

    if (!ativo || estoqueDisponivel <= 0) {
      window.alert('Este produto está indisponível no momento.')
      return
    }

    setItems((current) => {
      const existing = current.find((item) => item.id === produto.id)

      if (existing) {
        const proximaQuantidade = existing.quantidade + 1

        if (Number.isFinite(estoqueDisponivel) && proximaQuantidade > estoqueDisponivel) {
          window.alert(`A quantidade máxima disponível deste item é ${estoqueDisponivel}.`)
          return current
        }

        return current.map((item) =>
          item.id === produto.id
            ? {
                ...item,
                quantidade: proximaQuantidade,
                subtotal: item.preco * proximaQuantidade,
              }
            : item
        )
      }

      const novoItem: CartItem = {
        id: produto.id,
        nome: produto.nome,
        imagem: produto.imagem,
        preco: produto.preco,
        quantidade: 1,
        subtotal: produto.preco,
        estoqueAtual: estoqueDisponivel,
        ativo,
        disponivel: true,
        mensagem: null,
      }

      return [...current, novoItem]
    })

    void refreshAvailability()
  }

  const updateQuantity = (produtoId: string, quantidade: number) => {
    setItems((current) => {
      const atual = current.find((item) => item.id === produtoId)
      if (!atual) return current

      if (quantidade <= 0) {
        return current.filter((item) => item.id !== produtoId)
      }

      const estoqueAtual = Number(atual.estoqueAtual ?? Number.POSITIVE_INFINITY)

      if (Number.isFinite(estoqueAtual) && quantidade > estoqueAtual) {
        window.alert(`A quantidade máxima disponível deste item é ${estoqueAtual}.`)
        return current
      }

      if (quantidade > 9999) {
        window.alert('A quantidade máxima permitida para este item foi atingida.')
        return current
      }

      return current.map((item) =>
        item.id === produtoId
          ? {
              ...item,
              quantidade,
              subtotal: item.preco * quantidade,
            }
          : item
      )
    })

    void refreshAvailability()
  }

  const removeItem = (produtoId: string) => {
    setItems((current) => current.filter((item) => item.id !== produtoId))
  }

  const clearCart = () => {
    setItems([])
    setCoupon(null)
    setCouponError(null)
  }

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      subtotal,
      desconto,
      total,
      cartKey,
      coupon,
      couponError,
      isApplyingCoupon,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      refreshAvailability,
      aplicarCupom,
      removerCupom,
      limparErroCupom,
    }),
    [items, itemCount, subtotal, desconto, total, cartKey, coupon, couponError, isApplyingCoupon, refreshAvailability, aplicarCupom, removerCupom, limparErroCupom]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider')
  }

  return context
}
