import { z } from 'zod'
import type { EstoqueProduto } from '../types/estoque'

export const movimentacaoEstoqueSchema = z.object({
  produtoId: z.string().min(1, 'Selecione um produto.'),
  tipo: z.enum(['entrada', 'ajuste']),
  valor: z.coerce
    .number({ invalid_type_error: 'Informe uma quantidade válida.' })
    .int('Informe um número inteiro, sem casas decimais.')
    .min(0, 'O valor não pode ser negativo.'),
  observacao: z.string().optional(),
}).superRefine((data, context) => {
  if (data.tipo === 'entrada' && data.valor < 1) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['valor'],
      message: 'A quantidade de entrada deve ser pelo menos 1.',
    })
  }
})

export type MovimentacaoEstoqueFormData = z.infer<typeof movimentacaoEstoqueSchema>

export function normalizarBuscaProduto(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim()
}

export function filtrarProdutosMovimentacao(produtos: EstoqueProduto[], busca: string): EstoqueProduto[] {
  const termo = normalizarBuscaProduto(busca)
  return produtos.filter((produto) => produto.ativo && normalizarBuscaProduto(produto.nome).includes(termo))
}

export function selecionarProdutoMovimentacao(produtos: EstoqueProduto[], produtoId: string): EstoqueProduto | undefined {
  return produtos.find((produto) => produto.id === produtoId && produto.ativo)
}

export async function enviarMovimentacaoValidada(
  data: MovimentacaoEstoqueFormData,
  onSubmit: (validatedData: MovimentacaoEstoqueFormData) => Promise<void>,
): Promise<void> {
  await onSubmit(movimentacaoEstoqueSchema.parse(data))
}
