import { describe, expect, it, vi } from 'vitest'
import {
  buildVendaPayload,
  buildWhatsAppUrl,
  getPedidoErrorMessage,
  getWhatsAppNumber,
  navigateWhatsAppPopup,
  reserveWhatsAppPopup,
  validateCheckoutRequiredFields,
} from './checkout'

describe('checkout', () => {
  it('monta o payload de criação da venda sem enviar WhatsApp do cliente', () => {
    const payload = buildVendaPayload({
      nomeCliente: 'João Silva',
      logradouroEntrega: 'Rua X',
      numeroEntrega: '123',
      bairroEntrega: 'Centro',
      complementoEntrega: 'Casa',
      referenciaEntrega: 'Próximo ao mercado',
      formaPagamento: 'Pix',
      valorEntrega: 0,
      observacao: '',
      itens: [
        { id: 'prod-1', quantidade: 2 },
        { id: 'prod-2', quantidade: 1 },
      ],
      cupomCodigo: 'IMURA10',
      valorDesconto: 0,
    })

    expect(payload).toMatchObject({
      clienteId: null,
      formaPagamento: 'Pix',
      valorDesconto: 0,
      valorEntrega: 0,
      cupomCodigo: 'IMURA10',
      nomeCliente: 'João Silva',
      logradouroEntrega: 'Rua X',
      numeroEntrega: '123',
      bairroEntrega: 'Centro',
      complementoEntrega: 'Casa',
      referenciaEntrega: 'Próximo ao mercado',
      itens: [
        { produtoId: 'prod-1', quantidade: 2 },
        { produtoId: 'prod-2', quantidade: 1 },
      ],
    })

    expect(payload).not.toHaveProperty('whatsAppCliente')
  })

  it('gera a URL do WhatsApp com o número da empresa e sem o WhatsApp do cliente', () => {
    const url = buildWhatsAppUrl({
      empresaWhatsApp: '5566999999999',
      pedidoNumero: 123,
      clienteNome: 'João',
      produtos: [
        { nome: 'Vinho A', quantidade: 2, preco: 50 },
        { nome: 'Vinho B', quantidade: 1, preco: 80 },
      ],
      subtotal: 180,
      cupom: 'IMURA10',
      desconto: 18,
      total: 162,
      endereco: 'Rua X, 123 - Centro',
      referencia: 'Próximo à praça',
      formaPagamento: 'PIX',
      statusPagamento: 'Pendente',
    })

    expect(url).toContain('https://wa.me/5566999999999')
    expect(url).toContain('Pedido%20%23123')
    expect(url).toContain('Cliente%3A%20Jo%C3%A3o')
    expect(url).not.toContain('WhatsApp%3A')
    expect(url).toContain('Forma%20de%20pagamento%3A%20PIX')
    expect(url).toContain('Status%20do%20pagamento%3A%20Pendente')
  })

  it('normaliza números brasileiros e mantém números internacionais explícitos', () => {
    expect(getWhatsAppNumber('(66) 99999-9999')).toBe('5566999999999')
    expect(getWhatsAppNumber('+1 (212) 555-0100')).toBe('12125550100')
    expect(getWhatsAppNumber('telefone inválido')).toBe('')
    expect(() => buildWhatsAppUrl({
      empresaWhatsApp: 'telefone inválido',
      pedidoNumero: 1,
      clienteNome: 'Cliente',
      produtos: [],
      subtotal: 0,
      desconto: 0,
      total: 0,
      endereco: 'Rua X, 1 - Centro',
      formaPagamento: 'Pix',
    })).toThrow(/ausente ou em formato inválido/)
  })

  it('valida todos os campos obrigatórios do checkout', () => {
    expect(validateCheckoutRequiredFields({
      nomeCliente: ' ',
      logradouroEntrega: '',
      numeroEntrega: '',
      bairroEntrega: ' ',
    })).toEqual({
      nomeCliente: 'Informe seu nome.',
      logradouroEntrega: 'Informe a rua.',
      numeroEntrega: 'Informe o número.',
      bairroEntrega: 'Informe o bairro.',
    })
    expect(validateCheckoutRequiredFields({
      nomeCliente: 'Ana',
      logradouroEntrega: 'Rua X',
      numeroEntrega: '12',
      bairroEntrega: 'Centro',
    })).toEqual({})
  })

  it('preserva a mensagem original devolvida pela API e identifica falhas de rede', () => {
    expect(getPedidoErrorMessage({
      response: { status: 422, data: { detail: 'Produto sem saldo disponível.' } },
    })).toBe('Produto sem saldo disponível.')
    expect(getPedidoErrorMessage({
      response: { status: 400, data: { title: 'Validation failed', errors: { nome: ['Informe o nome.'] } } },
    })).toBe('Informe o nome.')
    expect(getPedidoErrorMessage({
      message: 'Request failed with status code 503',
      response: { status: 503, statusText: 'Service Unavailable' },
    })).toContain('HTTP 503')
    expect(getPedidoErrorMessage(new Error('Network Error'))).toContain('Network Error')
  })

  it('reserva a janela no clique e navega até a URL do WhatsApp', () => {
    const replace = vi.fn()
    const popup = {
      opener: {} as Window,
      location: { replace },
      document: { title: '', body: { textContent: '' } },
      close: vi.fn(),
    } as unknown as Window
    const openWindow = vi.fn(() => popup)

    const reserved = reserveWhatsAppPopup(openWindow)

    expect(openWindow).toHaveBeenCalledOnce()
    expect(reserved).toBe(popup)
    expect(popup.opener).toBeNull()
    expect(popup.document.title).toBe('VITRINEXUS — pedido em andamento')
    expect(navigateWhatsAppPopup(reserved, 'https://wa.me/5566999999999?text=Pedido')).toBe(true)
    expect(replace).toHaveBeenCalledWith('https://wa.me/5566999999999?text=Pedido')
    expect(navigateWhatsAppPopup(null, 'https://wa.me/5566999999999')).toBe(false)
    expect(reserveWhatsAppPopup(() => null)).toBeNull()
  })
})
