import { afterEach, describe, expect, it, vi } from 'vitest'
import api from './api'
import { criarEmpresa, type CriarEmpresaRequest } from './superAdmin'

describe('criarEmpresa', () => {
  afterEach(() => vi.restoreAllMocks())

  it('envia somente os objetos empresa e administrador ao endpoint contratado', async () => {
    const payload: CriarEmpresaRequest = {
      empresa: {
        nome: 'Empresa Nova', nomeFantasia: null, cnpj: null, email: 'contato@empresa.com',
        telefone: null, whatsApp: null, logoUrl: null, descricao: null, slug: 'empresa-nova',
      },
      administrador: { nome: 'Admin Inicial', email: 'admin@empresa.com' },
    }
    const response = { empresa: { id: 'empresa-id', nome: 'Empresa Nova', slug: 'empresa-nova' }, administrador: { id: 'admin-id', nome: 'Admin Inicial' }, senhaTemporaria: 'temporaria', aviso: 'Canal seguro' }
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: response } as never)

    await expect(criarEmpresa(payload)).resolves.toEqual(response)
    expect(post).toHaveBeenCalledWith('/api/superadmin/empresas', payload)
    expect(Object.keys(payload)).toEqual(['empresa', 'administrador'])
    expect(payload.administrador).not.toHaveProperty('empresaId')
    expect(payload.administrador).not.toHaveProperty('tipo')
    expect(payload.administrador).not.toHaveProperty('senha')
  })
})
