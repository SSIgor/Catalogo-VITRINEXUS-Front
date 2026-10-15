export interface AcoesVendaDisponiveis {
  confirmar: boolean
  confirmarPagamento: boolean
  concluir: boolean
  cancelar: boolean
}

function normalizeStatus(value: unknown): string | null {
  if (typeof value !== 'string') return null
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
}

export function getAcoesVendaDisponiveis(venda: { status: unknown; statusPagamento: unknown }): AcoesVendaDisponiveis {
  const status = normalizeStatus(venda.status)
  const pagamento = normalizeStatus(venda.statusPagamento)

  const pendente = status === 'pendente'
  const confirmada = status === 'confirmada'
  const concluida = status === 'concluida'
  const cancelada = status === 'cancelada'
  const pagamentoPendente = pagamento === 'pendente'
  const pagamentoPago = pagamento === 'pago'

  return {
    confirmar: pendente,
    confirmarPagamento: confirmada && pagamentoPendente,
    concluir: confirmada && pagamentoPago,
    cancelar: (pendente || confirmada) && !concluida && !cancelada,
  }
}
