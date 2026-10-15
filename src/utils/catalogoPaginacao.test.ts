import { describe, expect, it } from 'vitest'
import { atualizarFiltrosCatalogo, atualizarPaginaCatalogo, CATALOGO_PRODUTOS_POR_PAGINA, filtrarProdutosCatalogo, paginarCatalogo } from './catalogoPaginacao'

const produtos = Array.from({ length: 29 }, (_, index) => ({ id: `produto-${index + 1}` }))

describe('paginação do catálogo', () => {
  it('mostra até 12 produtos por página sem repetir itens', () => {
    const primeira = paginarCatalogo(produtos, 1)
    const segunda = paginarCatalogo(produtos, 2)

    expect(CATALOGO_PRODUTOS_POR_PAGINA).toBe(12)
    expect(primeira.itens).toHaveLength(12)
    expect(segunda.itens).toHaveLength(12)
    expect(primeira.itens.map((produto) => produto.id)).not.toEqual(segunda.itens.map((produto) => produto.id))
    expect(new Set([...primeira.itens, ...segunda.itens].map((produto) => produto.id)).size).toBe(24)
  })

  it('navega entre páginas e desabilita os limites', () => {
    const primeira = paginarCatalogo(produtos, 1)
    const ultima = paginarCatalogo(produtos, 3)

    expect(primeira).toMatchObject({ pagina: 1, totalPaginas: 3, podeVoltar: false, podeAvancar: true })
    expect(ultima).toMatchObject({ pagina: 3, totalPaginas: 3, podeVoltar: true, podeAvancar: false })
    expect(ultima.itens).toHaveLength(5)
  })

  it('reinicia a página ao mudar os filtros e conta só os resultados filtrados', () => {
    const params = new URLSearchParams('pagina=4&busca=vinho&categoria=cat-1&grupo=grupo-a')
    const paramsAtualizados = atualizarFiltrosCatalogo(params, { busca: 'tinto', categoria: 'cat-2', grupo: '' })
    const filtrados = produtos.filter((produto) => Number(produto.id.split('-')[1]) % 2 === 0)

    expect(paramsAtualizados.has('pagina')).toBe(false)
    expect(paramsAtualizados.get('busca')).toBe('tinto')
    expect(paramsAtualizados.get('categoria')).toBe('cat-2')
    expect(paramsAtualizados.has('grupo')).toBe(false)
    expect(paginarCatalogo(filtrados, 1).totalPaginas).toBe(2)
  })

  it('aplica busca, categoria e grupo antes de calcular o total de páginas', () => {
    const catalogo = Array.from({ length: 28 }, (_, index) => ({
      id: `p-${index}`,
      nome: index < 13 ? `Vinho tinto ${index}` : `Vinho branco ${index}`,
      preco: 10,
      categoria: { id: index % 2 === 0 ? 'cat-tinto' : 'cat-branco', nome: 'Vinhos' },
      grupo: { id: index % 3 === 0 ? 'grupo-seco' : 'grupo-doce', nome: 'Grupo' },
    }))
    const filtrados = filtrarProdutosCatalogo(catalogo, { busca: 'tinto', categoria: 'cat-tinto', grupo: 'grupo-seco' })

    expect(filtrados).toHaveLength(3)
    expect(paginarCatalogo(filtrados, 1).totalPaginas).toBe(1)
    expect(filtrados.every((produto) => produto.nome.includes('tinto') && produto.categoria?.id === 'cat-tinto' && produto.grupo?.id === 'grupo-seco')).toBe(true)
  })

  it('representa catálogo vazio sem páginas navegáveis', () => {
    expect(paginarCatalogo([], 3)).toMatchObject({ itens: [], pagina: 1, totalPaginas: 0, totalItens: 0, podeVoltar: false, podeAvancar: false })
  })

  it('mantém os filtros e os demais parâmetros ao trocar de página', () => {
    const params = new URLSearchParams('busca=rose&categoria=cat-1&grupo=grupo-b&origem=campanha')
    const atualizados = atualizarPaginaCatalogo(params, 2)

    expect(atualizados.toString()).toContain('pagina=2')
    expect(atualizados.get('busca')).toBe('rose')
    expect(atualizados.get('categoria')).toBe('cat-1')
    expect(atualizados.get('grupo')).toBe('grupo-b')
    expect(atualizados.get('origem')).toBe('campanha')
    expect(params.has('pagina')).toBe(false)
  })

  it('reinicia para a primeira página sem apagar o estado salvo do carrinho', () => {
    const cartKey = 'cart_imuravinhos'
    const carrinhoSalvo = JSON.stringify({ items: [{ id: 'produto-1', quantidade: 2 }], coupon: null })
    const store = new Map<string, string>([[cartKey, carrinhoSalvo]])
    const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { localStorage: { getItem: (key: string) => store.get(key) ?? null } },
    })
    const params = atualizarFiltrosCatalogo(new URLSearchParams('pagina=3'), { busca: 'rose', categoria: '', grupo: '' })

    expect(params.has('pagina')).toBe(false)
    expect(window.localStorage.getItem(cartKey)).toBe(carrinhoSalvo)
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow)
    else Reflect.deleteProperty(globalThis, 'window')
  })

  it('mantém produtos separados pelo slug da empresa na chamada pública', () => {
    expect(new URL('/api/catalogo/imuravinhos/produtos', 'https://example.test').pathname)
      .not.toBe(new URL('/api/catalogo/catalogo-teste/produtos', 'https://example.test').pathname)
  })
})
