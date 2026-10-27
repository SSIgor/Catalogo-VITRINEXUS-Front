import { beforeEach, describe, expect, it, vi } from 'vitest'
import { criarPedidoCatalogo, listarProdutosCatalogo } from './catalogo'

const { mockGet, mockPost } = vi.hoisted(() => ({ mockGet: vi.fn(), mockPost: vi.fn() }))

vi.mock('axios', () => ({ default: { create: () => ({ get: mockGet, post: mockPost }) } }))

describe('listarProdutosCatalogo', () => {
  beforeEach(() => mockGet.mockReset().mockResolvedValue({ data: [{ id: 'produto-1' }] }))

  it('consulta os produtos dentro do slug da empresa e recebe uma lista completa', async () => {
    const produtos = await listarProdutosCatalogo('imuravinhos')

    expect(mockGet).toHaveBeenCalledOnce()
    expect(mockGet).toHaveBeenCalledWith('/api/catalogo/imuravinhos/produtos')
    expect(produtos).toEqual([{ id: 'produto-1' }])
  })

  it('usa o slug solicitado sem reutilizar produtos de outro catálogo', async () => {
    await listarProdutosCatalogo('catalogo-teste')

    expect(mockGet).toHaveBeenCalledWith('/api/catalogo/catalogo-teste/produtos')
  })
})

describe('criarPedidoCatalogo', () => {
  beforeEach(() => mockPost.mockReset().mockResolvedValue({ data: { id: 'venda-publica-1' } }))

  it('cria o pedido na rota pública do slug sem usar a API administrativa', async () => {
    const payload = { clienteId: null, itens: [{ produtoId: 'produto-1', quantidade: 1 }] }

    const venda = await criarPedidoCatalogo('empresa-a', payload as never)

    expect(mockPost).toHaveBeenCalledOnce()
    expect(mockPost).toHaveBeenCalledWith('/api/catalogo/empresa-a/pedidos', payload)
    expect(venda).toEqual({ id: 'venda-publica-1' })
  })

  it('preserva erros devolvidos pelo endpoint público', async () => {
    const apiError = { response: { status: 401, data: { detail: 'Token rejeitado.' } } }
    mockPost.mockRejectedValueOnce(apiError)

    await expect(criarPedidoCatalogo('empresa-a', {} as never)).rejects.toBe(apiError)
  })

  it('rejeita slug vazio antes de enviar a requisição', async () => {
    await expect(criarPedidoCatalogo('  ', {} as never)).rejects.toThrow()
    expect(mockPost).not.toHaveBeenCalled()
  })
})
