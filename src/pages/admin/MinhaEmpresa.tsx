import { useEffect, useState } from 'react'
import { Building2, Copy, ImagePlus, Save, Trash2, Upload } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { atualizarMinhaEmpresa, enviarLogoEmpresa, obterMinhaEmpresa, removerLogoEmpresa, type EmpresaConfiguracaoUpdate } from '../../api/empresa'
import { messageForApiError } from '../../utils/apiError'

const inputClass = 'mt-2 w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 font-normal outline-none transition focus:border-teal focus:ring-4 focus:ring-teal/10'
const phonePattern = /^\+?[0-9\s().-]+$/
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const maxLogoSize = 5 * 1024 * 1024

function validPhone(value: string) {
  if (!value.trim()) return true
  const digits = value.replace(/\D/g, '')
  return phonePattern.test(value) && [10, 11, 12, 13].includes(digits.length)
}

function empresaErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { status?: number; data?: { message?: string } } }).response
    if (response?.data?.message) return response.data.message
    if (response?.status === 409) return 'Este slug já está em uso ou algum dos dados informados é inválido.'
    if (response?.status === 400) return 'Confira os campos e corrija os dados inválidos.'
    if (response?.status === 404) return 'Empresa não encontrada.'
  }
  return messageForApiError(error, fallback)
}

export function MinhaEmpresa() {
  const queryClient = useQueryClient()
  const company = useQuery({ queryKey: ['minha-empresa'], queryFn: obterMinhaEmpresa })
  const [form, setForm] = useState<EmpresaConfiguracaoUpdate | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [logoError, setLogoError] = useState('')
  const [copyMessage, setCopyMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!company.data) return
    setForm({
      nome: company.data.nome,
      nomeFantasia: company.data.nomeFantasia,
      email: company.data.email,
      telefone: company.data.telefone,
      whatsApp: company.data.whatsApp,
      slug: company.data.slug,
      endereco: company.data.endereco,
    })
  }, [company.data])

  const save = useMutation({
    mutationFn: atualizarMinhaEmpresa,
    onSuccess: async (updated) => {
      await queryClient.setQueryData(['minha-empresa'], updated)
      setMessage({ type: 'success', text: 'Dados da empresa atualizados com sucesso.' })
    },
    onError: (error) => setMessage({ type: 'error', text: empresaErrorMessage(error, 'Não foi possível salvar os dados da empresa.') }),
  })

  const logoUpload = useMutation({
    mutationFn: enviarLogoEmpresa,
    onSuccess: async (updated) => {
      await queryClient.setQueryData(['minha-empresa'], updated)
      setLogoError('')
      setMessage({ type: 'success', text: 'Logo atualizada com sucesso.' })
    },
    onError: (error) => setLogoError(messageForApiError(error, 'Não foi possível enviar a logo.')),
  })

  const logoRemove = useMutation({
    mutationFn: removerLogoEmpresa,
    onSuccess: async (updated) => {
      await queryClient.setQueryData(['minha-empresa'], updated)
      setMessage({ type: 'success', text: 'Logo removida com sucesso.' })
    },
    onError: (error) => setLogoError(messageForApiError(error, 'Não foi possível remover a logo.')),
  })

  function change<K extends keyof EmpresaConfiguracaoUpdate>(field: K, value: EmpresaConfiguracaoUpdate[K]) {
    setForm((current) => current ? { ...current, [field]: value } : current)
    setMessage(null)
    if (field === 'slug') setCopyMessage(null)
  }

  async function copyCatalogUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopyMessage({ type: 'success', text: 'Link copiado!' })
      window.setTimeout(() => setCopyMessage((current) => current?.type === 'success' ? null : current), 2500)
    } catch {
      setCopyMessage({ type: 'error', text: 'Não foi possível copiar o link.' })
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form || !company.data) return
    const nome = form.nome.trim()
    const email = form.email.trim()
    const slug = form.slug.trim().toLowerCase()
    if (!nome) return setMessage({ type: 'error', text: 'Informe a razão social.' })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setMessage({ type: 'error', text: 'Informe um e-mail comercial válido.' })
    if (!slugPattern.test(slug)) return setMessage({ type: 'error', text: 'Use um slug com letras minúsculas, números e hífens, sem espaços nas extremidades.' })
    if (!validPhone(form.telefone ?? '') || !validPhone(form.whatsApp ?? '')) return setMessage({ type: 'error', text: 'Informe telefone e WhatsApp com DDD válidos.' })

    if (slug !== company.data.slug && !window.confirm(`O endereço público do catálogo será alterado para /catalogo/${slug}. Deseja continuar?`)) return

    setMessage(null)
    await save.mutateAsync({
      ...form,
      nome,
      email,
      slug,
      nomeFantasia: form.nomeFantasia?.trim() || null,
      telefone: form.telefone?.trim() || null,
      whatsApp: form.whatsApp?.trim() || null,
      endereco: form.endereco?.trim() || null,
    })
  }

  function chooseLogo(file?: File) {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return setLogoError('Use uma imagem JPG, PNG ou WEBP.')
    if (file.size > maxLogoSize) return setLogoError('A logo não pode ultrapassar 5 MB.')
    setLogoError('')
    logoUpload.mutate(file)
  }

  if (company.isLoading || (company.data && !form)) return <p className="rounded-2xl bg-white p-12 text-center text-sm text-ink/50">Carregando dados da empresa...</p>
  if (company.isError || !company.data || !form) return <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{messageForApiError(company.error, 'Não foi possível carregar os dados da empresa.')}</p>

  const field = (key: keyof EmpresaConfiguracaoUpdate, label: string, type = 'text', required = false) => (
    <label className="block text-sm font-semibold">{label}{required && <span className="text-coral"> *</span>}
      <input required={required} type={type} value={form[key] ?? ''} onChange={(event) => change(key, event.target.value)} className={inputClass} />
    </label>
  )
  const catalogUrl = `${window.location.origin}/catalogo/${(form.slug ?? '').trim().toLowerCase()}`

  return <div>
    <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-teal"><Building2 size={16} />Configurações</p>
    <h1 className="mt-2 font-display text-3xl font-bold">Minha Empresa</h1>
    <p className="mt-2 text-ink/55">Gerencie as informações exibidas no painel e no catálogo público.</p>

    {message && <p role={message.type === 'error' ? 'alert' : 'status'} className={`mt-5 rounded-xl p-4 text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{message.text}</p>}

    <form onSubmit={submit} className="mt-8 space-y-6">
      <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-7">
        <h2 className="font-display text-lg font-bold">Dados da empresa</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {field('nome', 'Razão social', 'text', true)}
          {field('nomeFantasia', 'Nome fantasia')}
          <label className="block text-sm font-semibold">CNPJ<input readOnly value={company.data.cnpj ?? 'Não informado'} className={`${inputClass} cursor-not-allowed text-ink/55`} /></label>
          {field('email', 'E-mail comercial', 'email', true)}
          {field('telefone', 'Telefone')}
          {field('whatsApp', 'WhatsApp')}
          <label className="block text-sm font-semibold">Slug do catálogo<span className="text-coral"> *</span>
            <input required type="text" value={form.slug ?? ''} onChange={(event) => change('slug', event.target.value)} className={inputClass} />
            <span className="mt-2 block text-xs font-normal text-ink/45">Esse identificador define o endereço público do seu catálogo.</span>
            <span className="mt-1 block break-all text-xs font-semibold text-teal">Prévia: {catalogUrl}</span>
            <span className="mt-3 flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => void copyCatalogUrl(catalogUrl)} className="inline-flex items-center gap-2 rounded-xl border border-ink/15 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-mint">
                <Copy size={16} />Copiar link
              </button>
              {copyMessage && <span role={copyMessage.type === 'error' ? 'alert' : 'status'} className={`text-sm font-medium ${copyMessage.type === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>{copyMessage.text}</span>}
            </span>
          </label>
          <label className="block text-sm font-semibold sm:col-span-2">Endereço da empresa<textarea rows={3} maxLength={300} value={form.endereco ?? ''} onChange={(event) => change('endereco', event.target.value)} className={inputClass} /></label>
        </div>
        <button type="submit" disabled={save.isPending} className="mt-6 flex items-center gap-2 rounded-xl bg-teal px-5 py-3 font-semibold text-white hover:bg-teal/90 disabled:cursor-wait disabled:opacity-60"><Save size={17} />{save.isPending ? 'Salvando...' : 'Salvar informações'}</button>
      </section>
    </form>

    <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-7">
      <h2 className="font-display text-lg font-bold">Identidade visual</h2>
      <p className="mt-1 text-sm text-ink/50">Envie uma logo JPG, PNG ou WEBP de até 5 MB.</p>
      <div className="mt-5 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <div className="grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-2xl bg-mint text-teal">
          {company.data.logoUrl ? <img src={company.data.logoUrl} alt={`Logo de ${company.data.nomeFantasia || company.data.nome}`} className="h-full w-full object-contain" /> : <ImagePlus size={28} />}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white hover:bg-teal/90">
            <Upload size={17} />{logoUpload.isPending ? 'Enviando...' : company.data.logoUrl ? 'Substituir logo' : 'Enviar logo'}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={logoUpload.isPending} onChange={(event) => { chooseLogo(event.target.files?.[0]); event.target.value = '' }} />
          </label>
          {company.data.logoUrl && <button type="button" disabled={logoRemove.isPending} onClick={() => logoRemove.mutate()} className="flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"><Trash2 size={16} />{logoRemove.isPending ? 'Removendo...' : 'Remover logo'}</button>}
        </div>
      </div>
      {logoError && <p role="alert" className="mt-4 text-sm text-rose-700">{logoError}</p>}
    </section>
  </div>
}
