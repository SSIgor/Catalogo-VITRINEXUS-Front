import { useDeferredValue, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, RefreshCw, Search, ShoppingBag } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { listarVendas } from '../../api/vendas'
import { VendaCard } from '../../components/venda/VendaCard'
import { messageForApiError } from '../../utils/apiError'
import { dataLocalParaInput, filtrarVendas, paginarVendas } from '../../utils/vendasListagem'

export function Vendas() {
  const query = useQuery({ queryKey: ['vendas'], queryFn: listarVendas })
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [saleStatus, setSaleStatus] = useState<'todas' | 'pendentes' | 'canceladas'>('todas')
  const [paymentStatus, setPaymentStatus] = useState<'todos' | 'pagas' | 'nao-pagas'>('todos')
  const [dataInicial, setDataInicial] = useState(() => dataLocalParaInput(new Date()))
  const [dataFinal, setDataFinal] = useState(() => dataLocalParaInput(new Date()))
  const [page, setPage] = useState(1)
  const hoje = dataLocalParaInput(new Date())

  const filtered = useMemo(
    () => filtrarVendas(query.data ?? [], { busca: deferredSearch, pagamento: paymentStatus, situacao: saleStatus, dataInicial, dataFinal }),
    [query.data, deferredSearch, paymentStatus, saleStatus, dataInicial, dataFinal]
  )
  const paginacao = useMemo(() => paginarVendas(filtered, page), [filtered, page])

  const sales = query.data ?? []
  const paid = sales.filter((venda) => venda.statusPagamento === 'Pago').length
  const pending = sales.filter((venda) => venda.status === 'Pendente').length
  const canceled = sales.filter((venda) => venda.status === 'Cancelada').length

  return <div>
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-teal">Operação</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Vendas</h1>
        <p className="mt-2 text-ink/55">Pedidos realizados pelo catálogo.</p>
      </div>
      <button onClick={() => query.refetch()} disabled={query.isFetching} className="flex w-fit items-center gap-2 rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm font-semibold hover:border-teal disabled:opacity-50">
        <RefreshCw size={17} className={query.isFetching ? 'animate-spin' : ''} />
        Atualizar
      </button>
    </div>

    {query.error && <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{messageForApiError(query.error, 'Não foi possível carregar as vendas.')}</p>}

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

    <section className="mt-8 rounded-2xl border border-ink/10 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-lg font-bold text-ink">Filtros de vendas</h2>
        {dataInicial === hoje && dataFinal === hoje && <p className="text-xs font-medium text-ink/45">Exibindo vendas criadas hoje</p>}
      </div>
      <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[minmax(250px,2fr)_repeat(4,minmax(135px,1fr))]">
        <label className="block min-w-0 text-xs font-semibold text-ink/60 sm:col-span-2 lg:col-span-1">
          <span>Buscar venda</span>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" size={17} />
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Buscar venda..." className="h-11 w-full rounded-lg border border-ink/15 bg-paper pl-10 pr-3 text-sm font-normal text-ink outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/10" />
          </div>
        </label>
        <label className="block min-w-0 text-xs font-semibold text-ink/60">
          <span>Data de criação inicial</span>
          <input type="date" value={dataInicial} onChange={(event) => { setDataInicial(event.target.value); setPage(1) }} aria-label="Data de criação inicial" className="mt-1 h-11 w-full rounded-lg border border-ink/15 bg-paper px-3 text-sm font-normal text-ink outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/10" />
        </label>
        <label className="block min-w-0 text-xs font-semibold text-ink/60">
          <span>Data de criação final</span>
          <input type="date" value={dataFinal} onChange={(event) => { setDataFinal(event.target.value); setPage(1) }} aria-label="Data de criação final" className="mt-1 h-11 w-full rounded-lg border border-ink/15 bg-paper px-3 text-sm font-normal text-ink outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/10" />
        </label>
        <label className="block min-w-0 text-xs font-semibold text-ink/60">
          <span>Pagamento</span>
          <select value={paymentStatus} onChange={(event) => { setPaymentStatus(event.target.value as typeof paymentStatus); setPage(1) }} aria-label="Filtrar por pagamento" className="mt-1 h-11 w-full rounded-lg border border-ink/15 bg-paper px-3 text-sm font-normal text-ink outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/10">
            <option value="todos">Pagamento: Todos</option>
            <option value="pagas">Pagas</option>
            <option value="nao-pagas">Não pagas</option>
          </select>
        </label>
        <label className="block min-w-0 text-xs font-semibold text-ink/60">
          <span>Situação</span>
          <select value={saleStatus} onChange={(event) => { setSaleStatus(event.target.value as typeof saleStatus); setPage(1) }} aria-label="Filtrar por situação" className="mt-1 h-11 w-full rounded-lg border border-ink/15 bg-paper px-3 text-sm font-normal text-ink outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/10">
            <option value="todas">Situação: Todas</option>
            <option value="pendentes">Pendentes</option>
            <option value="canceladas">Canceladas</option>
          </select>
        </label>
      </div>
      <p className="mt-4 border-t border-ink/10 pt-3 text-xs font-medium text-ink/45">{filtered.length} {filtered.length === 1 ? 'venda encontrada' : 'vendas encontradas'}</p>
    </section>

    <div className="mt-5">
      {query.isLoading ? <p className="rounded-2xl bg-white p-12 text-center text-sm text-ink/50">Carregando vendas...</p> : filtered.length ? <>
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">{paginacao.itens.map((venda) => <VendaCard key={venda.id} venda={venda} />)}</div>
        <nav aria-label="Paginação de vendas" className="mt-8 flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={!paginacao.podeVoltar} className="inline-flex items-center gap-1 rounded-lg border border-ink/15 px-3 py-2 text-sm font-semibold hover:border-teal hover:text-teal disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={16} />Anterior</button>
            {Array.from({ length: paginacao.totalPaginas }, (_, index) => index + 1).map((pagina) => <button key={pagina} type="button" onClick={() => setPage(pagina)} aria-current={pagina === paginacao.pagina ? 'page' : undefined} className={`grid h-10 min-w-10 place-items-center rounded-lg px-3 text-sm font-semibold ${pagina === paginacao.pagina ? 'bg-teal text-white' : 'border border-ink/15 hover:border-teal hover:text-teal'}`}>{pagina}</button>)}
            <button type="button" onClick={() => setPage((current) => Math.min(paginacao.totalPaginas, current + 1))} disabled={!paginacao.podeAvancar} className="inline-flex items-center gap-1 rounded-lg border border-ink/15 px-3 py-2 text-sm font-semibold hover:border-teal hover:text-teal disabled:cursor-not-allowed disabled:opacity-40">Próxima<ChevronRight size={16} /></button>
          </div>
          <p className="text-center text-sm font-medium text-ink/50">Página {paginacao.pagina} de {paginacao.totalPaginas}</p>
        </nav>
      </> : <div className="rounded-2xl bg-white p-12 text-center"><ShoppingBag className="mx-auto text-ink/25" size={32} /><p className="mt-4 text-sm text-ink/50">Nenhuma venda encontrada.</p></div>}
    </div>
  </div>
}
