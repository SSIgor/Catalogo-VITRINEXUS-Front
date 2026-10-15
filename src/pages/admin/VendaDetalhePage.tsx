import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { cancelarVenda, confirmarPagamentoVenda, confirmarVenda, concluirVenda, obterVenda } from '../../api/vendas'
import { messageForApiError } from '../../utils/apiError'
import { VendaAcoes } from '../../components/venda/VendaAcoes'
import { VendaDetalhes } from '../../components/venda/VendaDetalhes'
import { VendaItens } from '../../components/venda/VendaItens'
import { VendaResumo } from '../../components/venda/VendaResumo'

type AcaoVenda = 'confirmar' | 'confirmarPagamento' | 'concluir' | 'cancelar'

const successMessage: Record<AcaoVenda, string> = {
  confirmar: 'Venda confirmada com sucesso. O estoque foi atualizado.',
  confirmarPagamento: 'Pagamento confirmado com sucesso.',
  concluir: 'Venda concluída com sucesso.',
  cancelar: 'Venda cancelada com sucesso.',
}

export function VendaDetalhePage() {
  const { id } = useParams()
  const client = useQueryClient()
  const query = useQuery({ queryKey: ['venda', id], queryFn: () => obterVenda(id!), enabled: Boolean(id) })
  const mutation = useMutation({
    mutationFn: (action: AcaoVenda) => {
      if (action === 'confirmar') return confirmarVenda(id!)
      if (action === 'confirmarPagamento') return confirmarPagamentoVenda(id!)
      if (action === 'concluir') return concluirVenda(id!)
      return cancelarVenda(id!)
    },
    onSuccess: async (_, action) => {
      const invalidations = [
        client.invalidateQueries({ queryKey: ['vendas'] }),
        client.invalidateQueries({ queryKey: ['venda', id] }),
      ]
      if (action === 'confirmar' || action === 'cancelar') {
        invalidations.push(
          client.invalidateQueries({ queryKey: ['estoque'] }),
          client.invalidateQueries({ queryKey: ['estoqueBaixo'] }),
          client.invalidateQueries({ queryKey: ['estoqueZerado'] }),
          client.invalidateQueries({ queryKey: ['produtos'] }),
        )
      }
      await Promise.all(invalidations)
    },
    onError: (error) => error,
  })

  if (query.isLoading) return <p className="rounded-2xl bg-white p-12 text-center text-sm text-ink/50">Carregando venda...</p>
  if (query.isError || !query.data) return <div className="rounded-2xl bg-rose-50 p-8 text-center text-sm text-rose-700">{messageForApiError(query.error, 'Não foi possível carregar a venda.')}</div>

  const venda = query.data
  return <div>
    <Link to="/admin/vendas" className="flex w-fit items-center gap-2 text-sm font-semibold text-ink/55 hover:text-teal"><ArrowLeft size={17} />Voltar para vendas</Link>
    {mutation.error && <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{messageForApiError(mutation.error, 'Não foi possível atualizar a venda.')}</p>}
    {mutation.isSuccess && mutation.variables && <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{successMessage[mutation.variables]}</p>}
    <div className="mt-5"><VendaDetalhes venda={venda} /></div>
    <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.7fr]"><VendaItens itens={venda.itens} /><VendaResumo venda={venda} /></div>
    <div className="mt-5"><VendaAcoes
      venda={venda}
      isBusy={mutation.isPending}
      onConfirmar={() => mutation.mutateAsync('confirmar')}
      onConfirmarPagamento={() => mutation.mutateAsync('confirmarPagamento')}
      onConcluir={() => mutation.mutateAsync('concluir')}
      onCancelar={() => mutation.mutateAsync('cancelar')}
    /></div>
  </div>
}
