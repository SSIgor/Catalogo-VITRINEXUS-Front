import { useEffect, useState } from 'react'
import { ArrowLeft, Package, Truck } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listarCategorias } from '../../api/categorias'
import { listarGrupos } from '../../api/grupos'
import { atualizarProduto, criarProduto, obterProduto, type ProdutoCreateResponse } from '../../api/produtos'
import { ProdutoForm, type ProdutoFormData } from '../../components/produto/ProdutoForm'
import { ProdutoImages } from '../../components/produto/ProdutoImages'
import { EstoqueBadge } from '../../components/produto/ProdutoStatusBadge'

export function ProdutoEditor() {
  const { id } = useParams(); const navigate = useNavigate(); const queryClient = useQueryClient(); const [feedback, setFeedback] = useState('')
  const editing = Boolean(id); const product = useQuery({ queryKey: ['produto', id], queryFn: () => obterProduto(id!), enabled: editing }); const categories = useQuery({ queryKey: ['categorias'], queryFn: listarCategorias }); const groups = useQuery({ queryKey: ['grupos'], queryFn: listarGrupos })
  const save = useMutation<Awaited<ReturnType<typeof atualizarProduto>> | ProdutoCreateResponse, Error, ProdutoFormData>({
    mutationFn: (data) => (editing ? atualizarProduto(id!, data) : criarProduto(data)),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] })
      setFeedback(editing ? 'Produto atualizado com sucesso.' : 'Produto criado com sucesso.')

      const productId = saved && typeof saved === 'object'
        ? ('produtoId' in saved ? saved.produtoId : 'id' in saved ? saved.id : undefined)
        : undefined

      if (!editing && productId) {
        navigate(`/admin/produtos/${productId}`, { replace: true })
      }
    },
  })
  useEffect(() => { if (save.isSuccess) { const timer = window.setTimeout(() => setFeedback(''), 4500); return () => window.clearTimeout(timer) } }, [save.isSuccess])
  const error = product.error || categories.error || groups.error || save.error
  if (editing && product.isLoading) return <p className="rounded-2xl bg-white p-12 text-center text-sm text-ink/50">Carregando produto...</p>
  if (editing && !product.data && product.isError) return <p className="rounded-2xl bg-rose-50 p-8 text-center text-sm text-rose-700">Não foi possível carregar este produto.</p>
  return <div><Link to="/admin/produtos" className="flex w-fit items-center gap-2 text-sm font-semibold text-ink/55 hover:text-teal"><ArrowLeft size={17} />Voltar para produtos</Link><div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-widest text-teal">{editing ? 'Editar produto' : 'Novo cadastro'}</p><h1 className="mt-2 font-display text-3xl font-bold">{editing ? product.data?.nome : 'Novo produto'}</h1></div>{editing && product.data && <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm"><Package size={18} className="text-teal" /><div><p className="text-xs text-ink/50">Estoque atual</p><p className="font-semibold">{product.data.estoqueAtual}</p></div><EstoqueBadge atual={product.data.estoqueAtual} minimo={product.data.estoqueMinimo} /><Link to={`/admin/estoque?produtoId=${product.data.id}`} className="ml-1 text-xs font-bold text-teal" title="Gerenciar estoque"><Truck size={16} /></Link></div>}</div>{feedback && <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{feedback}</p>}{error && <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">Não foi possível salvar o produto. Confira os dados e tente novamente.</p>}<div className="mt-8 grid gap-5 xl:grid-cols-[1fr_0.72fr]"><ProdutoForm produto={product.data} categorias={categories.data ?? []} grupos={groups.data ?? []} onSubmit={async (data) => { await save.mutateAsync(data) }} isSaving={save.isPending} /><ProdutoImages produtoId={product.data?.id} /></div></div>
}