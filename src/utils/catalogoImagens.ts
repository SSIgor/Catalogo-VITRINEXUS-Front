import type { ImagemProdutoCatalogo, ProdutoCatalogo } from '../types/catalogo'

function isImagemCatalogoValida(imagem?: Partial<ImagemProdutoCatalogo> | null): imagem is ImagemProdutoCatalogo {
  return Boolean(imagem && typeof imagem.url === 'string' && imagem.url.trim().length > 0)
}

export function getImagemPrincipalCatalogo(produto?: Partial<ProdutoCatalogo> | null): ImagemProdutoCatalogo | null {
  if (!produto) {
    return null
  }

  if (isImagemCatalogoValida(produto.imagemPrincipal)) {
    return produto.imagemPrincipal
  }

  const principalNaLista = produto.imagens?.find((imagem) => imagem?.principal && isImagemCatalogoValida(imagem))
  return principalNaLista ?? null
}

export function ordenarImagensGaleria(produto?: Partial<ProdutoCatalogo> | null): ImagemProdutoCatalogo[] {
  if (!produto) {
    return []
  }

  const imagensValidas = Array.isArray(produto.imagens) ? produto.imagens.filter(isImagemCatalogoValida) : []
  const principal = getImagemPrincipalCatalogo(produto)
  const chaves = new Set<string>()
  const ordenadas: ImagemProdutoCatalogo[] = []

  if (principal) {
    const chavePrincipal = principal.id || principal.url
    if (chavePrincipal) {
      ordenadas.push(principal)
      chaves.add(chavePrincipal)
    }
  }

  for (const imagem of imagensValidas) {
    const chaveImagem = imagem.id || imagem.url
    if (!chaveImagem || chaves.has(chaveImagem)) {
      continue
    }

    ordenadas.push(imagem)
    chaves.add(chaveImagem)
  }

  return ordenadas
}
