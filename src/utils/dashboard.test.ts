import { describe, expect, it } from 'vitest'
import { saudacaoParaHora, ultimosSeteDias } from './dashboard'

describe('Dashboard: saudação e série diária', () => {
  it.each([
    [4, 'Boa noite'],
    [5, 'Bom dia'],
    [11, 'Bom dia'],
    [12, 'Boa tarde'],
    [17, 'Boa tarde'],
    [18, 'Boa noite'],
    [23, 'Boa noite'],
  ])('usa a saudação local correta às %s horas', (hour, expected) => {
    const date = new Date(2026, 9, 14, hour)
    expect(saudacaoParaHora(date)).toBe(expected)
  })

  it('preenche os últimos sete dias com os dados recebidos e zero nos dias sem registro', () => {
    const today = new Date(2026, 9, 14, 10)
    const days = ultimosSeteDias([
      { data: '2026-10-09T00:00:00', quantidadeVendas: 2, faturamento: 350 },
      { data: '2026-10-14T00:00:00', quantidadeVendas: 1, faturamento: 90 },
    ], today)

    expect(days).toHaveLength(7)
    expect(days.map((day) => day.chave)).toEqual([
      '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11', '2026-10-12', '2026-10-13', '2026-10-14',
    ])
    expect(days[1]).toMatchObject({ faturamento: 350, quantidadeVendas: 2 })
    expect(days[5]).toMatchObject({ faturamento: 0, quantidadeVendas: 0 })
    expect(days[6]).toMatchObject({ faturamento: 90, quantidadeVendas: 1 })
  })

  it('mantém a série vazia sem criar valores de vendas', () => {
    const days = ultimosSeteDias([], new Date(2026, 9, 14))
    expect(days).toHaveLength(7)
    expect(days.every((day) => day.faturamento === 0 && day.quantidadeVendas === 0)).toBe(true)
  })
})
