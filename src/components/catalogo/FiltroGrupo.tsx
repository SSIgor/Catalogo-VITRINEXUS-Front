import type { GrupoCatalogo } from '../../types/catalogo'

export function FiltroGrupo({
  grupos,
  selecionado,
  aoMudar,
}: {
  grupos: GrupoCatalogo[]
  selecionado: string
  aoMudar: (id: string) => void
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-ink/45">Grupo</p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => aoMudar('')}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            !selecionado
              ? 'bg-ink text-white'
              : 'border border-ink/15 bg-white text-ink/55 hover:border-teal hover:text-teal'
          }`}
        >
          Todos
        </button>
        {grupos.map((grupo) => (
          <button
            key={grupo.id}
            onClick={() => aoMudar(grupo.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              selecionado === grupo.id
                ? 'bg-teal text-white'
                : 'border border-ink/15 bg-white text-ink/55 hover:border-teal hover:text-teal'
            }`}
          >
            {grupo.nome}
          </button>
        ))}
      </div>
    </div>
  )
}
