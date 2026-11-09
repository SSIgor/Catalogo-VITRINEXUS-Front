import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './api'
import { registrarAjuste } from './estoque'

vi.mock('./api', () => ({ default: { get: vi.fn(), post: vi.fn() } }))

describe('registrarAjuste', () => {
  beforeEach(() => vi.mocked(api.post).mockReset().mockResolvedValue({ data: undefined } as never))

  it('envia ao backend a retirada como diferença negativa', async () => {
    await registrarAjuste({ produtoId: 'produto-1', quantidade: 3, observacao: 'Retirada' })

    expect(api.post).toHaveBeenCalledWith('/api/estoque/ajuste', {
      produtoId: 'produto-1',
      quantidade: -3,
      observacao: 'Retirada',
    })
  })
})
