import { MapPin, AlertCircle } from 'lucide-react'
import type { EnderecoCliente } from '../../types/cliente'
import { EnderecoPrincipalBadge } from './EnderecoPrincipalBadge'

export function EnderecoCard({ endereco }: { endereco: EnderecoCliente }) {
  return (
    <div
      className={`rounded-2xl border-2 p-5 transition-colors ${
        endereco.principal
          ? 'border-amber-200 bg-amber-50'
          : 'border-ink/10 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-ink">{endereco.nomeEndereco}</h3>
            {endereco.principal && <EnderecoPrincipalBadge />}
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-teal" />
              <div>
                <p className="font-medium text-ink">
                  {endereco.logradouro}, {endereco.numero}
                </p>
                {endereco.complemento && (
                  <p className="text-xs text-ink/50">Complemento: {endereco.complemento}</p>
                )}
              </div>
            </div>

            <p className="text-ink/55">
              {endereco.bairro} • {endereco.cidade}/{endereco.estado}
            </p>

            <p className="font-semibold text-ink">CEP: {endereco.cep}</p>

            {endereco.referencia && (
              <p className="rounded-lg bg-white/50 p-2 text-xs italic text-ink/60">
                📌 Referência: {endereco.referencia}
              </p>
            )}
          </div>
        </div>

        {!endereco.ativo && (
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
            <AlertCircle size={14} />
            Inativo
          </div>
        )}
      </div>

      {endereco.dataCriacao && (
        <p className="mt-4 text-xs text-ink/40">
          Cadastrado em {new Date(endereco.dataCriacao).toLocaleDateString('pt-BR')}
        </p>
      )}
    </div>
  )
}
