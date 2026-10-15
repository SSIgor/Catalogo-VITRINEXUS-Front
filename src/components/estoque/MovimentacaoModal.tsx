import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { EstoqueProduto } from '../../types/estoque'
import {
  enviarMovimentacaoValidada,
  filtrarProdutosMovimentacao,
  movimentacaoEstoqueSchema,
  selecionarProdutoMovimentacao,
  type MovimentacaoEstoqueFormData,
} from '../../utils/movimentacaoEstoque'

export type MovimentacaoFormData = MovimentacaoEstoqueFormData

interface Props {
  produtos: EstoqueProduto[]
  selectedId?: string
  isSaving: boolean
  onSubmit: (data: MovimentacaoFormData) => Promise<void>
  onClose: () => void
}

interface ProdutoSelectProps {
  produtos: EstoqueProduto[]
  value: string
  onChange: (value: string) => void
  disabled: boolean
}

function ProdutoSelect({ produtos, value, onChange, disabled }: ProdutoSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const filtered = filtrarProdutosMovimentacao(produtos, search)
  const selected = selecionarProdutoMovimentacao(produtos, value)

  useEffect(() => {
    if (!open) return
    searchRef.current?.focus()
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [open])

  useEffect(() => setActiveIndex(0), [search])

  const choose = (product: EstoqueProduto) => {
    onChange(product.id)
    setSearch('')
    setOpen(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((current) => Math.min(current + 1, filtered.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) => Math.max(current - 1, 0))
    } else if (event.key === 'Enter' && filtered[activeIndex]) {
      event.preventDefault()
      choose(filtered[activeIndex])
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className="relative mt-2">
      <div className="flex min-h-12 w-full items-center rounded-xl border border-ink/15 bg-paper focus-within:border-teal focus-within:ring-4 focus-within:ring-teal/10">
        <button
          type="button"
          role="combobox"
          aria-label="Produto"
          aria-labelledby="movimentacao-produto-label"
          aria-expanded={open}
          disabled={disabled}
          onClick={() => setOpen((current) => !current)}
          className="flex min-w-0 flex-1 items-center justify-between gap-3 px-4 py-3 text-left text-sm font-normal disabled:opacity-60"
        >
          <span className={selected ? 'truncate text-ink' : 'truncate text-ink/45'}>
            {selected?.nome ?? 'Selecione um produto'}
          </span>
          <ChevronDown size={16} className="shrink-0 text-ink/45" />
        </button>
        {selected && (
          <button
            type="button"
            aria-label="Limpar produto selecionado"
            disabled={disabled}
            onClick={() => { onChange(''); setSearch(''); setOpen(true) }}
            className="mr-2 rounded-lg p-2 text-ink/45 hover:bg-white hover:text-ink"
          >
            <X size={16} />
          </button>
        )}
      </div>
      {open && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-ink/10 bg-white shadow-xl">
          <div className="border-b border-ink/10 p-2">
            <div className="flex items-center gap-2 rounded-lg bg-paper px-3">
              <Search size={16} className="shrink-0 text-ink/45" />
              <input
                ref={searchRef}
                type="search"
                aria-label="Buscar produto"
                placeholder="Buscar produto..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={handleKeyDown}
                className="h-10 min-w-0 flex-1 bg-transparent text-sm font-normal outline-none placeholder:text-ink/40"
              />
            </div>
          </div>
          <ul role="listbox" aria-label="Produtos" className="max-h-60 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm font-normal text-ink/50">Nenhum produto encontrado</li>
            ) : filtered.map((product, index) => (
              <li
                key={product.id}
                role="option"
                aria-selected={product.id === value}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  choose(product)
                }}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-normal ${index === activeIndex ? 'bg-mint text-ink' : 'text-ink hover:bg-paper'}`}
              >
                <span className="min-w-0">
                  <span className="block break-words">{product.nome}</span>
                  <span className="mt-0.5 block text-xs text-ink/45">{product.codigo || 'Sem código'} · Estoque: {product.estoqueAtual}</span>
                </span>
                {product.id === value && <Check size={16} className="shrink-0 text-teal" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function MovimentacaoModal({ produtos, selectedId, isSaving, onSubmit, onClose }: Props) {
  const { register, control, watch, handleSubmit, reset, formState: { errors } } = useForm<MovimentacaoFormData>({
    resolver: zodResolver(movimentacaoEstoqueSchema),
    defaultValues: { produtoId: selectedId ?? '', tipo: 'entrada', valor: 0, observacao: '' },
  })

  useEffect(() => {
    reset({ produtoId: selectedId ?? '', tipo: 'entrada', valor: 0, observacao: '' })
  }, [selectedId, reset])

  const product = selecionarProdutoMovimentacao(produtos, watch('produtoId'))
  const type = watch('tipo')
  const value = Number(watch('valor')) || 0
  const difference = type === 'ajuste' ? value - (product?.estoqueAtual ?? 0) : value
  const after = (product?.estoqueAtual ?? 0) + difference
  const input = 'mt-2 w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 outline-none focus:border-teal focus:ring-4 focus:ring-teal/10'

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-widest text-teal">Estoque</p><h2 className="mt-2 font-display text-2xl font-bold">Movimentar estoque</h2></div>
          <button aria-label="Fechar modal" onClick={onClose} className="rounded-full p-2 text-ink/50 hover:bg-paper"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit((data) => enviarMovimentacaoValidada(data, onSubmit))} className="mt-7 space-y-5">
          <div className="block text-sm font-semibold">
            <span id="movimentacao-produto-label">Produto</span>
            <Controller
              name="produtoId"
              control={control}
              render={({ field }) => <ProdutoSelect produtos={produtos} value={field.value} onChange={field.onChange} disabled={isSaving} />}
            />
            {errors.produtoId && <span className="mt-1 block text-xs font-normal text-rose-600">{errors.produtoId.message}</span>}
          </div>
          <label className="block text-sm font-semibold">Tipo<select {...register('tipo')} className={input}><option value="entrada">Entrada</option><option value="ajuste">Ajuste</option></select></label>
          <label className="block text-sm font-semibold">{type === 'entrada' ? 'Quantidade de entrada' : 'Novo estoque'}
            <input {...register('valor')} type="number" min={type === 'entrada' ? 1 : 0} step={1} inputMode="numeric" className={input} />
            {errors.valor && <span role="alert" className="mt-1 block text-xs font-normal text-rose-600">{errors.valor.message}</span>}
          </label>
          {product && <div className="rounded-xl bg-mint p-4 text-sm"><p>Estoque atual: <strong>{product.estoqueAtual}</strong></p>{type === 'entrada' ? <p className="mt-1">Novo estoque: <strong>{after}</strong></p> : <p className="mt-1">Diferença: <strong className={difference < 0 ? 'text-coral' : 'text-teal'}>{difference > 0 ? '+' : ''}{difference}</strong> unidades</p>}<p className="mt-1 text-xs text-ink/50">{type === 'ajuste' ? `Ajuste de ${difference > 0 ? '+' : ''}${difference} unidades.` : `Entrada de +${value} unidades.`}</p></div>}
          <label className="block text-sm font-semibold">Observação<textarea {...register('observacao')} rows={3} className={input} placeholder="Ex.: Contagem física" /></label>
          <button disabled={isSaving} className="w-full rounded-xl bg-teal py-3.5 font-semibold text-white hover:bg-teal/90 disabled:cursor-wait disabled:opacity-60">{isSaving ? 'Confirmando...' : 'Confirmar movimentação'}</button>
        </form>
      </div>
    </div>
  )
}
