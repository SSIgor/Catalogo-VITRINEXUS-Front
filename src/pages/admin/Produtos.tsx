import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus, Search, SlidersHorizontal } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listarCategorias } from '../../api/categorias'
import { listarGrupos } from '../../api/grupos'
import { atualizarProduto, excluirProduto, listarProdutos } from '../../api/produtos'
import type { Produto } from '../../types/produto'
import { ProdutoTable } from '../../components/produto/ProdutoTable'

const PAGE_SIZE = 10

export function Produtos() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [group, setGroup] = useState('')
  const [status, setStatus] = useState('todos')
  const [stock, setStock] = useState('todos')
  const [page, setPage] = useState(1)
  const [feedback, setFeedback] = useState('')

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      categoriaId: category || undefined,
      grupoId: group || undefined,
      busca: search || undefined,
    }),
    [page, category, group, search]
  )

  const products = useQuery({
    queryKey: ['produtos', queryParams],
    queryFn: () => listarProdutos(queryParams),
  })

  const categories = useQuery({ queryKey: ['categorias'], queryFn: listarCategorias })
  const groups = useQuery({ queryKey: ['grupos'], queryFn: listarGrupos })

  const remove = useMutation({
    mutationFn: (id: string) => excluirProduto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] })
      setFeedback('Produto excluído com sucesso.')
    },
  })

  const toggle = useMutation({
    mutationFn: (produto: Produto) =>
      atualizarProduto(produto.id, {
        categoriaId: produto.categoriaId,
        grupoId: produto.grupoId,
        nome: produto.nome,
        descricao: produto.descricao ?? '',
        codigo: produto.codigo ?? '',
        preco: produto.preco,
        estoqueMinimo: produto.estoqueMinimo,
        ativo: !produto.ativo,
        destaque: produto.destaque,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] })
      setFeedback('Status do produto atualizado.')
    },
  })

  const error = products.error || categories.error || groups.error || remove.error || toggle.error
  const itensPagina = products.data?.items ?? []
  const totalItems = products.data?.totalItems ?? 0
  const totalPages = products.data?.totalPages ?? 1
  const currentPage = products.data?.page ?? page

  const filtered = itensPagina.filter((produto) => {
    const matchesStatus = status === 'todos' || (status === 'ativos' ? produto.ativo : !produto.ativo)
    const matchesStock =
      stock === 'todos' ||
      (stock === 'normal'
        ? produto.estoqueAtual > produto.estoqueMinimo
        : stock === 'baixo'
          ? produto.estoqueAtual > 0 && produto.estoqueAtual <= produto.estoqueMinimo
          : produto.estoqueAtual <= 0)

    return matchesStatus && matchesStock
  })

  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, totalItems)

  const pageNumbers = useMemo<Array<number | '...'>>(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1)
    }

    const pages: Array<number | '...'> = [1]

    if (currentPage > 3) pages.push('...')

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
      pages.push(pageNumber)
    }

    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)

    return pages
  }, [currentPage, totalPages])

  function confirmDelete(produto: Produto) {
    if (window.confirm(`Excluir o produto "${produto.nome}"?`)) remove.mutate(produto.id)
  }

  function handlePageChange(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages || nextPage === currentPage) return
    setPage(nextPage)
  }

  function handleSearchChange(nextValue: string) {
    setSearch(nextValue)
    setPage(1)
  }

  function handleCategoryChange(nextValue: string) {
    setCategory(nextValue)
    setPage(1)
  }

  function handleGroupChange(nextValue: string) {
    setGroup(nextValue)
    setPage(1)
  }

  function handleStatusChange(nextValue: string) {
    setStatus(nextValue)
    setPage(1)
  }

  function handleStockChange(nextValue: string) {
    setStock(nextValue)
    setPage(1)
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-teal">Catálogo</p>
          <h1 className="mt-2 font-display text-3xl font-bold">Produtos</h1>
          <p className="mt-2 text-ink/55">Gerencie os produtos da sua empresa.</p>
        </div>

        <Link to="novo" className="flex w-fit items-center gap-2 rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white hover:bg-teal/90">
          <Plus size={18} />
          Novo produto
        </Link>
      </div>

      {feedback && (
        <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{feedback}</p>
      )}

      {error && (
        <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
          Não foi possível concluir a operação. Tente novamente.
        </p>
      )}

      <section className="mt-8 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 text-ink/35" size={18} />
            <input
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Buscar produto..."
              className="w-full rounded-xl border border-ink/15 bg-paper py-3 pl-10 pr-4 outline-none focus:border-teal"
            />
          </div>

          <select
            value={category}
            onChange={(event) => handleCategoryChange(event.target.value)}
            className="rounded-xl border border-ink/15 bg-paper px-3 py-3 text-sm outline-none focus:border-teal"
          >
            <option value="">Categoria</option>
            {categories.data?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nome}
              </option>
            ))}
          </select>

          <select
            value={group}
            onChange={(event) => handleGroupChange(event.target.value)}
            className="rounded-xl border border-ink/15 bg-paper px-3 py-3 text-sm outline-none focus:border-teal"
          >
            <option value="">Todos os grupos</option>
            {groups.data?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nome}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) => handleStatusChange(event.target.value)}
            className="rounded-xl border border-ink/15 bg-paper px-3 py-3 text-sm outline-none focus:border-teal"
          >
            <option value="todos">Todos os status</option>
            <option value="ativos">Ativos</option>
            <option value="inativos">Inativos</option>
          </select>

          <select
            value={stock}
            onChange={(event) => handleStockChange(event.target.value)}
            className="rounded-xl border border-ink/15 bg-paper px-3 py-3 text-sm outline-none focus:border-teal"
          >
            <option value="todos">Todo estoque</option>
            <option value="normal">Estoque normal</option>
            <option value="baixo">Estoque baixo</option>
            <option value="zerado">Sem estoque</option>
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 text-xs text-ink/45">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={15} />
            {totalItems === 0 ? 'Nenhum produto encontrado' : `${rangeStart}-${rangeEnd} de ${totalItems} produtos`}
          </div>
          <span>
            Página {currentPage} de {totalPages}
          </span>
        </div>
      </section>

      <div className="mt-5">
        {products.isLoading ? (
          <p className="rounded-2xl bg-white p-12 text-center text-sm text-ink/50">Carregando produtos...</p>
        ) : (
          <>
            <ProdutoTable
              produtos={filtered}
              categorias={categories.data ?? []}
              grupos={groups.data ?? []}
              onDelete={confirmDelete}
              onToggle={(produto) => toggle.mutate(produto)}
              busyId={toggle.isPending ? toggle.variables?.id : undefined}
            />

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-white p-4 shadow-sm">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || products.isFetching}
                className="inline-flex items-center gap-1 rounded-lg border border-ink/15 px-3 py-2 text-sm font-semibold text-ink/65 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Anterior
              </button>

              {pageNumbers.map((pageNumber, index) => {
                if (pageNumber === '...') {
                  return (
                    <span key={`ellipsis-${index}`} className="px-2 text-sm text-ink/45">
                      ...
                    </span>
                  )
                }

                const isCurrentPage = pageNumber === currentPage

                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => handlePageChange(pageNumber as number)}
                    disabled={products.isFetching}
                    className={`min-w-[2.5rem] rounded-lg px-3 py-2 text-sm font-semibold ${
                      isCurrentPage
                        ? 'bg-teal text-white shadow-sm'
                        : 'border border-ink/15 bg-paper text-ink/70 hover:border-teal hover:text-teal'
                    }`}
                  >
                    {pageNumber}
                  </button>
                )
              })}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || products.isFetching}
                className="inline-flex items-center gap-1 rounded-lg border border-ink/15 px-3 py-2 text-sm font-semibold text-ink/65 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Próxima
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}