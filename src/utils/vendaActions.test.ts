import { describe, expect, it } from 'vitest'
import { getAcoesVendaDisponiveis } from './vendaActions'

describe('getAcoesVendaDisponiveis', () => {
  it('oferece confirmar e cancelar para venda pendente', () => {
    expect(getAcoesVendaDisponiveis({ status: 'Pendente', statusPagamento: 'Pendente' })).toEqual({
      confirmar: true, confirmarPagamento: false, concluir: false, cancelar: true,
    })
  })

  it('oferece confirmar pagamento e cancelar para venda confirmada não paga', () => {
    expect(getAcoesVendaDisponiveis({ status: 'Confirmada', statusPagamento: 'Pendente' })).toEqual({
      confirmar: false, confirmarPagamento: true, concluir: false, cancelar: true,
    })
  })

  it('oferece concluir e cancelar para venda confirmada e paga', () => {
    expect(getAcoesVendaDisponiveis({ status: 'Confirmada', statusPagamento: 'Pago' })).toEqual({
      confirmar: false, confirmarPagamento: false, concluir: true, cancelar: true,
    })
  })

  it('não oferece uma segunda confirmação depois que o status muda para confirmada', () => {
    const antesDaConfirmacao = getAcoesVendaDisponiveis({ status: 'Pendente', statusPagamento: 'Pendente' })
    const depoisDaConfirmacao = getAcoesVendaDisponiveis({ status: 'Confirmada', statusPagamento: 'Pendente' })
    expect(antesDaConfirmacao.confirmar).toBe(true)
    expect(depoisDaConfirmacao.confirmar).toBe(false)
    expect(depoisDaConfirmacao.confirmarPagamento).toBe(true)
  })

  it('não oferece ações para venda concluída ou cancelada', () => {
    const nenhumaAcao = { confirmar: false, confirmarPagamento: false, concluir: false, cancelar: false }
    expect(getAcoesVendaDisponiveis({ status: 'Concluida', statusPagamento: 'Pago' })).toEqual(nenhumaAcao)
    expect(getAcoesVendaDisponiveis({ status: 'Cancelada', statusPagamento: 'Pendente' })).toEqual(nenhumaAcao)
  })

  it('normaliza maiúsculas e acentos nos status', () => {
    expect(getAcoesVendaDisponiveis({ status: 'CONFIRMADA', statusPagamento: 'pendente' }).confirmarPagamento).toBe(true)
    expect(getAcoesVendaDisponiveis({ status: 'Concluída', statusPagamento: 'PAGO' }).cancelar).toBe(false)
  })
})
