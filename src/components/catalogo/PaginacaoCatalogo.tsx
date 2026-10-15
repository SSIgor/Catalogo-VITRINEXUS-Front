import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ResultadoPaginacao } from '../../utils/catalogoPaginacao'

interface Props<T> {
  paginacao: ResultadoPaginacao<T>
  aoMudarPagina: (pagina: number) => void
}

export function PaginacaoCatalogo<T>({ paginacao, aoMudarPagina }: Props<T>) {
  if (paginacao.totalPaginas === 0) return null

  return <nav aria-label="Paginação dos produtos" className="mt-8 flex flex-col items-center gap-4">
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => aoMudarPagina(paginacao.pagina - 1)}
        disabled={!paginacao.podeVoltar}
        className="inline-flex items-center gap-1 rounded-lg border border-ink/15 px-3 py-2 text-sm font-semibold text-ink transition-colors hover:border-teal hover:text-teal disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={16} />Anterior
      </button>
      {Array.from({ length: paginacao.totalPaginas }, (_, index) => index + 1).map((pagina) => (
        <button
          key={pagina}
          type="button"
          onClick={() => aoMudarPagina(pagina)}
          aria-label={`Página ${pagina}`}
          aria-current={pagina === paginacao.pagina ? 'page' : undefined}
          className={`grid h-10 min-w-10 place-items-center rounded-lg px-3 text-sm font-semibold transition-colors ${pagina === paginacao.pagina ? 'bg-teal text-white' : 'border border-ink/15 text-ink hover:border-teal hover:text-teal'}`}
        >
          {pagina}
        </button>
      ))}
      <button
        type="button"
        onClick={() => aoMudarPagina(paginacao.pagina + 1)}
        disabled={!paginacao.podeAvancar}
        className="inline-flex items-center gap-1 rounded-lg border border-ink/15 px-3 py-2 text-sm font-semibold text-ink transition-colors hover:border-teal hover:text-teal disabled:cursor-not-allowed disabled:opacity-40"
      >
        Próxima<ChevronRight size={16} />
      </button>
    </div>
    <p className="text-center text-sm font-medium text-ink/50">Página {paginacao.pagina} de {paginacao.totalPaginas}</p>
  </nav>
}
