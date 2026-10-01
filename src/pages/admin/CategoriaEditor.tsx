import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import axios from 'axios'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { atualizarCategoria, criarCategoria, obterCategoria } from '../../api/categorias'
import { CategoriaForm, type CategoriaFormData } from '../../components/categoria/CategoriaForm'

function apiMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback
  if (error.response?.status === 403) return 'Você não possui permissão para realizar esta ação.'
  if (error.response?.status === 404) return 'Categoria não encontrada.'
  const detail = error.response?.data as { message?: string; title?: string } | string | undefined
  if (typeof detail === 'string' && detail) return detail
  if (detail && typeof detail === 'object' && (detail.message || detail.title)) return detail.message ?? detail.title ?? fallback
  return fallback
}

export function CategoriaEditor() {
  const { id } = useParams(); const navigate = useNavigate(); const queryClient = useQueryClient(); const editing = Boolean(id); const [feedback, setFeedback] = useState('')
  const category = useQuery({ queryKey: ['categoria', id], queryFn: () => obterCategoria(id!), enabled: editing });
  const save = useMutation({ mutationFn: (data: CategoriaFormData) => editing ? atualizarCategoria(id!, data) : criarCategoria(data), onSuccess: (saved) => { queryClient.invalidateQueries({ queryKey: ['categorias'] }); queryClient.invalidateQueries({ queryKey: ['produtos'] }); setFeedback(editing ? 'Categoria atualizada com sucesso.' : 'Categoria criada com sucesso.'); if (!editing && saved.id) navigate(`/admin/categorias/${saved.id}`, { replace: true }) } })
  useEffect(() => { if (save.isSuccess) { const timer = window.setTimeout(() => setFeedback(''), 4500); return () => window.clearTimeout(timer) } }, [save.isSuccess])
  if (editing && category.isLoading) return <p className="rounded-2xl bg-white p-12 text-center text-sm text-ink/50">Carregando categoria...</p>
  if (editing && category.isError) return <p className="rounded-2xl bg-rose-50 p-8 text-center text-sm text-rose-700">{apiMessage(category.error, 'Não foi possível carregar a categoria.')}</p>
  const error = category.error || save.error
  return <div><Link to="/admin/categorias" className="flex w-fit items-center gap-2 text-sm font-semibold text-ink/55 hover:text-teal"><ArrowLeft size={17} />Voltar para categorias</Link><div className="mt-5"><p className="text-sm font-semibold uppercase tracking-widest text-teal">{editing ? 'Editar categoria' : 'Novo cadastro'}</p><h1 className="mt-2 font-display text-3xl font-bold">{editing ? category.data?.nome : 'Nova categoria'}</h1></div>{feedback && <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{feedback}</p>}{error && <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{apiMessage(error, 'Não foi possível salvar a categoria. Confira os dados e tente novamente.')}</p>}<div className="mt-8 max-w-3xl"><CategoriaForm categoria={category.data} onSubmit={async (data) => { await save.mutateAsync(data) }} isSaving={save.isPending} /></div></div>
}
