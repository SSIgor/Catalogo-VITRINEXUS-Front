import { describe, expect, it } from 'vitest'
import { canIncreaseQuantity, getCartItemStatus, getProdutoButtonLabel, isProdutoDisponivel } from './catalogoDisponibilidade'

describe('catalogoDisponibilidade', () => {
  it('cenário 1: produto ativo com estoque habilita o botão', () => {
    expect(isProdutoDisponivel({ ativo: true, estoqueAtual: 10 })).toBe(true)
    expect(getProdutoButtonLabel({ ativo: true, estoqueAtual: 10 })).toBe('Adicionar ao carrinho')
  })

  it('cenário 2: produto com estoque baixo continua disponível', () => {
    expect(isProdutoDisponivel({ ativo: true, estoqueAtual: 2 })).toBe(true)
    expect(getProdutoButtonLabel({ ativo: true, estoqueAtual: 2 })).toBe('Adicionar ao carrinho')
    expect(isProdutoDisponivel({ ativo: true, estoqueAtual: 1 })).toBe(true)
    expect(getProdutoButtonLabel({ ativo: true, estoqueAtual: 1 })).toBe('Adicionar ao carrinho')
  })

  it('cenário 3: produto inativo desabilita o botão', () => {
    expect(isProdutoDisponivel({ ativo: false, estoqueAtual: 10 })).toBe(false)
    expect(getProdutoButtonLabel({ ativo: false, estoqueAtual: 10 })).toBe('Indisponível')
  })

  it('cenário 4: produto sem estoque desabilita o botão', () => {
    expect(isProdutoDisponivel({ ativo: true, estoqueAtual: 0 })).toBe(false)
    expect(getProdutoButtonLabel({ ativo: true, estoqueAtual: 0 })).toBe('Produto sem estoque')
  })

  it('cenário 5: não permite ultrapassar o estoque ao adicionar quantidade', () => {
    expect(canIncreaseQuantity(5, 5)).toBe(false)
    expect(canIncreaseQuantity(2, 5)).toBe(true)
  })

  it('cenário 6: produto inativo e sem estoque continua indisponível', () => {
    expect(isProdutoDisponivel({ ativo: false, estoqueAtual: 0 })).toBe(false)
    expect(getProdutoButtonLabel({ ativo: false, estoqueAtual: 0 })).toBe('Indisponível')
  })

  it('cenário 7: carrinho bloqueia item quando o estoque cai ou fica insuficiente', () => {
    expect(getCartItemStatus({ ativo: true, estoqueAtual: 0, quantidadeSolicitada: 1 })).toMatchObject({
      disponivel: false,
      mensagem: 'Produto sem estoque',
    })

    expect(getCartItemStatus({ ativo: true, estoqueAtual: 3, quantidadeSolicitada: 5 })).toMatchObject({
      disponivel: false,
      mensagem: 'Estoque insuficiente. Disponível: 3',
    })

    expect(getCartItemStatus({ ativo: true, estoqueAtual: 2, quantidadeSolicitada: 2 })).toMatchObject({
      disponivel: true,
      mensagem: null,
    })

    expect(getCartItemStatus({ ativo: false, estoqueAtual: 10, quantidadeSolicitada: 1 })).toMatchObject({
      disponivel: false,
      mensagem: 'Produto indisponível',
    })
  })
})
