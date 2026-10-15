export const CATALOGO_PRODUTOS_POR_PAGINA = 12

export interface FiltrosCatalogo {
  busca: string
  categoria: string
  grupo: string
}

interface ProdutoFiltravel {
  nome: string
  descricao?: string | null
  categoriaId?: string
  grupoId?: string
  categoria?: { id: string }
  grupo?: { id: string }
}

export function filtrarProdutosCatalogo<T extends ProdutoFiltravel>(produtos: T[], filtros: FiltrosCatalogo): T[] {
  let resultado = produtos
  const termo = filtros.busca.trim().toLocaleLowerCase('pt-BR')

  if (termo) {
    resultado = resultado.filter((produto) =>
      produto.nome.toLocaleLowerCase('pt-BR').includes(termo) ||
      produto.descricao?.toLocaleLowerCase('pt-BR').includes(termo)
    )
  }
  if (filtros.categoria) {
    resultado = resultado.filter((produto) => (produto.categoriaId ?? produto.categoria?.id) === filtros.categoria)
  }
  if (filtros.grupo) {
    resultado = resultado.filter((produto) => (produto.grupoId ?? produto.grupo?.id) === filtros.grupo)
  }

  return resultado
}

export interface ResultadoPaginacao<T> {
  itens: T[]
  pagina: number
  totalPaginas: number
  totalItens: number
  podeVoltar: boolean
  podeAvancar: boolean
}

export function paginarCatalogo<T>(itens: T[], paginaSolicitada: number, tamanho = CATALOGO_PRODUTOS_POR_PAGINA): ResultadoPaginacao<T> {
  const totalItens = itens.length
  const totalPaginas = Math.ceil(totalItens / tamanho)
  const paginaValida = Number.isFinite(paginaSolicitada) ? Math.max(1, Math.floor(paginaSolicitada)) : 1
  const pagina = totalPaginas === 0 ? 1 : Math.min(paginaValida, totalPaginas)
  const inicio = (pagina - 1) * tamanho

  return {
    itens: itens.slice(inicio, inicio + tamanho),
    pagina,
    totalPaginas,
    totalItens,
    podeVoltar: pagina > 1 && totalPaginas > 0,
    podeAvancar: pagina < totalPaginas,
  }
}

export function atualizarPaginaCatalogo(paramsAtuais: URLSearchParams, pagina: number): URLSearchParams {
  const params = new URLSearchParams(paramsAtuais)
  if (pagina <= 1) params.delete('pagina')
  else params.set('pagina', String(Math.floor(pagina)))
  return params
}

export function atualizarFiltrosCatalogo(paramsAtuais: URLSearchParams, filtros: { busca: string; categoria: string; grupo: string }): URLSearchParams {
  const params = new URLSearchParams(paramsAtuais)
  for (const [chave, valor] of Object.entries(filtros)) {
    if (valor) params.set(chave, valor)
    else params.delete(chave)
  }
  params.delete('pagina')
  return params
}
