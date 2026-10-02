import { useEffect } from 'react'
import { Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Cupom } from '../../types/cupom'
import { normalizarCodigoCupom } from '../../utils/cupomStatus'

const schema = z.object({
  codigo: z.string().trim().min(1, 'Informe o código do cupom').max(50, 'O código deve ter no máximo 50 caracteres'),
  descontoPercentual: z.coerce.number({ invalid_type_error: 'Informe o percentual de desconto' }).gt(0, 'O desconto deve ser maior que 0').max(100, 'O desconto deve ser no máximo 100%'),
  dataValidade: z.string().min(1, 'Informe a data de validade'),
  inativo: z.boolean(),
})

export type CupomFormData = z.infer<typeof schema>

interface Props {
  cupom?: Cupom
  onSubmit: (data: CupomFormData) => Promise<void>
  isSaving: boolean
}

function FieldError({ message }: { message?: string }) {
  return message ? <span className="mt-1 block text-xs text-rose-600">{message}</span> : null
}

function toLocalDateTimeInput(value?: string) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value.slice(0, 16)

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

function toApiDateTime(value: string) {
  if (!value) return ''
  return value.length === 16 ? `${value}:00` : value
}

export function CupomForm({ cupom, onSubmit, isSaving }: Props) {
  const { register, reset, handleSubmit, formState: { errors } } = useForm<CupomFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      codigo: cupom?.codigo ?? '',
      descontoPercentual: cupom?.descontoPercentual ?? 10,
      dataValidade: toLocalDateTimeInput(cupom?.dataValidade),
      inativo: cupom?.inativo ?? false,
    },
  })

  useEffect(() => {
    if (cupom) {
      reset({
        codigo: cupom.codigo,
        descontoPercentual: cupom.descontoPercentual,
        dataValidade: toLocalDateTimeInput(cupom.dataValidade),
        inativo: cupom.inativo,
      })
    }
  }, [cupom, reset])

  const input = 'mt-2 w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 outline-none transition focus:border-teal focus:ring-4 focus:ring-teal/10'

  return <form onSubmit={handleSubmit(async (data) => {
    await onSubmit({
      ...data,
      codigo: normalizarCodigoCupom(data.codigo),
      dataValidade: toApiDateTime(data.dataValidade),
      inativo: !!data.inativo,
    })
  })} className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="text-sm font-semibold sm:col-span-2">
        Código *
        <input {...register('codigo')} className={input} placeholder="Ex.: IMURA10" maxLength={50} />
        <FieldError message={errors.codigo?.message} />
      </label>

      <label className="text-sm font-semibold">
        Desconto (%) *
        <input {...register('descontoPercentual')} type="number" min="1" max="100" step="1" className={input} placeholder="10" />
        <FieldError message={errors.descontoPercentual?.message} />
      </label>

      <label className="text-sm font-semibold">
        Data de validade *
        <input {...register('dataValidade')} type="datetime-local" className={input} />
        <FieldError message={errors.dataValidade?.message} />
      </label>

      <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold sm:col-span-2">
        <input {...register('inativo')} type="checkbox" className="h-4 w-4 accent-teal" />
        Cupom inativo
      </label>
    </div>

    <div className="mt-6 flex justify-end border-t border-ink/10 pt-5">
      <button disabled={isSaving} className="flex items-center gap-2 rounded-xl bg-teal px-5 py-3 font-semibold text-white hover:bg-teal/90 disabled:cursor-wait disabled:opacity-60">
        <Save size={18} />
        {isSaving ? 'Salvando...' : 'Salvar cupom'}
      </button>
    </div>
  </form>
}
