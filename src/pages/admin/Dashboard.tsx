import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Box, CalendarDays, ClipboardList, Package, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { obterDashboard, obterFaturamentoDiario } from '../../api/dashboard'
import { listarEstoque } from '../../api/estoque'
import { messageForApiError } from '../../utils/apiError'
import { chaveDataLocal, formatarMoedaCompacta, saudacaoParaHora, ultimosSeteDias } from '../../utils/dashboard'

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const integer = new Intl.NumberFormat('pt-BR')

export function Dashboard() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const todayKey = chaveDataLocal(now)
  const monthStart = chaveDataLocal(new Date(now.getFullYear(), now.getMonth(), 1))
  const weekStart = chaveDataLocal(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6))
  const summary = useQuery({
    queryKey: ['dashboard', 'resumo', monthStart, todayKey],
    queryFn: () => obterDashboard(monthStart, todayKey),
  })
  const daily = useQuery({
    queryKey: ['dashboard', 'faturamento-diario', weekStart, todayKey],
    queryFn: () => obterFaturamentoDiario(weekStart, todayKey),
  })
  const products = useQuery({ queryKey: ['dashboard', 'produtos'], queryFn: listarEstoque })

  const days = useMemo(() => ultimosSeteDias(daily.data ?? [], now), [daily.data, todayKey])
  const totalSales = days.reduce((total, day) => total + day.quantidadeVendas, 0)
  const hasSales = days.some((day) => day.faturamento > 0 || day.quantidadeVendas > 0)
  const dateLabel = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now)

  const indicators = [
    {
      label: 'Vendas no mês',
      value: summary.data ? currency.format(summary.data.totalVendas) : '—',
      icon: ShoppingCart,
      iconClass: 'bg-teal/10 text-teal',
    },
    {
      label: 'Pedidos',
      value: summary.data ? integer.format(summary.data.quantidadeVendas) : '—',
      icon: ClipboardList,
      iconClass: 'bg-sky-50 text-sky-700',
    },
    {
      label: 'Produtos ativos',
      value: products.data ? integer.format(products.data.filter((product) => product.ativo).length) : '—',
      icon: Package,
      iconClass: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Estoque baixo',
      value: summary.data ? integer.format(summary.data.produtosEstoqueBaixo) : '—',
      icon: Box,
      iconClass: 'bg-rose-50 text-rose-700',
    },
  ]

  const queryError = summary.error ?? products.error

  return <div className="space-y-6">
    <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal">Visão geral</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{saudacaoParaHora(now)}, acompanhe tudo.</h1>
        <p className="mt-2 text-sm text-ink/55 sm:text-base">Aqui está o resumo da sua operação hoje.</p>
      </div>
      <div className="flex w-fit max-w-full items-center gap-2.5 rounded-xl border border-ink/10 bg-white px-3.5 py-2.5 text-sm text-ink/60 shadow-sm sm:px-4 sm:py-3">
        <CalendarDays size={17} className="shrink-0 text-teal" />
        <time dateTime={todayKey} className="capitalize">{dateLabel}</time>
      </div>
    </header>

    {queryError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{messageForApiError(queryError, 'Não foi possível carregar todos os indicadores do dashboard.')}</p>}

    <section aria-label="Indicadores da operação" className="grid grid-cols-1 gap-5 min-[420px]:grid-cols-2 xl:grid-cols-4">
      {indicators.map(({ label, value, icon: Icon, iconClass }) => <article key={label} className="flex min-h-40 flex-col rounded-2xl border border-ink/[0.08] bg-white p-6 shadow-[0_3px_14px_rgba(23,33,31,0.04)] transition-[border-color,box-shadow] duration-200 hover:border-teal/20 hover:shadow-[0_8px_22px_rgba(23,33,31,0.07)]">
        <div className="flex items-center gap-3">
          <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${iconClass}`}><Icon size={20} strokeWidth={1.9} /></div>
          <p className="text-sm font-medium text-ink/55">{label}</p>
        </div>
        <p className="mt-auto break-words pt-6 font-display text-[clamp(1.5rem,2vw,1.75rem)] font-bold tracking-tight text-ink">{value}</p>
      </article>)}
    </section>

    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(17rem,0.75fr)]">
      <article className="min-w-0 rounded-2xl border border-ink/[0.08] bg-white p-6 shadow-[0_3px_14px_rgba(23,33,31,0.04)] transition-shadow duration-200 hover:shadow-[0_8px_22px_rgba(23,33,31,0.06)] sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div><h2 className="font-display text-lg font-bold text-ink">Movimento de vendas</h2><p className="mt-1 text-sm text-ink/50">Últimos 7 dias · valores em reais</p></div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex w-fit items-center gap-2 rounded-lg bg-mint/70 px-3 py-2 text-xs font-semibold text-teal"><span className="h-2.5 w-2.5 rounded-sm bg-teal" />Faturamento</span>
            <span className="flex w-fit shrink-0 items-center rounded-lg border border-ink/[0.06] bg-paper px-3 py-2 text-xs font-semibold text-ink/60">{daily.isLoading ? 'Carregando pedidos...' : daily.error ? 'Pedidos indisponíveis' : `${integer.format(totalSales)} pedidos`}</span>
          </div>
        </div>
        {daily.error ? <p role="alert" className="mt-8 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{messageForApiError(daily.error, 'Não foi possível carregar o movimento de vendas.')}</p> : daily.isLoading ? (
          <div className="mt-8 grid h-64 place-items-center rounded-xl bg-paper/70 text-sm text-ink/45">Carregando movimento de vendas...</div>
        ) : (
          <SalesChart days={days} hasSales={hasSales} />
        )}
      </article>

      <aside className="relative flex min-h-64 flex-col overflow-hidden rounded-2xl bg-teal p-6 text-white shadow-[0_8px_24px_rgba(15,95,88,0.16)] sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-14 h-48 w-48 rounded-full border border-white/10" />
        <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/15"><Package size={21} /></div>
        <p className="relative mt-6 text-xs font-bold uppercase tracking-[0.16em] text-white/65">Atalho rápido</p>
        <h2 className="relative mt-2 font-display text-2xl font-bold leading-tight">Seu catálogo está pronto?</h2>
        <p className="relative mt-3 max-w-sm text-sm leading-relaxed text-white/75">Adicione produtos e deixe sua vitrine sempre atualizada.</p>
        <Link to="/admin/produtos/novo" className="relative mt-auto flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-teal shadow-sm transition-colors hover:bg-mint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
          <Package size={17} />Adicionar produto
        </Link>
      </aside>
    </section>
  </div>
}

function SalesChart({ days, hasSales }: { days: ReturnType<typeof ultimosSeteDias>; hasSales: boolean }) {
  const maxValue = Math.max(...days.map((day) => day.faturamento), 0)
  const axisMax = maxValue > 0 ? maxValue : 1
  const plotHeight = 210
  const ticks = [axisMax, axisMax * 2 / 3, axisMax / 3, 0]

  return <div className="mt-6">
    <div role="img" aria-label="Gráfico de faturamento confirmado dos últimos sete dias" className="grid min-w-0 grid-cols-[3.8rem_minmax(0,1fr)] gap-x-3">
      <div className="relative h-[210px]" aria-hidden="true">
        {ticks.map((tick, index) => <span key={`${tick}-${index}`} className={`absolute right-0 whitespace-nowrap text-[11px] tabular-nums text-ink/55 ${index === 0 ? '' : index === ticks.length - 1 ? '-translate-y-full' : '-translate-y-1/2'}`} style={{ top: `${index * (plotHeight / 3)}px` }}>{formatarMoedaCompacta(tick)}</span>)}
      </div>
      <div className="min-w-0">
        <div className="relative h-[210px]">
          {[0, 1, 2, 3].map((index) => <div key={index} className={`absolute inset-x-0 border-t ${index === 3 ? 'border-ink/15' : 'border-dashed border-ink/10'}`} style={{ top: `${index * (plotHeight / 3)}px` }} />)}
          <div className="absolute inset-0 flex items-end justify-around px-1.5">
            {days.map((day) => {
              const height = hasSales && day.faturamento > 0
                ? Math.max(Math.round((day.faturamento / axisMax) * plotHeight), 3)
                : 0
              const isToday = day.chave === chaveDataLocal(new Date())
              return <div key={day.chave} className="relative h-full min-w-0 flex-1">
                {height > 0 && <div
                  title={`${day.rotulo}: ${currency.format(day.faturamento)} · ${day.quantidadeVendas} pedidos`}
                  className={`absolute bottom-0 left-1/2 w-[58%] max-w-14 -translate-x-1/2 rounded-t-md ${isToday ? 'bg-teal' : 'bg-teal/75'}`}
                  style={{ height: `${height}px` }}
                />}
              </div>
            })}
          </div>
          {!hasSales && <div className="absolute inset-0 grid place-items-center px-3"><span className="rounded-lg border border-ink/[0.07] bg-white/95 px-4 py-3 text-center text-xs text-ink/50 shadow-sm sm:text-sm">Sem faturamento registrado neste período</span></div>}
        </div>
        <div className="mt-2 flex justify-around px-1.5" aria-hidden="true">
          {days.map((day) => <span key={day.chave} className="min-w-0 flex-1 text-center text-[10px] font-medium capitalize text-ink/50 sm:text-xs">{day.rotulo}</span>)}
        </div>
      </div>
    </div>
    <ul className="sr-only">{days.map((day) => <li key={day.chave}>{day.rotulo}: {currency.format(day.faturamento)}, {day.quantidadeVendas} pedidos</li>)}</ul>
  </div>
}
