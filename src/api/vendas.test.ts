import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './api'
import { cancelarVenda, confirmarPagamentoVenda, confirmarVenda, concluirVenda, listarVendas } from './vendas'

vi.mock('./api', () => ({ default: { get: vi.fn(), put: vi.fn() } }))

describe('ações de venda', () => {
  beforeEach(() => vi.mocked(api.put).mockReset().mockResolvedValue({ data: undefined } as never))

  it('confirma uma venda pelo endpoint existente em uma única chamada', async () => {
    await confirmarVenda('venda-16')
    expect(api.put).toHaveBeenCalledTimes(1)
    expect(api.put).toHaveBeenCalledWith('/api/vendas/venda-16/confirmar')
  })

  it('confirma pagamento sem usar o endpoint de conclusão', async () => {
    await confirmarPagamentoVenda('venda-16')
    expect(api.put).toHaveBeenCalledTimes(1)
    expect(api.put).toHaveBeenCalledWith('/api/vendas/venda-16/confirmar-pagamento')
  })

  it('usa os endpoints existentes para concluir e cancelar', async () => {
    await concluirVenda('venda-16')
    await cancelarVenda('venda-16')
    expect(api.put).toHaveBeenNthCalledWith(1, '/api/vendas/venda-16/concluir')
    expect(api.put).toHaveBeenNthCalledWith(2, '/api/vendas/venda-16/cancelar')
  })
})

describe('listarVendas', () => {
  beforeEach(() => vi.mocked(api.get).mockReset())

  it('lê somente as páginas necessárias do endpoint existente e agrega os registros', async () => {
    const primeiraPagina = Array.from({ length: 100 }, (_, index) => ({ id: `venda-${index + 1}` }))
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: { itens: primeiraPagina, total: 105, pagina: 1, tamanho: 100 } } as never)
      .mockResolvedValueOnce({ data: { itens: [{ id: 'venda-101' }, { id: 'venda-102' }, { id: 'venda-103' }, { id: 'venda-104' }, { id: 'venda-105' }], total: 105, pagina: 2, tamanho: 100 } } as never)

    const vendas = await listarVendas()

    expect(api.get).toHaveBeenCalledTimes(2)
    expect(api.get).toHaveBeenNthCalledWith(1, '/api/vendas', { params: { pagina: 1, tamanho: 100 } })
    expect(api.get).toHaveBeenNthCalledWith(2, '/api/vendas', { params: { pagina: 2, tamanho: 100 } })
    expect(vendas).toHaveLength(105)
  })

  it('aceita uma resposta em lista e não pede páginas extras quando total é desconhecido', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: [{ id: 'venda-1' }] } as never)

    await expect(listarVendas()).resolves.toEqual([{ id: 'venda-1' }])
    expect(api.get).toHaveBeenCalledTimes(1)
  })
})
