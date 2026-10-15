import { useState } from 'react'
import { Check, Clipboard, Copy, Plus, ShieldCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { criarEmpresa, type CriarEmpresaResponse } from '../../api/superAdmin'
import { messageForApiError } from '../../utils/apiError'

const schema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome da empresa.'),
  nomeFantasia: z.string(),
  cnpj: z.string(),
  email: z.string().trim().email('Informe um e-mail válido.'),
  telefone: z.string(),
  whatsApp: z.string(),
  logoUrl: z.string(),
  descricao: z.string(),
  slug: z.string().trim().min(1, 'Informe o slug.').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use letras minúsculas, números e hífens.'),
  administradorNome: z.string().trim().min(1, 'Informe o nome do administrador.'),
  administradorEmail: z.string().trim().email('Informe um e-mail válido para o administrador.'),
})

type FormData = z.infer<typeof schema>
const inputClass = 'mt-2 w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 font-normal outline-none transition focus:border-teal focus:ring-4 focus:ring-teal/10'

function backendValidationMessages(error: unknown): string[] {
  if (!error || typeof error !== 'object' || !('response' in error)) return []
  const data = (error as { response?: { data?: unknown } }).response?.data
  if (!data || typeof data !== 'object' || !('errors' in data)) return []
  const errors = (data as { errors?: unknown }).errors
  if (!errors || typeof errors !== 'object') return []
  return Object.values(errors as Record<string, unknown>).flatMap((messages) =>
    Array.isArray(messages) ? messages.filter((message): message is string => typeof message === 'string') : [],
  )
}

export function CadastroEmpresa() {
  const [created, setCreated] = useState<CriarEmpresaResponse | null>(null)
  const [apiError, setApiError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: '', nomeFantasia: '', cnpj: '', email: '', telefone: '', whatsApp: '', logoUrl: '', descricao: '', slug: '',
      administradorNome: '', administradorEmail: '',
    },
  })

  async function submit(form: FormData) {
    setApiError('')
    setFieldErrors([])
    setCopied(false)
    setCreated(null)
    try {
      const result = await criarEmpresa({
        empresa: {
          nome: form.nome,
          nomeFantasia: form.nomeFantasia.trim() || null,
          cnpj: form.cnpj.trim() || null,
          email: form.email,
          telefone: form.telefone.trim() || null,
          whatsApp: form.whatsApp.trim() || null,
          logoUrl: form.logoUrl.trim() || null,
          descricao: form.descricao.trim() || null,
          slug: form.slug,
        },
        administrador: { nome: form.administradorNome, email: form.administradorEmail },
      })
      setCreated(result)
      reset()
    } catch (error) {
      setApiError(messageForApiError(error, 'Não foi possível cadastrar a empresa. Revise os dados e tente novamente.'))
      setFieldErrors(backendValidationMessages(error))
    }
  }

  async function copyTemporaryPassword() {
    if (!created) return
    try {
      await navigator.clipboard.writeText(created.senhaTemporaria)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const field = (name: keyof FormData, label: string, type = 'text', required = false) => (
    <label className="block text-sm font-semibold">{label}{required && <span className="text-coral"> *</span>}
      <input {...register(name)} type={type} className={inputClass} />
      {errors[name]?.message && <span className="mt-1 block text-xs font-normal text-rose-600">{errors[name]?.message}</span>}
    </label>
  )

  return <div>
    <p className="text-sm font-semibold uppercase tracking-widest text-teal">Administração da plataforma</p>
    <h1 className="mt-2 font-display text-3xl font-bold">Cadastrar empresa</h1>
    <p className="mt-2 text-ink/55">Crie uma empresa e configure o primeiro acesso do administrador.</p>

    {created ? (
      <section className="mt-8 rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm sm:p-8" aria-live="polite">
        <div className="flex items-start gap-3"><div className="rounded-xl bg-emerald-50 p-3 text-emerald-700"><Check size={22} /></div><div><h2 className="font-display text-xl font-bold">Empresa cadastrada</h2><p className="mt-1 text-sm text-ink/55">{created.aviso}</p></div></div>
        <dl className="mt-6 grid gap-4 rounded-xl bg-paper p-4 text-sm sm:grid-cols-2">
          <div><dt className="text-xs text-ink/50">Empresa</dt><dd className="mt-1 font-semibold">{created.empresa.nome}</dd></div>
          <div><dt className="text-xs text-ink/50">Slug do catálogo</dt><dd className="mt-1 font-semibold">{created.empresa.slug}</dd></div>
          <div><dt className="text-xs text-ink/50">Administrador</dt><dd className="mt-1 font-semibold">{created.administrador.nome}</dd></div>
          <div><dt className="text-xs text-ink/50">E-mail de acesso</dt><dd className="mt-1 font-semibold">{created.administrador.email}</dd></div>
        </dl>
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-900"><ShieldCheck size={18} />Senha temporária — exibida somente nesta confirmação</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <code className="min-w-0 flex-1 break-all rounded-lg bg-white px-3 py-3 text-sm text-ink">{created.senhaTemporaria}</code>
            <button type="button" onClick={copyTemporaryPassword} className="flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white hover:bg-ink/90"><Copy size={16} />{copied ? 'Copiada' : 'Copiar senha'}</button>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-amber-900">Entregue a senha ao administrador por um canal seguro. No primeiro acesso, ele deverá criar uma nova senha.</p>
        </div>
        <button type="button" onClick={() => setCreated(null)} className="mt-5 text-sm font-semibold text-ink/60 underline underline-offset-4 hover:text-ink">Descartar esta confirmação e ocultar a senha</button>
      </section>
    ) : (
      <form onSubmit={handleSubmit(submit)} className="mt-8 space-y-6">
        {apiError && <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700" role="alert"><p>{apiError}</p>{fieldErrors.length > 0 && <ul className="mt-2 list-inside list-disc">{fieldErrors.map((message, index) => <li key={`${index}-${message}`}>{message}</li>)}</ul>}</div>}
        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-display text-lg font-bold">Dados da empresa</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {field('nome', 'Nome', 'text', true)}
            {field('nomeFantasia', 'Nome fantasia')}
            {field('cnpj', 'CNPJ')}
            {field('email', 'E-mail da empresa', 'email', true)}
            {field('telefone', 'Telefone')}
            {field('whatsApp', 'WhatsApp')}
            {field('logoUrl', 'URL do logotipo', 'url')}
            {field('slug', 'Slug do catálogo', 'text', true)}
            <label className="block text-sm font-semibold sm:col-span-2">Descrição<textarea {...register('descricao')} rows={3} className={inputClass} /></label>
          </div>
        </section>
        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-display text-lg font-bold">Primeiro administrador</h2>
          <p className="mt-1 text-sm text-ink/50">A API gera uma senha temporária para o primeiro acesso.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">{field('administradorNome', 'Nome', 'text', true)}{field('administradorEmail', 'E-mail de acesso', 'email', true)}</div>
        </section>
        <button disabled={isSubmitting} className="flex items-center justify-center gap-2 rounded-xl bg-teal px-5 py-3.5 font-semibold text-white transition hover:bg-teal/90 disabled:cursor-wait disabled:opacity-60"><Plus size={18} />{isSubmitting ? 'Cadastrando...' : 'Cadastrar empresa'}</button>
      </form>
    )}
  </div>
}
