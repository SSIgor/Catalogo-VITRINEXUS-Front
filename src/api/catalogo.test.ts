import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listarProdutosCatalogo } from './catalogo'

const { mockGet } = vi.hoisted(() => ({ mockGet: vi.fn() }))

vi.mock('axios', () => ({ default: { create: () => ({ get: mockGet, post: vi.fn() }) } }))

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
