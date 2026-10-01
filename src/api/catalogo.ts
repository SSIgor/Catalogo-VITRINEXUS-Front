import axios from 'axios'
import type { ProdutoCatalogo, CategoriaCatalogo, GrupoCatalogo } from '../types/catalogo'

// Create a public API instance without authentication
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

export async function listarProdutosCatalogo(slug?: string): Promise<ProdutoCatalogo[]> {
  try {
    // First try: catalog endpoint with slug-specific path
    const { data } = await publicApi.get<ProdutoCatalogo[]>(`/api/catalogo/${slug}/produtos`)
    return data
  } catch (error1) {
    try {
      // Second try: generic catalog endpoint
      const { data } = await publicApi.get<ProdutoCatalogo[]>(`/api/catalogo/produtos`)
      return data
    } catch (error2) {
      try {
        // Third try: public endpoint with slug
        const { data } = await publicApi.get<ProdutoCatalogo[]>(`/api/public/${slug}/produtos`)
        return data
      } catch (error3) {
        // If all fail, return empty array
        return []
      }
    }
  }
}

export async function obterProdutoCatalogo(id: string, slug?: string): Promise<ProdutoCatalogo> {
  try {
    // Try slug-specific endpoint
    const { data } = await publicApi.get<ProdutoCatalogo>(`/api/catalogo/${slug}/produtos/${id}`)
    return data
  } catch (error1) {
    try {
      // Try generic catalog endpoint
      const { data } = await publicApi.get<ProdutoCatalogo>(`/api/catalogo/produtos/${id}`)
      return data
    } catch (error2) {
      try {
        // Try public endpoint
        const { data } = await publicApi.get<ProdutoCatalogo>(`/api/public/${slug}/produtos/${id}`)
        return data
      } catch (error3) {
        throw new Error('Produto não encontrado')
      }
    }
  }
}

export async function listarCategoriasCatalogo(slug?: string): Promise<CategoriaCatalogo[]> {
  try {
    // First try: catalog endpoint with slug-specific path
    const { data } = await publicApi.get<CategoriaCatalogo[]>(`/api/catalogo/${slug}/categorias`)
    return data
  } catch (error1) {
    try {
      // Second try: generic catalog endpoint
      const { data } = await publicApi.get<CategoriaCatalogo[]>(`/api/catalogo/categorias`)
      return data
    } catch (error2) {
      try {
        // Third try: public endpoint
        const { data } = await publicApi.get<CategoriaCatalogo[]>(`/api/public/${slug}/categorias`)
        return data
      } catch (error3) {
        return []
      }
    }
  }
}

export async function listarGruposCatalogo(slug?: string): Promise<GrupoCatalogo[]> {
  try {
    // First try: catalog endpoint with slug-specific path
    const { data } = await publicApi.get<GrupoCatalogo[]>(`/api/catalogo/${slug}/grupos`)
    return data
  } catch (error1) {
    try {
      // Second try: generic catalog endpoint
      const { data } = await publicApi.get<GrupoCatalogo[]>(`/api/catalogo/grupos`)
      return data
    } catch (error2) {
      try {
        // Third try: public endpoint
        const { data } = await publicApi.get<GrupoCatalogo[]>(`/api/public/${slug}/grupos`)
        return data
      } catch (error3) {
        return []
      }
    }
  }
}
