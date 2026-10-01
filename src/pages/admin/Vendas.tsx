import { useDeferredValue, useMemo, useState } from 'react'
import { RefreshCw, Search, ShoppingBag } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { listarVendas } from '../../api/vendas'
import type { StatusPagamento, StatusVenda, Venda } from '../../types/venda'
import { VendaCard } from '../../components/venda/VendaCard'
import { messageForApiError } from '../../utils/apiError'

function clienteSearchText(cliente: Venda['cliente']) {
  if (!cliente) return ''
  if (typeof cliente === 'string') return cliente.toLowerCase()
  return `${cliente.nome ?? ''} ${cliente.telefone ?? ''} ${cliente.whatsApp ?? ''}`.toLowerCase()
}

export function Vendas() {
  const query = useQuery({ queryKey: ['vendas'], queryFn: listarVendas })
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [saleStatus, setSaleStatus] = useState('todos')
  const [paymentStatus, setPaymentStatus] = useState('todos')
  const [period, setPeriod] = useState('todos')

  const filtered = useMemo(() => {
    const now = Date.now()
    const days = period === 'hoje' ? 1 : period === '7' ? 7 : period === '30' ? 30 : 0

    return (query.data ?? []).filter((venda) => {
      const text = deferredSearch.toLowerCase()
      const number = venda.numero?.toString() ?? ''
      const client = clienteSearchText(venda.cliente)
      const date = new Date(venda.dataCriacao ?? venda.criadaEm).getTime()
      const matchesSearch = !text || number.includes(text) || client.includes(text)
      const matchesSale = saleStatus === 'todos' || venda.status === saleStatus
      const matchesPayment = paymentStatus === 'todos' || venda.statusPagamento === paymentStatus
      const matchesPeriod = !days || (Number.isNaN(date) ? false : now - date <= days * 86400000)

      return matchesSearch && matchesSale && matchesPayment && matchesPeriod
    })
  }, [query.data, deferredSearch, saleStatus, paymentStatus, period])

  const sales = query.data ?? []
  const paid = sales.filter((venda) => venda.statusPagamento === 'Pago').length
  const pending = sales.filter((venda) => venda.status === 'Pendente').length
  const canceled = sales.filter((venda) => venda.status === 'Cancelada').length

  return <div>
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-teal">Operacao</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Vendas</h1>
        <p className="mt-2 text-ink/55">Pedidos realizados pelo catalogo.</p>
      </div>
      <button onClick={() => query.refetch()} disabled={query.isFetching} className="flex w-fit items-center gap-2 rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm font-semibold hover:border-teal disabled:opacity-50">
        <RefreshCw size={17} className={query.isFetching ? 'animate-spin' : ''} />
        Atualizar
      </button>
    </div>

    {query.error && <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{messageForApiError(query.error, 'Nao foi possivel carregar as vendas.')}</p>}

    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[
        ['Vendas', sales.length],
        ['Pendentes', pending],
        ['Pagas', paid],
        ['Canceladas', canceled],
      ].map(([label, value]) => <div key={label} className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink/45">{label}</p>
        <p className="mt-2 font-display text-3xl font-bold">{query.isLoading ? '...' : value}</p>
      </div>)}
    </section>

    <section className="mt-8 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 text-ink/35" size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar venda..." className="w-full rounded-xl border border-ink/15 bg-paper py-3 pl-10 pr-4 outline-none focus:border-teal" />
        </div>
        <select value={saleStatus} onChange={(event) => setSaleStatus(event.target.value)} className="rounded-xl border border-ink/15 bg-paper px-3 py-3 text-sm">
          <option value="todos">Venda: Todos</option>
          {(['Pendente', 'Confirmada', 'Concluida', 'Cancelada'] as StatusVenda[]).map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)} className="rounded-xl border border-ink/15 bg-paper px-3 py-3 text-sm">
          <option value="todos">Pagamento: Todos</option>
          {(['Pendente', 'Pago'] as StatusPagamento[]).map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <select value={period} onChange={(event) => setPeriod(event.target.value)} className="rounded-xl border border-ink/15 bg-paper px-3 py-3 text-sm">
          <option value="todos">Todos os periodos</option>
          <option value="hoje">Hoje</option>
          <option value="7">Ultimos 7 dias</option>
          <option value="30">Ultimos 30 dias</option>
        </select>
      </div>
      <p className="mt-4 text-xs text-ink/45">{filtered.length} pedido(s) encontrado(s)</p>
    </section>

    <div className="mt-5">
      {query.isLoading ? <p className="rounded-2xl bg-white p-12 text-center text-sm text-ink/50">Carregando vendas...</p> : filtered.length ? <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">{filtered.map((venda) => <VendaCard key={venda.id} venda={venda} />)}</div> : <div className="rounded-2xl bg-white p-12 text-center"><ShoppingBag className="mx-auto text-ink/25" size={32} /><p className="mt-4 text-sm text-ink/50">Nenhuma venda encontrada.</p></div>}
    </div>
  </div>
}
