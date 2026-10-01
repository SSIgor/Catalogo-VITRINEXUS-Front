import type { CategoriaCatalogo } from '../../types/catalogo'

export function FiltroCategoria({
  categorias,
  selecionada,
  aoMudar,
}: {
  categorias: CategoriaCatalogo[]
  selecionada: string
  aoMudar: (id: string) => void
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-ink/45">Categoria</p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => aoMudar('')}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            !selecionada
              ? 'bg-ink text-white'
              : 'border border-ink/15 bg-white text-ink/55 hover:border-teal hover:text-teal'
          }`}
        >
          Todos
        </button>
        {categorias.map((categoria) => (
          <button
            key={categoria.id}
            onClick={() => aoMudar(categoria.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              selecionada === categoria.id
                ? 'bg-teal text-white'
                : 'border border-ink/15 bg-white text-ink/55 hover:border-teal hover:text-teal'
            }`}
          >
            {categoria.nome}
          </button>
        ))}
      </div>
    </div>
  )
}
