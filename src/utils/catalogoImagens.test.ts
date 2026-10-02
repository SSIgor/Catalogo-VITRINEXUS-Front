import { describe, expect, it } from 'vitest'
import { getImagemPrincipalCatalogo, ordenarImagensGaleria } from './catalogoImagens'

describe('catalogoImagens', () => {
  it('seleciona somente a imagem principal para o card', () => {
    const produto = {
      id: 'p1',
      nome: 'Produto',
      imagemPrincipal: { id: 'img-a', url: '/a.jpg', ordem: 1, principal: true },
      imagens: [
        { id: 'img-a', url: '/a.jpg', ordem: 1, principal: true },
        { id: 'img-b', url: '/b.jpg', ordem: 2, principal: false },
        { id: 'img-c', url: '/c.jpg', ordem: 3, principal: false },
      ],
    }

    expect(getImagemPrincipalCatalogo(produto)).toMatchObject({ id: 'img-a', url: '/a.jpg' })
  })

  it('não escolhe outra imagem quando não existe principal', () => {
    const produto = {
      id: 'p2',
      nome: 'Produto sem principal',
      imagemPrincipal: null,
      imagens: [
        { id: 'img-b', url: '/b.jpg', ordem: 2, principal: false },
        { id: 'img-c', url: '/c.jpg', ordem: 3, principal: false },
      ],
    }

    expect(getImagemPrincipalCatalogo(produto)).toBeNull()
  })

  it('mantém a imagem principal no início da galeria sem alterar a ordem restante', () => {
    const produto = {
      id: 'p3',
      nome: 'Produto',
      imagemPrincipal: { id: 'img-a', url: '/a.jpg', ordem: 1, principal: true },
      imagens: [
        { id: 'img-b', url: '/b.jpg', ordem: 2, principal: false },
        { id: 'img-a', url: '/a.jpg', ordem: 1, principal: true },
        { id: 'img-c', url: '/c.jpg', ordem: 3, principal: false },
      ],
    }

    expect(ordenarImagensGaleria(produto).map((img) => img.id)).toEqual(['img-a', 'img-b', 'img-c'])
  })
})
