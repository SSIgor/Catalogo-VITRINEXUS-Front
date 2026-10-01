import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { cancelarVenda, concluirVenda, obterVenda } from '../../api/vendas'
import { messageForApiError } from '../../utils/apiError'
import { VendaAcoes } from '../../components/venda/VendaAcoes'
import { VendaDetalhes } from '../../components/venda/VendaDetalhes'
import { VendaItens } from '../../components/venda/VendaItens'
import { VendaResumo } from '../../components/venda/VendaResumo'

export function VendaDetalhePage() {
  const { id } = useParams(); const navigate = useNavigate(); const client = useQueryClient()
  const query = useQuery({ queryKey: ['venda', id], queryFn: () => obterVenda(id!), enabled: Boolean(id) })
  const mutation = useMutation({ mutationFn: (action: 'concluir' | 'cancelar') => action === 'concluir' ? concluirVenda(id!) : cancelarVenda(id!), onSuccess: (_, action) => { client.invalidateQueries({ queryKey: ['vendas'] }); client.invalidateQueries({ queryKey: ['venda', id] }); if (action === 'cancelar') { client.invalidateQueries({ queryKey: ['estoque'] }); client.invalidateQueries({ queryKey: ['estoqueBaixo'] }); client.invalidateQueries({ queryKey: ['estoqueZerado'] }); client.invalidateQueries({ queryKey: ['produtos'] }) } }, onError: (error) => error })
  if (query.isLoading) return <p className="rounded-2xl bg-white p-12 text-center text-sm text-ink/50">Carregando venda...</p>
  if (query.isError || !query.data) return <div className="rounded-2xl bg-rose-50 p-8 text-center text-sm text-rose-700">{messageForApiError(query.error, 'Não foi possível carregar a venda.')}</div>
  const venda = query.data
  return <div><Link to="/admin/vendas" className="flex w-fit items-center gap-2 text-sm font-semibold text-ink/55 hover:text-teal"><ArrowLeft size={17} />Voltar para vendas</Link>{mutation.error && <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{messageForApiError(mutation.error, 'Não foi possível atualizar a venda.')}</p>}{mutation.isSuccess && <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{mutation.variables === 'cancelar' ? 'Venda cancelada com sucesso.' : 'Venda concluída com sucesso.'}</p>}<div className="mt-5"><VendaDetalhes venda={venda} /></div><div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.7fr]"><VendaItens itens={venda.itens} /><VendaResumo venda={venda} /></div><div className="mt-5"><VendaAcoes venda={venda} isBusy={mutation.isPending} onConcluir={async () => { await mutation.mutateAsync('concluir'); navigate(`/admin/vendas/${id}`) }} onCancelar={async () => { await mutation.mutateAsync('cancelar'); navigate(`/admin/vendas/${id}`) }} /></div></div>
}
