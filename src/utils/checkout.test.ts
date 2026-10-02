import { describe, expect, it } from 'vitest'
import {
  buildVendaPayload,
  buildWhatsAppUrl,
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
})
