import axios from 'axios'
import type { ProdutoCatalogo, CategoriaCatalogo, GrupoCatalogo } from '../types/catalogo'

// Create a public API instance without authentication
const publicApi = axios.create({
  baseURL: import.meta.env.DEV ? '/' : import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

export interface EmpresaCatalogo {
  id?: string
  nome?: string
  slug: string
  logoUrl?: string | null
  descricao?: string | null
  telefone?: string | null
  whatsApp?: string | null
}

export interface ValidarCupomCatalogoRequest {
  codigo: string
}

export interface ValidarCupomCatalogoResponse {
  valido: boolean
  codigo: string
  descontoPercentual: number
  motivo?: string | null
}

export async function obterEmpresaCatalogo(slug?: string): Promise<EmpresaCatalogo> {
  if (!slug) {
    throw new Error('Slug da empresa não informado')
  }

  const { data } = await publicApi.get<EmpresaCatalogo>(`/api/catalogo/${slug}`)
  return data
}

export async function listarProdutosCatalogo(slug?: string): Promise<ProdutoCatalogo[]> {
  if (!slug) {
    return []
  }

  const { data } = await publicApi.get<ProdutoCatalogo[]>(`/api/catalogo/${slug}/produtos`)
  return data
}

export async function validarCupomCatalogo(slug: string, codigo: string): Promise<ValidarCupomCatalogoResponse> {
  const { data } = await publicApi.post<ValidarCupomCatalogoResponse>(`/api/catalogo/${slug}/validar-cupom`, {
    codigo,
  })

  return data
}

export async function obterProdutoCatalogo(id: string, slug?: string): Promise<ProdutoCatalogo> {
  if (!slug) {
    throw new Error('Slug da empresa não informado')
  }

  const { data } = await publicApi.get<ProdutoCatalogo>(`/api/catalogo/${slug}/produtos/${id}`)
  return data
}

export async function listarCategoriasCatalogo(slug?: string): Promise<CategoriaCatalogo[]> {
  if (!slug) {
    return []
  }

  const { data } = await publicApi.get<CategoriaCatalogo[]>(`/api/catalogo/${slug}/categorias`)
  return data
}

export async function listarGruposCatalogo(slug?: string): Promise<GrupoCatalogo[]> {
  if (!slug) {
    return []
  }

  const { data } = await publicApi.get<GrupoCatalogo[]>(`/api/catalogo/${slug}/grupos`)
  return data
}

