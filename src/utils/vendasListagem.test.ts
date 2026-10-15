import { describe, expect, it } from 'vitest'
import type { Venda } from '../types/venda'
import { dataLocalParaInput, filtrarVendas, paginarVendas, VENDAS_POR_PAGINA } from './vendasListagem'

function venda(numero: number, status: string, pagamento: string): Venda {
  return { id: `v-${numero}`, numero, cliente: 'Cliente', status, statusPagamento: pagamento, dataCriacao: '2026-06-15T12:00:00' } as Venda
}

const semData = { dataInicial: '', dataFinal: '' }

const vendas = [
  venda(1, 'Pendente', 'Pendente'),
  venda(2, 'Cancelada', 'Pendente'),
  venda(3, 'Confirmada', 'Pago'),
  venda(4, 'Pendente', 'Pago'),
  ...Array.from({ length: 16 }, (_, index) => venda(index + 5, 'Confirmada', 'Pendente')),
]

describe('listagem de vendas', () => {
  it('filtra por situação e pagamento em conjunto usando os status reais', () => {
    expect(filtrarVendas(vendas, { busca: '', pagamento: 'nao-pagas', situacao: 'pendentes', ...semData }).map((item) => item.status))
      .toEqual(['Pendente'])
    expect(filtrarVendas(vendas, { busca: '', pagamento: 'pagas', situacao: 'canceladas', ...semData })).toEqual([])
    expect(filtrarVendas(vendas, { busca: '', pagamento: 'nao-pagas', situacao: 'canceladas', ...semData }).map((item) => item.status))
      .toEqual(['Cancelada'])
  })

  it('mostra 10 registros por página e calcula o total após aplicar os filtros', () => {
    const filtradas = filtrarVendas(vendas, { busca: '', pagamento: 'todos', situacao: 'todas', ...semData })
    const primeira = paginarVendas(filtradas, 1)
    const segunda = paginarVendas(filtradas, 2)

    expect(VENDAS_POR_PAGINA).toBe(10)
    expect(primeira).toMatchObject({ pagina: 1, totalPaginas: 2, podeVoltar: false, podeAvancar: true })
    expect(primeira.itens).toHaveLength(10)
    expect(segunda).toMatchObject({ pagina: 2, totalPaginas: 2, podeVoltar: true, podeAvancar: false })
    expect(segunda.itens).toHaveLength(10)
    expect(new Set([...primeira.itens, ...segunda.itens].map((item) => item.id)).size).toBe(20)
  })

  it('mantém a ordem recente recebida da API e não cria página para resultado vazio', () => {
    const vazias = paginarVendas([], 1)
    expect(vendas[0].numero).toBe(1)
    expect(vazias).toMatchObject({ itens: [], pagina: 1, totalPaginas: 0, podeVoltar: false, podeAvancar: false })
  })

  it('aplica o intervalo à DataCriacao e prepara a data local de hoje', () => {
    const hoje = dataLocalParaInput(new Date(2026, 5, 15, 12))
    const filtradas = filtrarVendas(vendas, {
      busca: '', pagamento: 'todos', situacao: 'todas', dataInicial: hoje, dataFinal: hoje,
    })

    expect(hoje).toBe('2026-06-15')
    expect(filtradas).toHaveLength(vendas.length)
    expect(filtrarVendas(vendas, {
      busca: '', pagamento: 'todos', situacao: 'todas', dataInicial: '2026-06-16', dataFinal: '2026-06-16',
    })).toEqual([])
  })
})
