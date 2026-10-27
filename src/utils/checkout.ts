export type FormaPagamentoCheckout = 'Dinheiro' | 'Pix' | 'CartaoCredito' | 'CartaoDebito' | 'Outro'

export interface CheckoutItemPayload {
  id: string
  quantidade: number
}

export interface CheckoutFormData {
  nomeCliente: string
  logradouroEntrega: string
  numeroEntrega: string
  bairroEntrega: string
  complementoEntrega: string
  referenciaEntrega: string
  formaPagamento: FormaPagamentoCheckout
  valorEntrega: number
  observacao: string
}

export interface CheckoutRequiredFields {
  nomeCliente: string
  logradouroEntrega: string
  numeroEntrega: string
  bairroEntrega: string
}

export interface VendaCreatePayload {
  clienteId: null
  formaPagamento: FormaPagamentoCheckout
  valorDesconto: number
  valorEntrega: number
  observacao: string
  itens: Array<{ produtoId: string; quantidade: number }>
  cupomCodigo?: string
  nomeCliente: string
  logradouroEntrega: string
  numeroEntrega: string
  bairroEntrega: string
  complementoEntrega?: string
  referenciaEntrega?: string
}

export function validateCheckoutRequiredFields(fields: CheckoutRequiredFields): Partial<Record<keyof CheckoutRequiredFields, string>> {
  const errors: Partial<Record<keyof CheckoutRequiredFields, string>> = {}
  if (!fields.nomeCliente.trim()) errors.nomeCliente = 'Informe seu nome.'
  if (!fields.logradouroEntrega.trim()) errors.logradouroEntrega = 'Informe a rua.'
  if (!fields.numeroEntrega.trim()) errors.numeroEntrega = 'Informe o número.'
  if (!fields.bairroEntrega.trim()) errors.bairroEntrega = 'Informe o bairro.'
  return errors
}

export function limparTelefone(value: string): string {
  return value.replace(/\D/g, '').slice(0, 14)
}

export function formatarTelefoneInput(value: string): string {
  const digits = limparTelefone(value)

  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
}

export function buildVendaPayload(input: {
  nomeCliente: string
  logradouroEntrega: string
  numeroEntrega: string
  bairroEntrega: string
  complementoEntrega?: string
  referenciaEntrega?: string
  formaPagamento: FormaPagamentoCheckout
  valorEntrega: number
  observacao: string
  itens: CheckoutItemPayload[]
  cupomCodigo?: string
  valorDesconto: number
}): VendaCreatePayload {
  return {
    clienteId: null,
    formaPagamento: input.formaPagamento,
    valorDesconto: Number(input.valorDesconto ?? 0),
    valorEntrega: Number(input.valorEntrega ?? 0),
    observacao: input.observacao ?? '',
    itens: input.itens.map((item) => ({
      produtoId: item.id,
      quantidade: Number(item.quantidade ?? 0),
    })),
    ...(input.cupomCodigo ? { cupomCodigo: input.cupomCodigo.toUpperCase() } : {}),
    nomeCliente: input.nomeCliente.trim(),
    logradouroEntrega: input.logradouroEntrega.trim(),
    numeroEntrega: input.numeroEntrega.trim(),
    bairroEntrega: input.bairroEntrega.trim(),
    ...(input.complementoEntrega?.trim() ? { complementoEntrega: input.complementoEntrega.trim() } : {}),
    ...(input.referenciaEntrega?.trim() ? { referenciaEntrega: input.referenciaEntrega.trim() } : {}),
  }
}

export function getWhatsAppNumber(value?: string | null): string {
  const raw = value?.trim() ?? ''
  if (!raw) return ''

  const explicitInternational = raw.startsWith('+') || raw.startsWith('00')
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)

  if (!explicitInternational && !digits.startsWith('55')) {
    if (digits.length !== 10 && digits.length !== 11) return ''
    digits = `55${digits}`
  }

  if (digits.startsWith('55')) {
    if (digits.length !== 12 && digits.length !== 13) return ''
    const ddd = digits.slice(2, 4)
    const subscriber = digits.slice(4)
    if (ddd === '00' || !/^(?:[2-9]\d{7}|9\d{8})$/.test(subscriber)) return ''
    return digits
  }

  if (digits.length < 8 || digits.length > 15 || digits.startsWith('0')) return ''
  return digits
}

export function reserveWhatsAppPopup(openWindow: () => Window | null = () => window.open('about:blank', '_blank')): Window | null {
  let popup: Window | null = null
  try {
    popup = openWindow()
    if (!popup) return null
    popup.opener = null
    popup.document.title = 'VITRINEXUS — pedido em andamento'
    popup.document.body.textContent = 'Estamos registrando seu pedido. O WhatsApp será aberto ao concluir.'
    return popup
  } catch {
    try { popup?.close() } catch { /* Ignora falhas ao fechar a aba temporária. */ }
    return null
  }
}

export function navigateWhatsAppPopup(popup: Window | null, url: string): boolean {
  if (!popup) return false
  try {
    popup.location.replace(url)
    return true
  } catch {
    try { popup.close() } catch { /* O link manual continua disponível no checkout. */ }
    return false
  }
}

export function closeWhatsAppPopup(popup: Window | null): void {
  try { popup?.close() } catch { /* Ignora falhas ao fechar a aba temporária. */ }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function getStatusPaymentLabel(value?: string | null): string {
  if ((value ?? '').toUpperCase() === 'PAGO') return 'Pago'
  return 'Pendente'
}

export function buildWhatsAppUrl(input: {
  empresaWhatsApp?: string | null
  pedidoNumero: number | string
  clienteNome: string
  produtos: Array<{ nome: string; quantidade: number; preco: number }>
  subtotal: number
  cupom?: string | null
  desconto: number
  total: number
  endereco: string
  referencia?: string | null
  formaPagamento: string
  statusPagamento?: string | null
}): string {
  const companyNumber = getWhatsAppNumber(input.empresaWhatsApp)
  if (!companyNumber) throw new Error('O WhatsApp da empresa está ausente ou em formato inválido.')

  const lines = [
    'Olá! Fiz um pedido pelo catálogo.',
    '',
    `*Pedido #${input.pedidoNumero}*`,
    `Cliente: ${input.clienteNome}`,
    '',
    '*Produtos:*',
    ...input.produtos.map((produto) => {
      const unitario = Number(produto.preco ?? 0)
      const totalProduto = unitario * Number(produto.quantidade ?? 0)
      return `🍷 ${produto.nome} — ${produto.quantidade}x ${formatCurrency(unitario)} / unidade = ${formatCurrency(totalProduto)}`
    }),
    '',
    `Subtotal: ${formatCurrency(input.subtotal)}`,
    ...(input.cupom ? [`Cupom: ${input.cupom}`] : []),
    `Desconto: ${formatCurrency(input.desconto)}`,
    `*Total: ${formatCurrency(input.total)}*`,
    '',
    '*Entrega:*',
    input.endereco,
    ...(input.referencia ? [`Referência: ${input.referencia}`] : []),
    '',
    `Forma de pagamento: ${input.formaPagamento.toUpperCase()}`,
    `Status do pagamento: ${getStatusPaymentLabel(input.statusPagamento)}`,
    '',
    'Obrigado!',
  ]

  return `https://wa.me/${companyNumber}?text=${encodeURIComponent(lines.join('\n'))}`
}

function getOriginalApiMessage(error: unknown): { message: string; status?: number; statusText?: string } {
  if (typeof error !== 'object' || error === null) return { message: typeof error === 'string' ? error : '' }

  const record = error as {
    message?: unknown
    response?: { status?: number; statusText?: string; data?: unknown }
  }
  const response = record.response
  const data = response?.data
  let message = ''

  if (typeof data === 'string' && data.trim()) {
    message = data.trim()
  } else if (typeof data === 'object' && data !== null) {
    const body = data as Record<string, unknown>
    for (const key of ['message', 'detail']) {
      if (typeof body[key] === 'string' && body[key].trim()) {
        message = body[key].trim()
        break
      }
    }

    if (!message && typeof body.errors === 'object' && body.errors !== null) {
      message = Object.values(body.errors as Record<string, unknown>)
        .flatMap((value) => Array.isArray(value) ? value : [value])
        .filter((value): value is string => typeof value === 'string' && Boolean(value.trim()))
        .join(' ')
    }

    if (!message) {
      for (const key of ['title', 'error']) {
        if (typeof body[key] === 'string' && body[key].trim()) {
          message = body[key].trim()
          break
        }
      }
    }
  }

  return {
    message: message || (typeof record.message === 'string' ? record.message : ''),
    status: response?.status,
    statusText: response?.statusText,
  }
}

export function getPedidoErrorMessage(error: unknown, fallback = 'Não foi possível finalizar o pedido. Tente novamente.') {
  const original = getOriginalApiMessage(error)
  let text = original.message

  if (original.status && (!text || /^Request failed with status code \d+/i.test(text))) {
    text = `A API respondeu com HTTP ${original.status}${original.statusText ? ` (${original.statusText})` : ''}.`
  } else if (!original.status && text && typeof error !== 'string') {
    return `Falha de comunicação com a API: ${text}`
  }

  if (!text) text = fallback
  if (/ESTOQUE|SEM_ESTOQUE|ESTOQUE_INSUFICIENTE/i.test(text)) {
    return `Não foi possível finalizar o pedido porque um dos produtos não possui mais estoque. Detalhe da API: ${text}`
  }
  if (/PRODUTO_INATIVO|INATIVO|INDISPONIVEL/i.test(text)) {
    return `Não foi possível finalizar o pedido porque um dos produtos está indisponível no momento. Detalhe da API: ${text}`
  }
  if (/CUPOM.*(INV|NAO|NÃO)|CUPOM_INVALIDO|CUPOM_NAO_ENCONTRADO|CUPOM_INATIVO|CUPOM_EXPIRADO/i.test(text)) {
    return `Não foi possível finalizar o pedido porque o cupom informado não é válido. Detalhe da API: ${text}`
  }
  if (/VENDA INVALIDA|VENDA INVÁLIDA|dados do pedido|inconsistentes/i.test(text)) {
    return `Não foi possível finalizar o pedido. Revise os dados e tente novamente. Detalhe da API: ${text}`
  }
  return text
}
