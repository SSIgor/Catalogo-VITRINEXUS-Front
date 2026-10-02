import { Edit3, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Cupom } from '../../types/cupom'
import { getCupomStatus } from '../../utils/cupomStatus'
import { CupomStatusBadge } from './CupomStatusBadge'

interface Props {
  cupons: Cupom[]
  onDelete: (cupom: Cupom) => void
  busyId?: string
}

function formatarData(value?: string) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

export function CupomTable({ cupons, onDelete, busyId }: Props) {
  return <div className="overflow-hidden rounded-2xl bg-white shadow-sm"><div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead className="border-b border-ink/10 bg-paper text-xs uppercase tracking-wider text-ink/45"><tr>{['Código', 'Desconto', 'Validade', 'Status', 'Ações'].map((label) => <th key={label} className="px-5 py-4 font-semibold">{label}</th>)}</tr></thead><tbody className="divide-y divide-ink/10">{cupons.map((cupom) => {
    const status = getCupomStatus(cupom)
    return <tr key={cupom.id} className="hover:bg-paper/70"><td className="px-5 py-4 font-semibold">{cupom.codigo}</td><td className="px-5 py-4 text-ink/70">{cupom.descontoPercentual}%</td><td className="px-5 py-4 text-ink/55">{formatarData(cupom.dataValidade)}</td><td className="px-5 py-4"><CupomStatusBadge status={status} /></td><td className="px-5 py-4"><div className="flex items-center gap-1"><Link aria-label={`Editar ${cupom.codigo}`} to={`/admin/cupons/${cupom.id}`} className="rounded-lg p-2 text-ink/50 hover:bg-mint hover:text-teal"><Edit3 size={17} /></Link><button aria-label={`Excluir ${cupom.codigo}`} disabled={busyId === cupom.id} onClick={() => onDelete(cupom)} className="rounded-lg p-2 text-ink/50 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"><Trash2 size={17} /></button></div></td></tr>
  })}</tbody></table></div><div className="divide-y divide-ink/10 md:hidden">{cupons.map((cupom) => {
    const status = getCupomStatus(cupom)
    return <article key={cupom.id} className="p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate font-semibold">{cupom.codigo}</h2><p className="mt-1 text-sm text-ink/50">{cupom.descontoPercentual}% · {formatarData(cupom.dataValidade)}</p></div><CupomStatusBadge status={status} /></div><div className="mt-4 flex items-center justify-end gap-2"><Link to={`/admin/cupons/${cupom.id}`} className="rounded-lg p-2 text-ink/50 hover:bg-mint hover:text-teal"><Edit3 size={17} /></Link><button disabled={busyId === cupom.id} onClick={() => onDelete(cupom)} className="rounded-lg p-2 text-ink/50 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"><Trash2 size={17} /></button></div></article>
  })}</div></div>
}
