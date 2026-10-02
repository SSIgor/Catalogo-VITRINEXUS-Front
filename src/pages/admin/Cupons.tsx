import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { excluirCupom, listarCupons } from '../../api/cupons'
import type { Cupom } from '../../types/cupom'
import { CupomTable } from '../../components/cupom/CupomTable'

function apiMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback
  if (error.response?.status === 403) return 'Você não possui permissão para realizar esta ação.'
  if (error.response?.status === 404) return 'Cupom não encontrado.'
  const detail = error.response?.data as { message?: string; title?: string } | string | undefined
  if (typeof detail === 'string' && detail) return detail
  if (detail && typeof detail === 'object' && (detail.message || detail.title)) return detail.message ?? detail.title ?? fallback
  return fallback
}

export function Cupons() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')

  const query = useQuery({ queryKey: ['cupons'], queryFn: listarCupons })

  const remove = useMutation({
    mutationFn: (id: string) => excluirCupom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cupons'] })
      setFeedback('Cupom excluído com sucesso.')
      setError('')
    },
    onError: (reason) => {
      setError(apiMessage(reason, 'Não foi possível excluir o cupom.'))
      setFeedback('')
    },
  })

  const filtered = (query.data ?? [])
    .filter((cupom) => cupom.codigo.toLowerCase().includes(search.toLowerCase()))
    .sort((left, right) => left.codigo.localeCompare(right.codigo, 'pt-BR'))

  function confirmDelete(cupom: Cupom) {
    if (window.confirm(`Tem certeza que deseja excluir o cupom ${cupom.codigo}?`)) {
      remove.mutate(cupom.id)
    }
  }

  return <div>
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-teal">Marketing</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Cupons</h1>
        <p className="mt-2 text-ink/55">Gerencie os cupons de desconto da sua empresa.</p>
      </div>
      <Link to="novo" className="flex w-fit items-center gap-2 rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white hover:bg-teal/90"><Plus size={18} />Novo cupom</Link>
    </div>

    {feedback && <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{feedback}</p>}
    {error && <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    {query.error && <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{apiMessage(query.error, 'Não foi possível carregar os cupons.')}</p>}

    <section className="mt-8 rounded-2xl bg-white p-4 shadow-sm">
      <div className="relative">
        <Search className="absolute left-3.5 top-3.5 text-ink/35" size={18} />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar cupom..." className="w-full rounded-xl border border-ink/15 bg-paper py-3 pl-10 pr-4 outline-none focus:border-teal" />
      </div>
      <p className="mt-4 text-xs text-ink/45">{filtered.length} cupom(ns) encontrado(s)</p>
    </section>

    <div className="mt-5">
      {query.isLoading ? <p className="rounded-2xl bg-white p-12 text-center text-sm text-ink/50">Carregando cupons...</p> : <CupomTable cupons={filtered} onDelete={confirmDelete} busyId={remove.isPending ? remove.variables : undefined} />}
    </div>
  </div>
}
