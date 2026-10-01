import { useState } from 'react'
import { Ban, CheckCircle2 } from 'lucide-react'
import type { Venda } from '../../types/venda'
import { normalizeStatusVenda } from './VendaStatusBadge'

interface Props { venda: Venda; isBusy: boolean; onConcluir: () => Promise<void>; onCancelar: () => Promise<void> }
export function VendaAcoes({ venda, isBusy, onConcluir, onCancelar }: Props) {
  const [error, setError] = useState(''); const status = normalizeStatusVenda(venda.status); const canConclude = status === 'Pendente' || status === 'Confirmada'; const canCancel = status !== 'Cancelada' && status !== 'Concluida' && status !== 'Concluída'
  async function run(action: () => Promise<void>, question: string) { if (!window.confirm(question)) return; setError(''); try { await action() } catch (reason) { setError('Não foi possível atualizar a venda. Tente novamente.'); throw reason } }
  if (!canConclude && !canCancel) return null
  return <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6"><h2 className="font-display text-lg font-bold">Ações</h2>{error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}<div className="mt-5 flex flex-col gap-3 sm:flex-row">{canConclude && <button disabled={isBusy} onClick={() => run(onConcluir, 'Confirmar conclusão desta venda?')} className="flex items-center justify-center gap-2 rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white hover:bg-teal/90 disabled:opacity-50"><CheckCircle2 size={17} />{isBusy ? 'Atualizando...' : 'Concluir venda'}</button>}{canCancel && <button disabled={isBusy} onClick={() => run(onCancelar, 'Tem certeza que deseja cancelar esta venda? O cancelamento poderá devolver os produtos ao estoque quando aplicável.')} className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"><Ban size={17} />Cancelar venda</button>}</div></section>
}
