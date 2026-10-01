import { MapPin } from 'lucide-react'
import type { EnderecoCliente } from '../../types/cliente'
import { EnderecoCard } from './EnderecoCard'
import { EnderecoPrincipalBadge } from './EnderecoPrincipalBadge'

export function EnderecoList({ enderecos }: { enderecos: EnderecoCliente[] }) {
  if (!enderecos || enderecos.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-ink/20 bg-paper p-8 text-center">
        <MapPin className="mx-auto text-ink/25" size={32} />
        <p className="mt-3 text-sm text-ink/50">
          Este cliente ainda não possui endereços cadastrados.
        </p>
      </div>
    )
  }

  const enderecoPrincipal = enderecos.find((e) => e.principal)

  return (
    <>
      {/* Resumo do Endereço Padrão */}
      {enderecoPrincipal && (
        <div className="mb-6 rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-700">
            Endereço Padrão
          </p>
          <div className="mt-3 space-y-1">
            <h3 className="font-semibold text-ink">{enderecoPrincipal.nomeEndereco}</h3>
            <p className="flex items-center gap-2 text-sm text-ink/55">
              <MapPin size={14} className="text-teal" />
              {enderecoPrincipal.logradouro}, {enderecoPrincipal.numero}
            </p>
            <p className="text-sm text-ink/55">
              {enderecoPrincipal.bairro} • {enderecoPrincipal.cidade}/{enderecoPrincipal.estado}
            </p>
          </div>
        </div>
      )}

      {/* Lista de Todos os Endereços */}
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-ink/45">
          Todos os endereços ({enderecos.length})
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {enderecos.map((endereco) => (
            <EnderecoCard key={endereco.id} endereco={endereco} />
          ))}
        </div>
      </div>
    </>
  )
}
