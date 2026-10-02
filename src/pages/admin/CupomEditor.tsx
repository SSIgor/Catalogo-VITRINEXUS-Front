import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import axios from 'axios'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { atualizarCupom, criarCupom, obterCupom } from '../../api/cupons'
import { CupomForm, type CupomFormData } from '../../components/cupom/CupomForm'

function apiMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback
  if (error.response?.status === 403) return 'Você não possui permissão para realizar esta ação.'
  if (error.response?.status === 404) return 'Cupom não encontrado.'
  const detail = error.response?.data as { message?: string; title?: string } | string | undefined
  if (typeof detail === 'string' && detail) return detail
  if (detail && typeof detail === 'object' && (detail.message || detail.title)) return detail.message ?? detail.title ?? fallback
  return fallback
}

export function CupomEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const client = useQueryClient()
  const editing = Boolean(id)
  const [feedback, setFeedback] = useState('')

  const query = useQuery({
    queryKey: ['cupom', id],
    queryFn: () => obterCupom(id!),
    enabled: editing,
  })

  const save = useMutation({
    mutationFn: (data: CupomFormData) => editing ? atualizarCupom(id!, data) : criarCupom(data),
    onSuccess: (saved) => {
      client.invalidateQueries({ queryKey: ['cupons'] })
      setFeedback(editing ? 'Cupom atualizado com sucesso.' : 'Cupom criado com sucesso.')
      if (!editing && saved.id) {
        navigate(`/admin/cupons/${saved.id}`, { replace: true })
      }
    },
    onError: (error) => error,
  })

  useEffect(() => {
    if (save.isSuccess) {
      const timer = window.setTimeout(() => setFeedback(''), 4500)
      return () => window.clearTimeout(timer)
    }
  }, [save.isSuccess])

  if (editing && query.isLoading) return <p className="rounded-2xl bg-white p-12 text-center text-sm text-ink/50">Carregando cupom...</p>
  if (editing && query.isError) return <p className="rounded-2xl bg-rose-50 p-8 text-center text-sm text-rose-700">{apiMessage(query.error, 'Não foi possível carregar o cupom.')}</p>

  const error = query.error || save.error

  return <div>
    <Link to="/admin/cupons" className="flex w-fit items-center gap-2 text-sm font-semibold text-ink/55 hover:text-teal"><ArrowLeft size={17} />Voltar para cupons</Link>
    <div className="mt-5">
      <p className="text-sm font-semibold uppercase tracking-widest text-teal">{editing ? 'Editar cupom' : 'Novo cadastro'}</p>
      <h1 className="mt-2 font-display text-3xl font-bold">{editing ? query.data?.codigo : 'Novo cupom'}</h1>
    </div>

    {feedback && <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{feedback}</p>}
    {error && <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{apiMessage(error, 'Não foi possível salvar o cupom. Confira os dados e tente novamente.')}</p>}

    <div className="mt-8 max-w-3xl">
      <CupomForm cupom={query.data} onSubmit={async (data) => { await save.mutateAsync(data) }} isSaving={save.isPending} />
    </div>
  </div>
}
