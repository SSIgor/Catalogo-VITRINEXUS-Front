import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { atualizarCategoria, excluirCategoria, listarCategorias } from '../../api/categorias'
import type { Categoria } from '../../types/categoria'
import { CategoriaTable } from '../../components/categoria/CategoriaTable'

function apiMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback
  if (error.response?.status === 403) return 'Você não possui permissão para realizar esta ação.'
  const detail = error.response?.data as { message?: string; title?: string } | string | undefined
  if (typeof detail === 'string' && detail) return detail
  if (detail && typeof detail === 'object' && (detail.message || detail.title)) return detail.message ?? detail.title ?? fallback
  if (error.response?.status === 409) return 'Esta categoria possui produtos vinculados.'
  if (error.response?.status === 404) return 'Categoria não encontrada.'
  return fallback
}

export function Categorias() {
  const queryClient = useQueryClient(); const [search, setSearch] = useState(''); const [feedback, setFeedback] = useState(''); const [error, setError] = useState('')
  const query = useQuery({ queryKey: ['categorias'], queryFn: listarCategorias })
  const remove = useMutation({ mutationFn: (id: string) => excluirCategoria(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categorias'] }); queryClient.invalidateQueries({ queryKey: ['produtos'] }); setFeedback('Categoria excluída com sucesso.'); setError('') }, onError: (reason) => { setError(apiMessage(reason, 'Não foi possível excluir a categoria.')); setFeedback('') } })
  const toggle = useMutation({ mutationFn: (categoria: Categoria) => atualizarCategoria(categoria.id, { nome: categoria.nome, descricao: categoria.descricao ?? '', imagemUrl: categoria.imagemUrl ?? '', ordem: categoria.ordem, ativo: !categoria.ativo }), onSuccess: (_, categoria) => { queryClient.invalidateQueries({ queryKey: ['categorias'] }); queryClient.invalidateQueries({ queryKey: ['produtos'] }); setFeedback(categoria.ativo ? 'Categoria desativada.' : 'Categoria ativada.'); setError('') }, onError: (reason) => { setError(apiMessage(reason, 'Não foi possível atualizar o status da categoria.')); setFeedback('') } })
  const filtered = (query.data ?? []).filter((categoria) => categoria.nome.toLowerCase().includes(search.toLowerCase())).sort((left, right) => left.ordem - right.ordem || left.nome.localeCompare(right.nome, 'pt-BR'))
  function confirmDelete(categoria: Categoria) { if (window.confirm(`Excluir a categoria "${categoria.nome}"? Esta ação não exclui produtos.`)) remove.mutate(categoria.id) }
  return <div><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-widest text-teal">Catálogo</p><h1 className="mt-2 font-display text-3xl font-bold">Categorias</h1><p className="mt-2 text-ink/55">Organize os produtos da sua empresa.</p></div><Link to="nova" className="flex w-fit items-center gap-2 rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white hover:bg-teal/90"><Plus size={18} />Nova categoria</Link></div>{feedback && <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{feedback}</p>}{error && <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}{query.error && <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{apiMessage(query.error, 'Não foi possível carregar as categorias.')}</p>}<section className="mt-8 rounded-2xl bg-white p-4 shadow-sm"><div className="relative"><Search className="absolute left-3.5 top-3.5 text-ink/35" size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar categoria..." className="w-full rounded-xl border border-ink/15 bg-paper py-3 pl-10 pr-4 outline-none focus:border-teal" /></div><p className="mt-4 text-xs text-ink/45">{filtered.length} categoria(s) encontrada(s)</p></section><div className="mt-5">{query.isLoading ? <p className="rounded-2xl bg-white p-12 text-center text-sm text-ink/50">Carregando categorias...</p> : <CategoriaTable categorias={filtered} onDelete={confirmDelete} onToggle={(categoria) => toggle.mutate(categoria)} busyId={toggle.isPending ? toggle.variables?.id : remove.isPending ? remove.variables : undefined} />}</div></div>
}
