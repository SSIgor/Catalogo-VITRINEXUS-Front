import { useMemo, useState } from 'react'
import { RefreshCw, Search, SlidersHorizontal, Users } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { listarClientes } from '../../api/clientes'
import { ClienteTable } from '../../components/cliente/ClienteTable'
import { messageForApiError } from '../../utils/apiError'

export function Clientes() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('todos')
  const query = useQuery({ queryKey: ['clientes'], queryFn: listarClientes })

  const clientes = query.data ?? []
  const ativos = clientes.filter((cliente) => cliente.ativo).length
  const inativos = clientes.length - ativos
  const comEndereco = clientes.filter((cliente) => (cliente.enderecos?.length ?? 0) > 0).length

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()

    return clientes.filter((cliente) => {
      const matchesSearch = !term || [
        cliente.nome,
        cliente.email,
        cliente.telefone,
        cliente.whatsApp,
      ].some((value) => value?.toLowerCase().includes(term))
      const matchesStatus = status === 'todos' || (status === 'ativos' ? cliente.ativo : !cliente.ativo)

      return matchesSearch && matchesStatus
    })
  }, [clientes, search, status])

  return <div>
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-teal">Relacionamento</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Clientes</h1>
        <p className="mt-2 text-ink/55">Clientes que realizaram cadastro pelo catálogo.</p>
      </div>
      <button onClick={() => query.refetch()} disabled={query.isFetching} className="flex w-fit items-center gap-2 rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm font-semibold hover:border-teal disabled:opacity-50">
        <RefreshCw size={17} className={query.isFetching ? 'animate-spin' : ''} />
        Atualizar
      </button>
    </div>

    {query.error && <p className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{messageForApiError(query.error, 'Nao foi possivel carregar os clientes.')}</p>}

    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[
        ['Clientes', clientes.length],
        ['Ativos', ativos],
        ['Inativos', inativos],
        ['Com endereco', comEndereco],
      ].map(([label, value]) => <div key={label} className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink/45">{label}</p>
        <p className="mt-2 font-display text-3xl font-bold">{query.isLoading ? '...' : value}</p>
      </div>)}
    </section>

    <section className="mt-8 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 text-ink/35" size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome, telefone ou email..." className="w-full rounded-xl border border-ink/15 bg-paper py-3 pl-10 pr-4 outline-none focus:border-teal" />
        </div>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-ink/15 bg-paper px-3 py-3 text-sm outline-none focus:border-teal">
          <option value="todos">Todos os status</option>
          <option value="ativos">Ativos</option>
          <option value="inativos">Inativos</option>
        </select>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-ink/45">
        <SlidersHorizontal size={15} />
        {filtered.length} cliente(s) encontrado(s)
      </div>
    </section>

    <div className="mt-5">
      {query.isLoading ? <p className="rounded-2xl bg-white p-12 text-center text-sm text-ink/50">Carregando clientes...</p> : filtered.length ? <ClienteTable clientes={filtered} /> : <div className="rounded-2xl bg-white p-12 text-center"><Users className="mx-auto text-ink/25" size={32} /><p className="mt-4 text-sm text-ink/50">Nenhum cliente encontrado.</p></div>}
    </div>
  </div>
}
