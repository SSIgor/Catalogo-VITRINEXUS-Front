import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Calendar, Mail, Phone, ShoppingCart, RotateCw } from 'lucide-react'
import { obterCliente, listarVendasCliente, listarEnderecosCliente } from '../../api/clientes'
import { ClienteStatusBadge } from '../../components/cliente/ClienteStatusBadge'
import { EnderecoList } from '../../components/cliente/EnderecoList'
import { formatDate } from '../../utils/format'
import { messageForApiError } from '../../utils/apiError'

export function ClienteDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) {
    return <div className="rounded-xl bg-rose-50 p-4 text-rose-700">ID do cliente não fornecido</div>
  }

  const clienteQuery = useQuery({
    queryKey: ['cliente', id],
    queryFn: () => obterCliente(id),
  })

  const enderecosQuery = useQuery({
    queryKey: ['cliente', id, 'enderecos'],
    queryFn: () => listarEnderecosCliente(id),
    enabled: !!id,
  })

  const vendasQuery = useQuery({
    queryKey: ['vendas-cliente', id],
    queryFn: () => listarVendasCliente(id),
    enabled: !!id,
  })

  const cliente = clienteQuery.data
  const vendas = vendasQuery.data ?? []

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/clientes')}
          className="rounded-lg border border-ink/15 p-2 hover:bg-paper"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-teal">Relacionamento</p>
          <h1 className="mt-1 font-display text-3xl font-bold">Detalhes do Cliente</h1>
        </div>
      </div>

      {clienteQuery.error && (
        <div className="rounded-xl bg-rose-50 p-4 text-rose-700">
          <p className="font-semibold">Erro ao carregar cliente</p>
          <p className="mt-1 text-sm">
            {messageForApiError(clienteQuery.error, 'Não foi possível carregar os dados do cliente.')}
          </p>
        </div>
      )}

      {clienteQuery.isLoading ? (
        <p className="rounded-2xl bg-white p-12 text-center text-sm text-ink/50">Carregando cliente...</p>
      ) : cliente ? (
        <>
          {/* Dados do Cliente */}
          <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">Informações Pessoais</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-ink/45">Nome</p>
                <p className="mt-2 text-base font-semibold">{cliente.nome}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-ink/45">Status</p>
                <div className="mt-2">
                  <ClienteStatusBadge ativo={cliente.ativo} />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-ink/45">Email</p>
                <p className="mt-2 flex items-center gap-2 text-base text-ink/55">
                  <Mail size={18} className="text-teal" />
                  {cliente.email || '-'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-ink/45">Telefone</p>
                <p className="mt-2 flex items-center gap-2 text-base text-ink/55">
                  <Phone size={18} className="text-teal" />
                  {cliente.telefone || '-'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-ink/45">WhatsApp</p>
                <p className="mt-2 flex items-center gap-2 text-base text-ink/55">
                  <Phone size={18} className="text-teal" />
                  {cliente.whatsApp || '-'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-ink/45">Data de Cadastro</p>
                <p className="mt-2 flex items-center gap-2 text-base text-ink/55">
                  <Calendar size={18} className="text-teal" />
                  {formatDate(cliente.dataCriacao)}
                </p>
              </div>
            </div>
          </section>

          {/* Endereços */}
          <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">Endereços de Entrega</h2>
            <div className="mt-6">
              {enderecosQuery.isLoading ? (
                <div className="text-center">
                  <p className="text-sm text-ink/50">Carregando endereços...</p>
                </div>
              ) : enderecosQuery.error ? (
                <div className="space-y-4">
                  <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
                    {messageForApiError(enderecosQuery.error, 'Não foi possível carregar os endereços deste cliente.')}
                  </p>
                  <button
                    onClick={() => enderecosQuery.refetch()}
                    className="inline-flex items-center gap-2 rounded-lg bg-teal/10 px-4 py-2 text-sm font-semibold text-teal hover:bg-teal/20"
                  >
                    <RotateCw size={16} />
                    Tentar novamente
                  </button>
                </div>
              ) : (
                <EnderecoList enderecos={enderecosQuery.data ?? []} />
              )}
            </div>
          </section>

          {/* Histórico de Pedidos */}
          {vendasQuery.isLoading ? (
            <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm text-ink/50">Carregando histórico de pedidos...</p>
            </section>
          ) : vendasQuery.error ? (
            <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">Histórico de Pedidos</h2>
              <p className="mt-4 text-sm text-ink/50">
                {messageForApiError(vendasQuery.error, 'Não foi possível carregar o histórico de pedidos.')}
              </p>
            </section>
          ) : vendas.length > 0 ? (
            <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">Histórico de Pedidos</h2>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-ink/10 bg-paper text-xs uppercase tracking-wider text-ink/45">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Número</th>
                      <th className="px-4 py-3 font-semibold">Data</th>
                      <th className="px-4 py-3 font-semibold">Valor</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Pagamento</th>
                      <th className="px-4 py-3 font-semibold">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10">
                    {vendas.map((venda) => (
                      <tr key={venda.id} className="hover:bg-paper/70">
                        <td className="px-4 py-3 font-semibold">#{String(venda.numero).padStart(6, '0')}</td>
                        <td className="px-4 py-3 text-ink/55">{formatDate(venda.dataCriacao)}</td>
                        <td className="px-4 py-3 font-semibold">
                          R$ {venda.valorTotal.toFixed(2).replace('.', ',')}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              venda.status === 'Concluida' || venda.status === 'Concluída'
                                ? 'bg-emerald-100 text-emerald-700'
                                : venda.status === 'Pendente'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-ink/10 text-ink/55'
                            }`}
                          >
                            {venda.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              venda.statusPagamento === 'Pago'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {venda.statusPagamento}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => navigate(`/admin/vendas/${venda.id}`)}
                            className="rounded-lg bg-teal/10 px-3 py-2 text-xs font-semibold text-teal hover:bg-teal/20"
                          >
                            Ver pedido
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : (
            <section className="mt-8 rounded-2xl bg-white p-12 shadow-sm text-center">
              <ShoppingCart className="mx-auto text-ink/25" size={32} />
              <p className="mt-4 text-sm text-ink/50">Nenhum pedido encontrado para este cliente.</p>
            </section>
          )}
        </>
      ) : null}
    </div>
  )
}
