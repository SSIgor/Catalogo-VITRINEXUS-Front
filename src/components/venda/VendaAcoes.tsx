import { Ban, CheckCircle2, CreditCard, PackageCheck } from 'lucide-react'
import type { Venda } from '../../types/venda'
import { getAcoesVendaDisponiveis } from '../../utils/vendaActions'

interface Props {
  venda: Venda
  isBusy: boolean
  onConfirmar: () => Promise<void>
  onConfirmarPagamento: () => Promise<void>
  onConcluir: () => Promise<void>
  onCancelar: () => Promise<void>
}

export function VendaAcoes({ venda, isBusy, onConfirmar, onConfirmarPagamento, onConcluir, onCancelar }: Props) {
  const acoes = getAcoesVendaDisponiveis(venda)

  async function run(action: () => Promise<void>, question: string) {
    if (!window.confirm(question)) return
    await action()
  }

  if (!acoes.confirmar && !acoes.confirmarPagamento && !acoes.concluir && !acoes.cancelar) return null

  return <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
    <h2 className="font-display text-lg font-bold">Ações</h2>
    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {acoes.confirmar && <button disabled={isBusy} onClick={() => run(onConfirmar, 'Confirmar esta venda? O estoque será validado e baixado uma vez.')} className="flex items-center justify-center gap-2 rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white hover:bg-teal/90 disabled:opacity-50"><PackageCheck size={17} />{isBusy ? 'Atualizando...' : 'Confirmar venda'}</button>}
      {acoes.confirmarPagamento && <button disabled={isBusy} onClick={() => run(onConfirmarPagamento, 'Registrar o pagamento desta venda como pago?')} className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"><CreditCard size={17} />{isBusy ? 'Atualizando...' : 'Confirmar pagamento'}</button>}
      {acoes.concluir && <button disabled={isBusy} onClick={() => run(onConcluir, 'Confirmar conclusão desta venda?')} className="flex items-center justify-center gap-2 rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white hover:bg-teal/90 disabled:opacity-50"><CheckCircle2 size={17} />{isBusy ? 'Atualizando...' : 'Concluir venda'}</button>}
      {acoes.cancelar && <button disabled={isBusy} onClick={() => run(onCancelar, 'Tem certeza que deseja cancelar esta venda? O cancelamento poderá devolver os produtos ao estoque quando aplicável.')} className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"><Ban size={17} />Cancelar venda</button>}
    </div>
  </section>
}
