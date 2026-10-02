import api from './api'
import type {
  ImagemProduto,
  Produto,
  ProdutoCreate,
  ProdutoUpdate,
  ProdutosPaginados,
  ReordenarImagens,
} from '../types/produto'

export interface ProdutoCreateResponse {
  id?: string
  produtoId?: string
}

export interface ListarProdutosParams {
  page?: number
  pageSize?: number
  categoriaId?: string
  grupoId?: string
  busca?: string
}

export async function listarProdutos(params: ListarProdutosParams = {}): Promise<ProdutosPaginados> {
  const { data } = await api.get<ProdutosPaginados>('/api/produtos', {
    params: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      categoriaId: params.categoriaId || undefined,
      grupoId: params.grupoId || undefined,
      busca: params.busca || undefined,
    },
  })
  return data
}

export async function obterProduto(id: string): Promise<Produto> {
  const { data } = await api.get<Produto>(`/api/produtos/${id}`)
  return data
}

export async function criarProduto(data: ProdutoCreate): Promise<ProdutoCreateResponse> {
  const response = await api.post<ProdutoCreateResponse>('/api/produtos', data)
  return response.data
}

export async function atualizarProduto(id: string, data: ProdutoUpdate): Promise<Produto> {
  const response = await api.put<Produto>(`/api/produtos/${id}`, data)
  return response.data
}

export async function excluirProduto(id: string): Promise<void> {
  await api.delete(`/api/produtos/${id}`)
}

export async function listarImagens(produtoId: string): Promise<ImagemProduto[]> {
  const { data } = await api.get<ImagemProduto[]>(`/api/produtos/${produtoId}/imagens`)
  return data
}

export async function uploadImagem(produtoId: string, arquivo: File): Promise<ImagemProduto> {
  const formData = new FormData()
  formData.append('arquivo', arquivo)
  const { data } = await api.post<ImagemProduto>(`/api/produtos/${produtoId}/imagens`, formData)
  return data
}

export async function excluirImagem(produtoId: string, imagemId: string): Promise<void> {
  await api.delete(`/api/produtos/${produtoId}/imagens/${imagemId}`)
}

export async function definirImagemPrincipal(produtoId: string, imagemId: string): Promise<void> {
  await api.put(`/api/produtos/${produtoId}/imagens/${imagemId}/principal`)
}

export async function reordenarImagens(produtoId: string, imagens: ReordenarImagens): Promise<void> {
  await api.put(`/api/produtos/${produtoId}/imagens/ordem`, imagens)
}
