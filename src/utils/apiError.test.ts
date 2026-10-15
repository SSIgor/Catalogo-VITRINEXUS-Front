import axios from 'axios'
import { describe, expect, it } from 'vitest'
import { messageForApiError } from './apiError'

describe('messageForApiError', () => {
  it('mostra a mensagem real da API em conflitos', () => {
    const error = new axios.AxiosError('Request failed', undefined, undefined, undefined, {
      status: 409,
      statusText: 'Conflict',
      headers: {},
      config: { headers: new axios.AxiosHeaders() },
      data: { message: 'Somente vendas confirmadas com pagamento podem ser concluídas.' },
    })

    expect(messageForApiError(error, 'fallback')).toBe('Somente vendas confirmadas com pagamento podem ser concluídas.')
  })

  it('usa o texto padrão quando o conflito não inclui corpo', () => {
    const error = new axios.AxiosError('Request failed', undefined, undefined, undefined, {
      status: 409,
      statusText: 'Conflict',
      headers: {},
      config: { headers: new axios.AxiosHeaders() },
      data: undefined,
    })

    expect(messageForApiError(error, 'fallback')).toBe('A venda não pode ser concluída no estado atual.')
  })
})
