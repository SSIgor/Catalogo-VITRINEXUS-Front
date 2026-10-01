import { ArrowRight, CalendarDays, CreditCard, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ClienteVenda, Venda } from '../../types/venda'
import { formatDate, money, vendaLabel } from '../../utils/format'
import { StatusPagamentoBadge } from './StatusPagamentoBadge'
import { VendaStatusBadge } from './VendaStatusBadge'

function getClienteNome(cliente: Venda['cliente']) {
  if (!cliente) return 'Cliente nao informado'
  if (typeof cliente === 'string') return cliente || 'Cliente nao informado'
  return cliente.nome ?? 'Cliente nao informado'
}

export function VendaCard({ venda }: { venda: Venda }) {
  const itens = venda.itens ?? []
  const total = venda.valorTotal ?? venda.total ?? 0
  const count = itens.reduce((sum, item) => sum + (item.quantidade ?? 0), 0)
  const cliente = venda.cliente as string | ClienteVenda | null | undefined

  return <article className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="font-display text-lg font-bold text-teal">{vendaLabel(venda.numero, venda.id)}</p>
        <p className="mt-2 flex items-center gap-2 text-sm font-semibold">
          <UserRound size={16} className="text-ink/35" />
          {getClienteNome(cliente)}
        </p>
      </div>
      <span className="flex items-center gap-1.5 text-xs text-ink/45">
        <CalendarDays size={14} />
        {formatDate(venda.dataCriacao ?? venda.criadaEm)}
      </span>
    </div>

    <div className="mt-5 flex items-end justify-between border-t border-ink/10 pt-5">
      <div>
        <p className="text-xs text-ink/45">{count} {count === 1 ? 'item' : 'itens'}</p>
        <p className="mt-1 font-display text-2xl font-bold">{money.format(total)}</p>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-ink/50">
        <CreditCard size={14} />
        {venda.formaPagamento ?? 'Forma nao informada'}
      </div>
    </div>

    <div className="mt-5 flex flex-wrap gap-2">
      <VendaStatusBadge status={venda.status} />
      <StatusPagamentoBadge status={venda.statusPagamento} />
    </div>

    <Link to={`/admin/vendas/${venda.id}`} className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-mint py-3 text-sm font-semibold text-teal hover:bg-teal hover:text-white">
      Ver pedido <ArrowRight size={16} />
    </Link>
  </article>
}
