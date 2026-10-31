import { afterEach, describe, expect, it, vi } from 'vitest'
import api from './api'
import { atualizarMinhaEmpresa, enviarLogoEmpresa, obterMinhaEmpresa, removerLogoEmpresa } from './empresa'

describe('API Minha Empresa', () => {
  afterEach(() => vi.restoreAllMocks())

  it('consulta somente a empresa associada ao token atual', async () => {
    const empresa = { id: 'empresa-atual', nome: 'Minha empresa' }
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: empresa } as never)

    await expect(obterMinhaEmpresa()).resolves.toEqual(empresa)
    expect(get).toHaveBeenCalledWith('/api/empresa/me')
  })

  it('atualiza a empresa pelo endpoint autenticado sem enviar um ID de tenant', async () => {
    const payload = { nome: 'Empresa atualizada', nomeFantasia: null, email: 'contato@empresa.com', telefone: null, whatsApp: null, slug: 'empresa-atualizada', endereco: 'Rua Um' }
    const put = vi.spyOn(api, 'put').mockResolvedValue({ data: payload } as never)

    await expect(atualizarMinhaEmpresa(payload)).resolves.toEqual(payload)
    expect(put).toHaveBeenCalledWith('/api/empresa/me', payload)
    expect(payload).not.toHaveProperty('empresaId')
  })

  it('envia a logo como multipart e permite removê-la sem ID de empresa no payload', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { logoUrl: '/logo.png' } } as never)
    const remove = vi.spyOn(api, 'delete').mockResolvedValue({ data: { logoUrl: null } } as never)

    await enviarLogoEmpresa(new File(['logo'], 'logo.png', { type: 'image/png' }))
    await removerLogoEmpresa()

    expect(post).toHaveBeenCalledWith('/api/empresa/me/logo', expect.any(FormData))
    expect(remove).toHaveBeenCalledWith('/api/empresa/me/logo')
  })
})
