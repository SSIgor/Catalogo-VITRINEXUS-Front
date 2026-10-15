import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { LockKeyhole, ShieldCheck } from 'lucide-react'
import { z } from 'zod'
import { useAuth } from '../contexts/AuthContext'
import { messageForApiError } from '../utils/apiError'

const schema = z.object({
  senhaAtual: z.string().min(1, 'Informe sua senha temporária atual.'),
  novaSenha: z.string()
    .min(12, 'A nova senha deve ter pelo menos 12 caracteres.')
    .regex(/[A-Z]/, 'Inclua pelo menos uma letra maiúscula.')
    .regex(/[a-z]/, 'Inclua pelo menos uma letra minúscula.')
    .regex(/[0-9]/, 'Inclua pelo menos um número.')
    .regex(/[^A-Za-z0-9]/, 'Inclua pelo menos um símbolo.'),
  confirmarSenha: z.string(),
}).refine((data) => data.novaSenha === data.confirmarSenha, {
  path: ['confirmarSenha'],
  message: 'As senhas não coincidem.',
})

type FormData = z.infer<typeof schema>

export function TrocarSenha() {
  const { changePassword, usuario } = useAuth()
  const navigate = useNavigate()
  const [apiError, setApiError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function submit(data: FormData) {
    setApiError('')
    try {
      await changePassword({ senhaAtual: data.senhaAtual, novaSenha: data.novaSenha })
      navigate('/admin/dashboard', { replace: true })
    } catch (error) {
      setApiError(messageForApiError(error, 'Não foi possível trocar a senha. Confira a senha atual e tente novamente.'))
    }
  }

  const input = 'mt-2 w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 outline-none focus:border-teal focus:ring-4 focus:ring-teal/10'

  return <main className="grid min-h-screen place-items-center bg-paper p-5">
    <section className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl sm:p-9">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-mint text-teal"><ShieldCheck size={24} /></div>
      <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-teal">Primeiro acesso</p>
      <h1 className="mt-2 font-display text-3xl font-bold">Troque sua senha</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink/55">A senha temporária deve ser substituída antes de acessar o painel{usuario?.email ? ` (${usuario.email})` : ''}.</p>
      <form onSubmit={handleSubmit(submit)} className="mt-7 space-y-5">
        <label className="block text-sm font-semibold">Senha atual<div className="relative"><LockKeyhole size={17} className="absolute left-3 top-3.5 text-ink/40" /><input {...register('senhaAtual')} type="password" autoComplete="current-password" className={`${input} pl-10`} /></div>{errors.senhaAtual && <span className="mt-1 block text-xs font-normal text-rose-600">{errors.senhaAtual.message}</span>}</label>
        <label className="block text-sm font-semibold">Nova senha<input {...register('novaSenha')} type="password" autoComplete="new-password" className={input} />{errors.novaSenha && <span className="mt-1 block text-xs font-normal text-rose-600">{errors.novaSenha.message}</span>}</label>
        <label className="block text-sm font-semibold">Confirme a nova senha<input {...register('confirmarSenha')} type="password" autoComplete="new-password" className={input} />{errors.confirmarSenha && <span className="mt-1 block text-xs font-normal text-rose-600">{errors.confirmarSenha.message}</span>}</label>
        {apiError && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700" role="alert">{apiError}</p>}
        <p className="text-xs text-ink/50">Use pelo menos 12 caracteres, com maiúscula, minúscula, número e símbolo.</p>
        <button disabled={isSubmitting} className="w-full rounded-xl bg-teal py-3.5 font-semibold text-white hover:bg-teal/90 disabled:cursor-wait disabled:opacity-60">{isSubmitting ? 'Salvando...' : 'Salvar nova senha'}</button>
      </form>
    </section>
  </main>
}
