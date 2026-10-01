import { useEffect } from 'react'
import { Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Grupo } from '../../types/grupo'

const schema = z.object({ nome: z.string().trim().min(1, 'Informe o nome do grupo'), descricao: z.string().optional(), ordem: z.coerce.number().int('A ordem deve ser um número inteiro').min(0, 'A ordem não pode ser negativa'), ativo: z.boolean() })
export type GrupoFormData = z.infer<typeof schema>
interface Props { grupo?: Grupo; onSubmit: (data: GrupoFormData) => Promise<void>; isSaving: boolean }
function FieldError({ message }: { message?: string }) { return message ? <span className="mt-1 block text-xs text-rose-600">{message}</span> : null }
export function GrupoForm({ grupo, onSubmit, isSaving }: Props) {
  const { register, reset, handleSubmit, formState: { errors } } = useForm<GrupoFormData>({ resolver: zodResolver(schema), defaultValues: { nome: grupo?.nome ?? '', descricao: grupo?.descricao ?? '', ordem: grupo?.ordem ?? 0, ativo: grupo?.ativo ?? true } })
  useEffect(() => { if (grupo) reset({ nome: grupo.nome, descricao: grupo.descricao ?? '', ordem: grupo.ordem, ativo: grupo.ativo }) }, [grupo, reset])
  const input = 'mt-2 w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 outline-none transition focus:border-teal focus:ring-4 focus:ring-teal/10'
  return <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl bg-white p-5 shadow-sm sm:p-6"><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold">Nome *<input {...register('nome')} className={input} placeholder="Ex.: Secos" /><FieldError message={errors.nome?.message} /></label><label className="text-sm font-semibold">Ordem<input {...register('ordem')} type="number" min="0" step="1" className={input} /><FieldError message={errors.ordem?.message} /></label><label className="text-sm font-semibold sm:col-span-2">Descrição<textarea {...register('descricao')} rows={5} className={input} placeholder="Descreva este grupo." /></label><label className="flex cursor-pointer items-center gap-2 text-sm font-semibold"><input {...register('ativo')} type="checkbox" className="h-4 w-4 accent-teal" />Grupo ativo</label></div><div className="mt-6 flex justify-end border-t border-ink/10 pt-5"><button disabled={isSaving} className="flex items-center gap-2 rounded-xl bg-teal px-5 py-3 font-semibold text-white hover:bg-teal/90 disabled:cursor-wait disabled:opacity-60"><Save size={18} />{isSaving ? 'Salvando...' : 'Salvar grupo'}</button></div></form>
}
