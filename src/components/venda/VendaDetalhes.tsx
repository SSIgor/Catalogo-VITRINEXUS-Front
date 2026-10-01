import { MapPin, Phone, UserRound } from 'lucide-react'
import type { ClienteVenda, Venda } from '../../types/venda'
import { formatDate, vendaLabel } from '../../utils/format'
import { StatusPagamentoBadge } from './StatusPagamentoBadge'
import { VendaStatusBadge } from './VendaStatusBadge'

function getCliente(cliente: Venda['cliente']): ClienteVenda {
  if (!cliente) return {}
  if (typeof cliente === 'string') return { nome: cliente }
  return cliente
}

export function VendaDetalhes({ venda }: { venda: Venda }) {
  const client = getCliente(venda.cliente)
  const address = [
    venda.logradouroEntrega && `${venda.logradouroEntrega}${venda.numeroEntrega ? `, ${venda.numeroEntrega}` : ''}`,
    venda.bairroEntrega,
    venda.cidadeEntrega && venda.estadoEntrega ? `${venda.cidadeEntrega} - ${venda.estadoEntrega}` : venda.cidadeEntrega,
    venda.cepEntrega && `CEP: ${venda.cepEntrega}`,
  ].filter(Boolean)

  return <div>
    <div className="rounded-2xl bg-ink p-6 text-white shadow-sm sm:p-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row">
        <div>
          <p className="text-sm text-white/55">Pedido</p>
          <h1 className="mt-1 font-display text-3xl font-bold">Venda {vendaLabel(venda.numero, venda.id)}</h1>
          <p className="mt-2 text-sm text-white/55">{formatDate(venda.dataCriacao ?? venda.criadaEm)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <VendaStatusBadge status={venda.status} />
          <StatusPagamentoBadge status={venda.statusPagamento} />
        </div>
      </div>
    </div>

    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-display text-lg font-bold">Cliente</h2>
        <div className="mt-5 space-y-3 text-sm">
          <p className="flex items-center gap-3">
            <UserRound size={17} className="text-teal" />
            {client.nome ?? 'Cliente nao informado'}
          </p>
          {(client.telefone || client.whatsApp) && <p className="flex items-center gap-3">
            <Phone size={17} className="text-teal" />
            {client.whatsApp ?? client.telefone}
          </p>}
          <p className="flex items-center gap-3">
            <MapPin size={17} className="text-teal" />
            {address.length ? address[0] : 'Endereco nao informado'}
          </p>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-display text-lg font-bold">Pagamento</h2>
        <div className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-ink/55">Forma de pagamento</span>
            <strong>{venda.formaPagamento ?? 'Nao informado'}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-ink/55">Status</span>
            <StatusPagamentoBadge status={venda.statusPagamento} />
          </div>
        </div>
      </section>
    </div>

    <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <h2 className="font-display text-lg font-bold">Endereco de entrega</h2>
      <div className="mt-5 text-sm leading-7 text-ink/65">
        {address.length ? address.map((line) => <p key={line}>{line}</p>) : <p>Endereco nao informado.</p>}
        {venda.complementoEntrega && <p><strong>Complemento:</strong> {venda.complementoEntrega}</p>}
        {venda.referenciaEntrega && <p><strong>Referencia:</strong> {venda.referenciaEntrega}</p>}
      </div>
    </section>

    {venda.observacao && <section className="mt-5 rounded-2xl bg-mint p-5 text-sm text-ink/70">
      <strong>Observacao:</strong> {venda.observacao}
    </section>}
  </div>
}
