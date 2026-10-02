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

export function limparTelefone(value: string): string {
  return value.replace(/\D/g, '').slice(0, 14)
}

export function formatarTelefoneInput(value: string): string {
  const digits = limparTelefone(value)

  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  }

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
  if (!value) return ''
  const digits = limparTelefone(value)
  return digits
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function getStatusPaymentLabel(value?: string | null): string {
  const normalized = (value ?? '').toUpperCase()
  if (normalized === 'PAGO') return 'Pago'
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
  if (!companyNumber) {
    return 'https://wa.me/'
  }

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

  const message = lines.join('\n')
  return `https://wa.me/${companyNumber}?text=${encodeURIComponent(message)}`
}

export function getPedidoErrorMessage(error: unknown, fallback = 'Não foi possível finalizar o pedido. Tente novamente.') {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } | string | { title?: string } } }
    const data = axiosError.response?.data

    if (typeof data === 'string' && data) return data
    if (typeof data === 'object' && data !== null) {
      const message = 'message' in data ? data.message : undefined
      const title = 'title' in data ? data.title : undefined
      if (message) return message
      if (title) return title
    }
  }

  const text = typeof error === 'string' ? error : fallback

  if (/ESTOQUE|SEM_ESTOQUE|ESTOQUE_INSUFICIENTE/i.test(text)) {
    return 'Não foi possível finalizar o pedido porque um dos produtos não possui mais estoque.'
  }

  if (/PRODUTO_INATIVO|INATIVO|INDISPONIVEL/i.test(text)) {
    return 'Não foi possível finalizar o pedido porque um dos produtos está indisponível no momento.'
  }

  if (/CUPOM.*(INV|NAO|NÃO)|CUPOM_INVALIDO|CUPOM_NAO_ENCONTRADO|CUPOM_INATIVO|CUPOM_EXPIRADO/i.test(text)) {
    return 'Não foi possível finalizar o pedido porque o cupom informado não é válido.'
  }

  if (/VENDA INVALIDA|VENDA INVÁLIDA|dados do pedido|inconsistentes/i.test(text)) {
    return 'Não foi possível finalizar o pedido. Revise os dados e tente novamente.'
  }

  return fallback
}
