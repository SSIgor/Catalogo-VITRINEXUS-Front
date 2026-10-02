import { useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, RotateCw } from 'lucide-react'
import {
  listarProdutosCatalogo,
  listarCategoriasCatalogo,
  listarGruposCatalogo,
  obterEmpresaCatalogo,
} from '../../api/catalogo'
import { CatalogoGrid } from '../../components/catalogo/CatalogoGrid'
import { FiltroCompacto } from '../../components/catalogo/FiltroCompacto'
import { PublicLayout } from '../../components/layout/PublicLayout'
import { messageForApiError } from '../../utils/apiError'
import { useMemo, useState } from 'react'

export function Catalogo() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()

  const [busca, setBusca] = useState(searchParams.get('busca') ?? '')
  const categoriaFiltro = searchParams.get('categoria') ?? ''
  const grupoFiltro = searchParams.get('grupo') ?? ''

  const empresaQuery = useQuery({
    queryKey: ['catalogo', slug, 'empresa'],
    queryFn: () => obterEmpresaCatalogo(slug),
    enabled: Boolean(slug),
  })

  const produtosQuery = useQuery({
    queryKey: ['catalogo', slug, 'produtos'],
    queryFn: () => listarProdutosCatalogo(slug),
    enabled: Boolean(slug),
  })

  const categoriasQuery = useQuery({
    queryKey: ['catalogo', slug, 'categorias'],
    queryFn: () => listarCategoriasCatalogo(slug),
    enabled: Boolean(slug),
  })

  const gruposQuery = useQuery({
    queryKey: ['catalogo', slug, 'grupos'],
    queryFn: () => listarGruposCatalogo(slug),
    enabled: Boolean(slug),
  })

  const produtosFiltrados = useMemo(() => {
    let resultado = produtosQuery.data ?? []

    if (busca.trim()) {
      const term = busca.toLowerCase()
      resultado = resultado.filter(
        (p) =>
          p.nome.toLowerCase().includes(term) ||
          p.descricao?.toLowerCase().includes(term)
      )
    }

    if (categoriaFiltro) {
      resultado = resultado.filter((p) => p.categoriaId === categoriaFiltro)
    }

    if (grupoFiltro) {
      resultado = resultado.filter((p) => p.grupoId === grupoFiltro)
    }

    return resultado
  }, [produtosQuery.data, busca, categoriaFiltro, grupoFiltro])

  const handleBusca = (value: string) => {
    setBusca(value)
    if (value.trim()) {
      setSearchParams({ busca: value, categoria: categoriaFiltro, grupo: grupoFiltro })
    } else {
      setSearchParams({ categoria: categoriaFiltro, grupo: grupoFiltro })
    }
  }

  const handleCategoria = (id: string) => {
    setSearchParams({ busca, categoria: id, grupo: grupoFiltro })
  }

  const handleGrupo = (id: string) => {
    setSearchParams({ busca, categoria: categoriaFiltro, grupo: id })
  }

  if (!slug) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-2xl px-5 py-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-ink/45">Catálogo</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-ink">Catálogo não encontrado</h1>
          <p className="mt-3 text-ink/55">A URL informada não corresponde a um catálogo válido.</p>
        </div>
      </PublicLayout>
    )
  }

  if (empresaQuery.error) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-2xl px-5 py-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-ink/45">Catálogo</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-ink">Catálogo não encontrado</h1>
          <p className="mt-3 text-ink/55">{messageForApiError(empresaQuery.error, 'Este catálogo não está disponível no momento.')}</p>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        {/* Erro ao carregar */}
        {produtosQuery.error && (
          <div className="mb-6 space-y-3 rounded-xl bg-rose-50 p-4 text-rose-700">
            <p className="font-semibold">Erro ao carregar catálogo</p>
            <p className="text-sm">{messageForApiError(produtosQuery.error, 'Não foi possível carregar os produtos.')}</p>
            <button
              onClick={() => produtosQuery.refetch()}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-100 px-4 py-2 text-sm font-semibold hover:bg-rose-200"
            >
              <RotateCw size={16} />
              Tentar novamente
            </button>
          </div>
        )}

        {/* Título */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-ink">
            {empresaQuery.data?.nome ?? 'Catálogo'}
          </h1>
          <p className="mt-2 text-ink/55">Confira nossa seleção de produtos disponíveis</p>
        </div>

        {/* Busca */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-ink/35" size={18} />
            <input
              value={busca}
              onChange={(e) => handleBusca(e.target.value)}
              placeholder="Buscar produtos..."
              className="w-full rounded-xl border border-ink/15 bg-white py-3 pl-11 pr-4 outline-none transition-colors focus:border-teal focus:ring-4 focus:ring-teal/10"
            />
          </div>
        </div>

        {/* Filtros */}
        {categoriasQuery.data || gruposQuery.data ? (
          <FiltroCompacto
            categorias={categoriasQuery.data ?? []}
            grupos={gruposQuery.data ?? []}
            categoriaSelecionada={categoriaFiltro}
            grupoSelecionado={grupoFiltro}
            aoMudarCategoria={handleCategoria}
            aoMudarGrupo={handleGrupo}
            isCarregando={categoriasQuery.isLoading || gruposQuery.isLoading}
          />
        ) : null}

        <div className="mb-8" />

        {/* Grid de Produtos */}
        {produtosQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-paper animate-pulse" />
            ))}
          </div>
        ) : (
          <CatalogoGrid produtos={produtosFiltrados} />
        )}

        {/* Info de contagem */}
        {!produtosQuery.isLoading && produtosQuery.data && (
          <p className="mt-8 text-center text-sm font-medium text-ink/50">
            {produtosFiltrados.length === 0
              ? 'Nenhum produto encontrado'
              : produtosFiltrados.length === 1
                ? '1 produto encontrado'
                : `${produtosFiltrados.length} produtos encontrados`}
          </p>
        )}
      </div>
    </PublicLayout>
  )
}
