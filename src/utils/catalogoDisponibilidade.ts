export function normalizarAtivo(valor: boolean | number | string | null | undefined): boolean {
  if (valor === null || valor === undefined || valor === '') return true
  if (typeof valor === 'boolean') return valor
  if (typeof valor === 'number') return valor !== 0

  const texto = valor.toString().trim().toLowerCase()
  return texto === 'true' || texto === '1' || texto === 'yes'
}

export function normalizarEstoque(valor: number | string | null | undefined): number {
  if (valor === null || valor === undefined || valor === '') return Number.POSITIVE_INFINITY

  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : Number.POSITIVE_INFINITY
}

export function isProdutoDisponivel({ ativo, estoqueAtual }: { ativo?: boolean | number | string | null; estoqueAtual?: number | string | null }): boolean {
  return normalizarAtivo(ativo) && normalizarEstoque(estoqueAtual) > 0
}

export function canIncreaseQuantity(quantidadeAtual: number, estoqueAtual: number | string | null | undefined): boolean {
  return quantidadeAtual < normalizarEstoque(estoqueAtual)
}

export function getEstoqueBaixoLabel(estoqueAtual: number | string | null | undefined): string | null {
  const estoque = normalizarEstoque(estoqueAtual)

  if (estoque === 1) return 'Última unidade'
  if (estoque === 2) return 'Últimas unidades'

  return null
}

export function getCartItemStatus({
  ativo,
  estoqueAtual,
  quantidadeSolicitada,
}: {
  ativo?: boolean | number | string | null
  estoqueAtual?: number | string | null
  quantidadeSolicitada: number
}): { disponivel: boolean; mensagem: string | null; estoqueDisponivel: number } {
  const estoqueDisponivel = normalizarEstoque(estoqueAtual)

  if (!normalizarAtivo(ativo)) {
    return {
      disponivel: false,
      mensagem: 'Produto indisponível',
      estoqueDisponivel,
    }
  }

  if (estoqueDisponivel <= 0) {
    return {
      disponivel: false,
      mensagem: 'Produto sem estoque',
      estoqueDisponivel: 0,
    }
  }

  if (quantidadeSolicitada > estoqueDisponivel) {
    return {
      disponivel: false,
      mensagem: `Estoque insuficiente. Disponível: ${estoqueDisponivel}`,
      estoqueDisponivel,
    }
  }

  return {
    disponivel: true,
    mensagem: null,
    estoqueDisponivel,
  }
}

export function getProdutoButtonLabel({ ativo, estoqueAtual }: { ativo?: boolean | number | string | null; estoqueAtual?: number | string | null }): string {
  if (!normalizarAtivo(ativo)) {
    return 'Indisponível'
  }

  if (normalizarEstoque(estoqueAtual) <= 0) {
    return 'Produto sem estoque'
  }

  return 'Adicionar ao carrinho'
}
