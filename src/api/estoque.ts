import api from './api'
import type { Produto, ProdutosPaginados } from '../types/produto'
import type { AjusteEstoque, EntradaEstoque, EstoqueBaixo, EstoqueProduto, EstoqueZerado, HistoricoMovimentacao } from '../types/estoque'

export async function listarEstoque(): Promise<EstoqueProduto[]> {
  const pageSize = 100
  let pagina = 1
  const produtos: EstoqueProduto[] = []

  while (pagina > 0) {
    const { data } = await api.get<Produto[] | ProdutosPaginados>('/api/produtos', {
      params: {
        page: pagina,
        pageSize,
      },
    })

    const items = Array.isArray(data) ? data : data.items ?? []

    produtos.push(
      ...items.map(({ id, nome, codigo, categoriaId, grupoId, estoqueAtual, estoqueMinimo, ativo }) => ({
        id,
        nome,
        codigo,
        categoriaId,
        grupoId,
        estoqueAtual,
        estoqueMinimo,
        ativo,
      }))
    )

    if (Array.isArray(data) || !('totalPages' in data) || data.page >= data.totalPages) {
      break
    }

    pagina += 1
  }

  return produtos
}

export async function buscarEstoqueBaixo(): Promise<EstoqueBaixo[]> {
  const { data } = await api.get<EstoqueBaixo[]>('/api/estoque/baixo')
  return data
}

export async function buscarEstoqueZerado(): Promise<EstoqueZerado[]> {
  const { data } = await api.get<EstoqueZerado[]>('/api/estoque/zerado')
  return data
}

export async function registrarEntrada(data: EntradaEstoque): Promise<void> {
  await api.post('/api/estoque/entrada', data)
}

export async function registrarAjuste(data: AjusteEstoque): Promise<void> {
  await api.post('/api/estoque/ajuste', data)
}

export async function listarHistorico(produtoId: string): Promise<HistoricoMovimentacao[]> {
  const { data } = await api.get<HistoricoMovimentacao[]>(`/api/estoque/${produtoId}/historico`)
  return data
}
