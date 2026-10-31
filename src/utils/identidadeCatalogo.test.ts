import { describe, expect, it } from 'vitest'
import { getNomeCatalogo, resolveLogoCatalogoUrl, shouldShowLogo } from './identidadeCatalogo'

describe('identidade pública do catálogo', () => {
  it('usa o nome fantasia e fornece um fallback quando está ausente ou em branco', () => {
    expect(getNomeCatalogo('Vinhos Imura')).toBe('Vinhos Imura')
    expect(getNomeCatalogo(null)).toBe('Catálogo da empresa')
    expect(getNomeCatalogo('  ')).toBe('Catálogo da empresa')
  })

  it('usa a logo quando cadastrada e o ícone padrão quando ausente ou com falha', () => {
    const logo = resolveLogoCatalogoUrl('https://cdn.example/logo.png')
    expect(shouldShowLogo(logo, false)).toBe(true)
    expect(shouldShowLogo(null, false)).toBe(false)
    expect(shouldShowLogo(logo, true)).toBe(false)
  })

  it('resolve caminhos relativos da rota pública de imagens pela API em produção', () => {
    expect(resolveLogoCatalogoUrl('/uploads/produtos/id/logo.png', 'https://api.example/', false))
      .toBe('https://api.example/uploads/produtos/id/logo.png')
    expect(resolveLogoCatalogoUrl('/uploads/produtos/id/logo.png', 'https://api.example/', true))
      .toBe('/uploads/produtos/id/logo.png')
    expect(resolveLogoCatalogoUrl('/outro/caminho/logo.png')).toBeNull()
  })
})
