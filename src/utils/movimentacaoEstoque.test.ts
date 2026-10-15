import { describe, expect, it, vi } from 'vitest'
import type { EstoqueProduto } from '../types/estoque'
import {
  enviarMovimentacaoValidada,
  filtrarProdutosMovimentacao,
  movimentacaoEstoqueSchema,
  selecionarProdutoMovimentacao,
} from './movimentacaoEstoque'

const products: EstoqueProduto[] = [
  { id: '1', nome: 'Vinho Tinto São João', codigo: 'VT1', categoriaId: 'c1', grupoId: 'g1', estoqueAtual: 0, estoqueMinimo: 2, ativo: true },
  { id: '2', nome: 'Vinho Branco', codigo: 'VB1', categoriaId: 'c1', grupoId: 'g1', estoqueAtual: 7, estoqueMinimo: 2, ativo: true },
  { id: '3', nome: 'Produto inativo', categoriaId: 'c1', grupoId: 'g1', estoqueAtual: 3, estoqueMinimo: 1, ativo: false },
]

describe('movimentação de estoque no frontend', () => {
  it('pesquisa produtos por nome, ignorando caixa e acentuação', () => {
    expect(filtrarProdutosMovimentacao(products, 'VINHO TINTO sao')).toEqual([products[0]])
  })

  it('mostra lista vazia quando não há resultados e mantém produto ativo sem estoque', () => {
    expect(filtrarProdutosMovimentacao(products, 'inexistente')).toEqual([])
    expect(filtrarProdutosMovimentacao(products, '')).toEqual([products[0], products[1]])
  })

  it('seleciona o produto pesquisado com nome completo e não seleciona inativos', () => {
    expect(selecionarProdutoMovimentacao(products, '1')?.nome).toBe('Vinho Tinto São João')
    expect(selecionarProdutoMovimentacao(products, '3')).toBeUndefined()
  })

  it.each([1, 2, 10, 25, 100])('aceita quantidade inteira válida: %s', (valor) => {
    expect(movimentacaoEstoqueSchema.safeParse({ produtoId: '1', tipo: 'entrada', valor }).success).toBe(true)
  })

  it.each([1.5, 2.75, 0, -1, ''])('rejeita entrada inválida: %s', (valor) => {
    expect(movimentacaoEstoqueSchema.safeParse({ produtoId: '1', tipo: 'entrada', valor }).success).toBe(false)
  })

  it('rejeita zero, negativos e decimais em ajuste, preservando saldo final zero', () => {
    expect(movimentacaoEstoqueSchema.safeParse({ produtoId: '1', tipo: 'ajuste', valor: 1.5 }).success).toBe(false)
    expect(movimentacaoEstoqueSchema.safeParse({ produtoId: '1', tipo: 'ajuste', valor: -1 }).success).toBe(false)
    expect(movimentacaoEstoqueSchema.safeParse({ produtoId: '1', tipo: 'ajuste', valor: 0 }).success).toBe(true)
  })

  it('envia apenas os dados validados, com quantidade inteira e observação', async () => {
    const submit = vi.fn().mockResolvedValue(undefined)
    await enviarMovimentacaoValidada({ produtoId: '2', tipo: 'entrada', valor: 10, observacao: 'Reposição' }, submit)
    expect(submit).toHaveBeenCalledWith({ produtoId: '2', tipo: 'entrada', valor: 10, observacao: 'Reposição' })
    await expect(enviarMovimentacaoValidada({ produtoId: '2', tipo: 'entrada', valor: 1.5, observacao: '' }, submit)).rejects.toThrow()
    expect(submit).toHaveBeenCalledTimes(1)
  })
})
