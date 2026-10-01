import { CalendarDays, Mail, MapPin, Phone, UserRound, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Cliente } from '../../types/cliente'
import { formatDate } from '../../utils/format'
import { ClienteStatusBadge } from './ClienteStatusBadge'

function contato(cliente: Cliente) {
  return cliente.whatsApp || cliente.telefone || '-'
}

function enderecoPrincipal(cliente: Cliente) {
  const endereco = cliente.enderecos?.find((item) => item.principal) ?? cliente.enderecos?.[0]
  if (!endereco) return '-'
  return `${endereco.cidade} - ${endereco.estado}`
}

export function ClienteTable({ clientes }: { clientes: Cliente[] }) {
  const navigate = useNavigate()

  return <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-ink/10 bg-paper text-xs uppercase tracking-wider text-ink/45">
          <tr>
            {['Cliente', 'Contato', 'Email', 'Endereco', 'Cadastro', 'Status', 'Ação'].map((label) => <th key={label} className="px-5 py-4 font-semibold">{label}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {clientes.map((cliente) => <tr key={cliente.id} className="hover:bg-paper/70">
            <td className="px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-mint font-display font-bold text-teal">
                  {cliente.nome.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold">{cliente.nome}</span>
              </div>
            </td>
            <td className="px-5 py-4 text-ink/55">{contato(cliente)}</td>
            <td className="px-5 py-4 text-ink/55">{cliente.email || '-'}</td>
            <td className="px-5 py-4 text-ink/55">{enderecoPrincipal(cliente)}</td>
            <td className="px-5 py-4 text-ink/55">{formatDate(cliente.dataCriacao)}</td>
            <td className="px-5 py-4"><ClienteStatusBadge ativo={cliente.ativo} /></td>
            <td className="px-5 py-4">
              <button
                onClick={() => navigate(`/admin/clientes/${cliente.id}`)}
                className="inline-flex items-center gap-2 rounded-lg bg-teal/10 px-3 py-2 text-xs font-semibold text-teal hover:bg-teal/20"
              >
                <Eye size={14} />
                Ver
              </button>
            </td>
          </tr>)}
        </tbody>
      </table>
    </div>

    <div className="divide-y divide-ink/10 md:hidden">
      {clientes.map((cliente) => <article key={cliente.id} className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-mint font-display font-bold text-teal">
              {cliente.nome.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="truncate font-semibold">{cliente.nome}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-ink/50"><CalendarDays size={13} />{formatDate(cliente.dataCriacao)}</p>
            </div>
          </div>
          <ClienteStatusBadge ativo={cliente.ativo} />
        </div>
        <div className="mt-4 space-y-2 text-sm text-ink/55">
          <p className="flex items-center gap-2"><Phone size={15} className="text-teal" />{contato(cliente)}</p>
          <p className="flex items-center gap-2"><Mail size={15} className="text-teal" />{cliente.email || '-'}</p>
          <p className="flex items-center gap-2"><MapPin size={15} className="text-teal" />{enderecoPrincipal(cliente)}</p>
        </div>
        <div className="mt-4">
          <button
            onClick={() => navigate(`/admin/clientes/${cliente.id}`)}
            className="w-full rounded-lg bg-teal/10 px-3 py-2 text-xs font-semibold text-teal hover:bg-teal/20"
          >
            Ver detalhes
          </button>
        </div>
      </article>)}
    </div>

    {clientes.length === 0 && <p className="p-12 text-center text-sm text-ink/50">Nenhum cliente encontrado.</p>}
  </div>
}

