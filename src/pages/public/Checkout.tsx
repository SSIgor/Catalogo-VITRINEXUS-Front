import { ArrowLeft, CheckCircle2, CreditCard, MapPin, ShieldCheck, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { obterEmpresaCatalogo } from '../../api/catalogo'
import { criarVenda } from '../../api/vendas'
import { useCart } from '../../contexts/CartContext'
import { buildVendaPayload, buildWhatsAppUrl, formatCurrency, getPedidoErrorMessage, type FormaPagamentoCheckout } from '../../utils/checkout'

const steps = ['Dados do cliente', 'Endereço', 'Pagamento', 'Resumo']
const opcoesPagamento: Array<{ value: FormaPagamentoCheckout; label: string }> = [
  { value: 'Pix', label: 'PIX' },
  { value: 'Dinheiro', label: 'Dinheiro' },
  { value: 'CartaoCredito', label: 'Cartão' },
  { value: 'CartaoDebito', label: 'Cartão' },
  { value: 'Outro', label: 'Outro' },
]

const initialForm = {
  nomeCliente: '',
  logradouroEntrega: '',
  numeroEntrega: '',
  bairroEntrega: '',
  complementoEntrega: '',
  referenciaEntrega: '',
  formaPagamento: 'Pix' as FormaPagamentoCheckout,
}

export function Checkout() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const {
    items,
    subtotal,
    desconto,
    total,
    coupon,
    clearCart,
  } = useCart()

  const [empresa, setEmpresa] = useState<{ nome?: string; whatsApp?: string | null; telefone?: string | null } | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [pedidoCriado, setPedidoCriado] = useState<{
    numero?: number | string
    id?: string
    produtos: Array<{ nome: string; quantidade: number; preco: number }>
    subtotal: number
    desconto: number
    total: number
    cupom?: string | null
    endereco: string
    referencia?: string | null
    formaPagamento: FormaPagamentoCheckout
    clienteNome: string
  } | null>(null)

  useEffect(() => {
    if (!slug) return

    obterEmpresaCatalogo(slug)
      .then((empresaCatalogo) => setEmpresa(empresaCatalogo))
      .catch(() => setEmpresa(null))
  }, [slug])

  useEffect(() => {
    if (items.length === 0 && !pedidoCriado) {
      navigate(`/catalogo/${slug ?? ''}`)
    }
  }, [items.length, pedidoCriado, navigate, slug])

  const totalItens = useMemo(() => items.reduce((sum, item) => sum + item.quantidade, 0), [items])

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const validateStep = (stepIndex: number) => {
    const nextErrors: Record<string, string> = {}

    if (stepIndex === 0) {
      if (!form.nomeCliente.trim()) nextErrors.nomeCliente = 'Informe seu nome.'
    }

    if (stepIndex === 1) {
      if (!form.logradouroEntrega.trim()) nextErrors.logradouroEntrega = 'Informe a rua.'
      if (!form.numeroEntrega.trim()) nextErrors.numeroEntrega = 'Informe o número.'
      if (!form.bairroEntrega.trim()) nextErrors.bairroEntrega = 'Informe o bairro.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return false
    }

    return true
  }

  const goNext = () => {
    if (!validateStep(currentStep)) return
    setCurrentStep((current) => Math.min(current + 1, steps.length - 1))
  }

  const goBack = () => {
    setCurrentStep((current) => Math.max(current - 1, 0))
  }

  const confirmarPedido = async () => {
    if (isSubmitting) return

    const valid = validateStep(0) && validateStep(1)
    if (!valid) {
      setCurrentStep(0)
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const payload = buildVendaPayload({
        nomeCliente: form.nomeCliente,
        logradouroEntrega: form.logradouroEntrega,
        numeroEntrega: form.numeroEntrega,
        bairroEntrega: form.bairroEntrega,
        complementoEntrega: form.complementoEntrega,
        referenciaEntrega: form.referenciaEntrega,
        formaPagamento: form.formaPagamento,
        valorEntrega: 0,
        observacao: '',
        itens: items.map((item) => ({ id: item.id, quantidade: item.quantidade })),
        cupomCodigo: coupon?.codigo,
        valorDesconto: desconto,
      })

      const venda = await criarVenda(payload)
      const numeroPedido = venda.numero ?? venda.id ?? 'Pedido'
      const produtosPedido = items.map((item) => ({
        nome: item.nome,
        quantidade: item.quantidade,
        preco: item.preco,
      }))
      const enderecoPedido = `${form.logradouroEntrega}, ${form.numeroEntrega} - ${form.bairroEntrega}`

      setPedidoCriado({
        numero: numeroPedido,
        id: venda.id,
        produtos: produtosPedido,
        subtotal,
        desconto,
        total,
        cupom: coupon?.codigo,
        endereco: enderecoPedido,
        referencia: form.referenciaEntrega || null,
        formaPagamento: form.formaPagamento,
        clienteNome: form.nomeCliente,
      })

      const rawEmpresaWhatsApp = empresa?.whatsApp ?? empresa?.telefone ?? ''
      const numeroWhatsApp = rawEmpresaWhatsApp
        .replace(/\s+/g, '')
        .replace(/[()\-]/g, '')
        .replace(/[^\d]/g, '')

      const numeroWhatsAppFinal = numeroWhatsApp.startsWith('55') ? numeroWhatsApp : numeroWhatsApp ? `55${numeroWhatsApp}` : ''

      if (!numeroWhatsAppFinal) {
        setSubmitError('O WhatsApp da empresa não está configurado. Não foi possível abrir o atendimento.')
        return
      }

      const mensagem = [
        'Olá! Fiz um pedido pelo catálogo.',
        '',
        `*Pedido #${numeroPedido}*`,
        `Cliente: ${form.nomeCliente}`,
        '',
        '*Produtos:*',
        ...produtosPedido.map((produto) => `• ${produto.nome} — ${produto.quantidade}x ${formatCurrency(produto.preco)}`),
        '',
        `Subtotal: ${formatCurrency(subtotal)}`,
        ...(coupon?.codigo ? [`Cupom: ${coupon.codigo}`] : []),
        `Desconto: ${formatCurrency(desconto)}`,
        `*Total: ${formatCurrency(total)}*`,
        '',
        '*Entrega:*',
        enderecoPedido,
        ...(form.referenciaEntrega ? [`Referência: ${form.referenciaEntrega}`] : []),
        '',
        `Forma de pagamento: ${form.formaPagamento.toUpperCase()}`,
        'Status do pagamento: Pendente',
        '',
        'Obrigado!',
      ].join('\n')

      const url = `https://wa.me/${numeroWhatsAppFinal}?text=${encodeURIComponent(mensagem)}`
      console.log('WhatsApp empresa:', numeroWhatsAppFinal)
      console.log('URL WhatsApp:', url)

      window.open(url, '_blank', 'noopener,noreferrer')
      clearCart()
    } catch (error) {
      setSubmitError(getPedidoErrorMessage(error, 'Não foi possível finalizar o pedido. Tente novamente.'))
      setCurrentStep(0)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!slug) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">Checkout</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-ink">Catálogo não encontrado</h1>
      </div>
    )
  }

  if (pedidoCriado) {
    const numeroPedido = pedidoCriado.numero ?? pedidoCriado.id ?? 'Pedido'
    const catalogo = empresa

    console.log('CATALOGO:', catalogo)
    console.log('WHATSAPP EMPRESA:', catalogo?.whatsApp)

    const numero = (catalogo?.whatsApp ?? '').replace(/\D/g, '')
    const numeroFinal = numero.startsWith('55') ? numero : numero ? `55${numero}` : ''
    const urlWhatsApp = numeroFinal ? `https://wa.me/${numeroFinal}` : ''

    return (
      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-12">
        <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 size={32} />
          </div>
          <p className="mt-5 text-center text-sm font-semibold uppercase tracking-[0.2em] text-teal">Pedido realizado</p>
          <h1 className="mt-3 text-center font-display text-3xl font-bold text-ink">Pedido realizado com sucesso!</h1>
          <p className="mt-4 text-center text-lg font-semibold text-ink">Pedido #{numeroPedido}</p>
          <p className="mt-2 text-center text-ink/60">Seu pedido foi enviado para a empresa.</p>

          <div className="mt-6 space-y-3 rounded-2xl bg-paper p-4 text-sm text-ink/70">
            <p><strong>Cliente:</strong> {pedidoCriado.clienteNome}</p>
            <p><strong>Entrega:</strong> {pedidoCriado.endereco}</p>
            {form.complementoEntrega && <p><strong>Complemento:</strong> {form.complementoEntrega}</p>}
            {pedidoCriado.referencia && <p><strong>Referência:</strong> {pedidoCriado.referencia}</p>}
            <p><strong>Pagamento:</strong> {pedidoCriado.formaPagamento}</p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href={urlWhatsApp || '#'}
              target={urlWhatsApp ? '_blank' : undefined}
              rel={urlWhatsApp ? 'noreferrer' : undefined}
              className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700"
              onClick={(event) => {
                if (!urlWhatsApp) {
                  event.preventDefault()
                  window.alert('O WhatsApp da empresa não está configurado.')
                }
              }}
            >
              Abrir WhatsApp da empresa
            </a>
            <Link
              to={`/catalogo/${slug}`}
              className="inline-flex items-center justify-center rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm font-semibold text-ink/70 hover:border-teal hover:text-teal"
            >
              Voltar ao catálogo
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-5 py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">Checkout</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-ink">Seu carrinho está vazio</h1>
        <Link to={`/catalogo/${slug}`} className="mt-6 inline-flex rounded-xl bg-teal px-5 py-3 text-sm font-semibold text-white hover:bg-teal/90">
          Voltar ao catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <div className="mb-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(`/catalogo/${slug}/carrinho`)}
          className="inline-flex items-center gap-2 rounded-lg border border-ink/15 bg-white px-4 py-2 text-sm font-semibold text-ink/70 hover:border-teal hover:text-teal"
        >
          <ArrowLeft size={16} />
          Voltar ao carrinho
        </button>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isDone = index < currentStep

          return (
            <div
              key={step}
              className={`flex items-center rounded-full px-3 py-2 text-xs font-semibold ${
                isActive ? 'bg-teal text-white' : isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-ink/60'
              }`}
            >
              {index + 1}. {step}
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
        <div className="rounded-3xl border border-ink/10 bg-white p-4 shadow-sm sm:p-6">
          {currentStep === 0 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-teal/10 p-2 text-teal"><UserRound size={18} /></div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">Dados do cliente</p>
                  <h2 className="mt-1 font-display text-2xl font-bold text-ink">Quem vai receber o pedido?</h2>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-ink/70">Nome *</label>
                  <input
                    value={form.nomeCliente}
                    onChange={(event) => updateField('nomeCliente', event.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-teal focus:ring-4 focus:ring-teal/10"
                  />
                  {errors.nomeCliente && <p className="mt-2 text-sm text-rose-600">{errors.nomeCliente}</p>}
                </div>

              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-teal/10 p-2 text-teal"><MapPin size={18} /></div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">Endereço</p>
                  <h2 className="mt-1 font-display text-2xl font-bold text-ink">Onde a entrega será feita?</h2>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-ink/70">Rua *</label>
                  <input
                    value={form.logradouroEntrega}
                    onChange={(event) => updateField('logradouroEntrega', event.target.value)}
                    placeholder="Rua, avenida ou travessa"
                    className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-teal focus:ring-4 focus:ring-teal/10"
                  />
                  {errors.logradouroEntrega && <p className="mt-2 text-sm text-rose-600">{errors.logradouroEntrega}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-ink/70">Número *</label>
                  <input
                    value={form.numeroEntrega}
                    onChange={(event) => updateField('numeroEntrega', event.target.value)}
                    placeholder="123"
                    className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-teal focus:ring-4 focus:ring-teal/10"
                  />
                  {errors.numeroEntrega && <p className="mt-2 text-sm text-rose-600">{errors.numeroEntrega}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-ink/70">Bairro *</label>
                  <input
                    value={form.bairroEntrega}
                    onChange={(event) => updateField('bairroEntrega', event.target.value)}
                    placeholder="Centro"
                    className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-teal focus:ring-4 focus:ring-teal/10"
                  />
                  {errors.bairroEntrega && <p className="mt-2 text-sm text-rose-600">{errors.bairroEntrega}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-ink/70">Complemento</label>
                  <input
                    value={form.complementoEntrega}
                    onChange={(event) => updateField('complementoEntrega', event.target.value)}
                    placeholder="Casa, apartamento, bloco"
                    className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-teal focus:ring-4 focus:ring-teal/10"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-ink/70">Referência</label>
                  <input
                    value={form.referenciaEntrega}
                    onChange={(event) => updateField('referenciaEntrega', event.target.value)}
                    placeholder="Próximo à praça, loja, etc."
                    className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-teal focus:ring-4 focus:ring-teal/10"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-teal/10 p-2 text-teal"><CreditCard size={18} /></div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">Pagamento</p>
                  <h2 className="mt-1 font-display text-2xl font-bold text-ink">Qual será a forma de pagamento?</h2>
                </div>
              </div>

              <div className="grid gap-3">
                {opcoesPagamento.map((opcao) => {
                  const selected = form.formaPagamento === opcao.value

                  return (
                    <button
                      key={opcao.value}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, formaPagamento: opcao.value }))}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                        selected ? 'border-teal bg-teal/5 text-teal' : 'border-ink/15 bg-paper text-ink/70 hover:border-teal/50'
                      }`}
                    >
                      <span className="font-semibold">{opcao.label}</span>
                      <span className="text-xs uppercase tracking-[0.2em]">{selected ? 'Selecionado' : 'Escolher'}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-teal/10 p-2 text-teal"><ShieldCheck size={18} /></div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">Resumo</p>
                  <h2 className="mt-1 font-display text-2xl font-bold text-ink">Confira antes de confirmar</h2>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl bg-paper p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/45">Cliente</p>
                  <p className="mt-2 font-semibold text-ink">{form.nomeCliente}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/45">Entrega</p>
                  <p className="mt-2 text-sm text-ink/70">
                    {form.logradouroEntrega}, {form.numeroEntrega} - {form.bairroEntrega}
                  </p>
                  {form.complementoEntrega && <p className="text-sm text-ink/70">Complemento: {form.complementoEntrega}</p>}
                  {form.referenciaEntrega && <p className="text-sm text-ink/70">Referência: {form.referenciaEntrega}</p>}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/45">Produtos</p>
                  <div className="mt-3 space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2">
                        <div>
                          <p className="font-medium text-ink">{item.nome}</p>
                          <p className="text-xs text-ink/55">{item.quantidade}x {formatCurrency(item.preco)}</p>
                        </div>
                        <p className="font-semibold text-ink">{formatCurrency(item.preco * item.quantidade)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 border-t border-ink/10 pt-3 text-sm text-ink/65">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {coupon?.valido ? (
                    <div className="flex items-center justify-between">
                      <span>Cupom {coupon.codigo}</span>
                      <span>-{formatCurrency(desconto)}</span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between border-t border-ink/10 pt-2 text-base font-semibold text-ink">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/45">Pagamento</p>
                  <p className="mt-2 text-sm font-medium text-ink">{form.formaPagamento}</p>
                  <p className="mt-1 text-sm text-ink/60">Pagamento: Pendente</p>
                </div>
              </div>

              {submitError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm font-medium text-rose-700">
                  {submitError}
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Resumo do pedido</h2>

          <div className="mt-4 space-y-3 text-sm text-ink/65">
            <div className="flex items-center justify-between">
              <span>Itens</span>
              <span>{totalItens}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Desconto</span>
              <span>-{formatCurrency(desconto)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-ink/10 pt-3 text-base font-semibold text-ink">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-paper p-3 text-sm text-ink/70">
            <p className="font-semibold text-ink">Status inicial</p>
            <p className="mt-1">Pagamento: Pendente</p>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={goNext}
                className="w-full rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white hover:bg-teal/90"
              >
                Continuar
              </button>
            ) : (
              <button
                type="button"
                onClick={confirmarPedido}
                disabled={isSubmitting}
                className="w-full rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Finalizando pedido...' : 'Confirmar pedido'}
              </button>
            )}

            {currentStep > 0 && (
              <button
                type="button"
                onClick={goBack}
                className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm font-semibold text-ink/70 hover:border-teal hover:text-teal"
              >
                Voltar
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
