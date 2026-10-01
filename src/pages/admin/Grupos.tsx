import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ativarGrupo, atualizarGrupo, desativarGrupo, excluirGrupo, listarGrupos } from '../../api/grupos'
import type { Grupo } from '../../types/grupo'
import { GrupoTable } from '../../components/grupo/GrupoTable'

function apiMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback
  if (error.response?.status === 403) return 'Você não possui permissão para realizar esta ação.'
  if (error.response?.status === 409) return 'Não é possível excluir este grupo porque existem produtos vinculados.'
  if (error.response?.status === 404) return 'Grupo não encontrado.'
  const detail = error.response?.data as { message?: string; title?: string } | string | undefined
  if (typeof detail === 'string' && detail) return detail
  if (detail && typeof detail === 'object' && (detail.message || detail.title)) return detail.message ?? detail.title ?? fallback
  return fallback
}

export function Grupos() {
  const client = useQueryClient(); const [search, setSearch] = useState(''); const [status, setStatus] = useState('todos'); const [feedback, setFeedback] = useState(''); const [error, setError] = useState('')
  const query = useQuery({ queryKey: ['grupos'], queryFn: listarGrupos })
  const invalidate = () => { client.invalidateQueries({ queryKey: ['grupos'] }); client.invalidateQueries({ queryKey: ['produtos'] }) }
  const remove = useMutation({ mutationFn: excluirGrupo, onSuccess: () => { invalidate(); setFeedback('Grupo excluído com sucesso.'); setError('') }, onError: (reason) => { setError(apiMessage(reason, 'Não foi possível excluir o grupo.')); setFeedback('') } })
  const toggle = useMutation({ mutationFn: (grupo: Grupo) => grupo.ativo ? desativarGrupo(grupo.id) : ativarGrupo(grupo.id), onSuccess: (_, grupo) => { invalidate(); setFeedback(grupo.ativo ? 'Grupo desativado.' : 'Grupo ativado.'); setError('') }, onError: (reason) => { setError(apiMessage(reason, 'Não foi possível atualizar o status do grupo.')); setFeedback('') } })
  const filtered = (query.data ?? []).filter((grupo) => grupo.nome.toLowerCase().includes(search.toLowerCase()) && (status === 'todos' || (status === 'ativos' ? grupo.ativo : !grupo.ativo))).sort((left, right) => left.ordem - right.ordem || left.nome.localeCompare(right.nome, 'pt-BR'))
  function confirmDelete(grupo: Grupo) { if (window.confirm(`Excluir o grupo "${grupo.nome}"? Esta ação não exclui produtos.`)) remove.mutate(grupo.id) }
  return <div><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-widest text-teal">Catálogo</p><h1 className="mt-2 font-display text-3xl font-bold">Grupos</h1><p className="mt-2 text-ink/55">Organize os produtos por perfil.</p></div><Link to="novo" className="flex w-fit items-center gap-2 rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white hover:bg-teal/90"><Plus size={18} />Novo grupo</Link></div>{feedback && <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{feedback}</p>}{error && <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}{query.error && <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{apiMessage(query.error, 'Não foi possível carregar os grupos.')}</p>}<section className="mt-8 rounded-2xl bg-white p-4 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3.5 top-3.5 text-ink/35" size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar grupo..." className="w-full rounded-xl border border-ink/15 bg-paper py-3 pl-10 pr-4 outline-none focus:border-teal" /></div><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-ink/15 bg-paper px-3 py-3 text-sm outline-none focus:border-teal"><option value="todos">Todos</option><option value="ativos">Ativos</option><option value="inativos">Inativos</option></select></div><p className="mt-4 text-xs text-ink/45">{filtered.length} grupo(s) encontrado(s)</p></section><div className="mt-5">{query.isLoading ? <p className="rounded-2xl bg-white p-12 text-center text-sm text-ink/50">Carregando grupos...</p> : <GrupoTable grupos={filtered} onDelete={confirmDelete} onToggle={(grupo) => toggle.mutate(grupo)} busyId={toggle.isPending ? toggle.variables?.id : remove.isPending ? remove.variables : undefined} />}</div></div>
}
