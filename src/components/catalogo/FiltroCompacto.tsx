import type { CategoriaCatalogo, GrupoCatalogo } from '../../types/catalogo'

interface FiltroCompactoProps {
  categorias: CategoriaCatalogo[]
  grupos: GrupoCatalogo[]
  categoriaSelecionada: string
  grupoSelecionado: string
  aoMudarCategoria: (id: string) => void
  aoMudarGrupo: (id: string) => void
  isCarregando: boolean
}

export function FiltroCompacto({
  categorias,
  grupos,
  categoriaSelecionada,
  grupoSelecionado,
  aoMudarCategoria,
  aoMudarGrupo,
  isCarregando,
}: FiltroCompactoProps) {
  return (
    <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm md:space-y-0 md:flex md:items-end md:gap-6">
      {/* Categoria */}
      <div className="flex-1">
        <label htmlFor="categoria-select" className="mb-2 block text-sm font-semibold uppercase tracking-widest text-ink/45">
          Categoria
        </label>
        <select
          id="categoria-select"
          value={categoriaSelecionada}
          onChange={(e) => aoMudarCategoria(e.target.value)}
          disabled={isCarregando || categorias.length === 0}
          className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm font-medium text-ink outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/20 disabled:opacity-50"
        >
          <option value="">Todos</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Grupo */}
      <div className="flex-1">
        <label htmlFor="grupo-select" className="mb-2 block text-sm font-semibold uppercase tracking-widest text-ink/45">
          Grupo
        </label>
        <select
          id="grupo-select"
          value={grupoSelecionado}
          onChange={(e) => aoMudarGrupo(e.target.value)}
          disabled={isCarregando || grupos.length === 0}
          className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm font-medium text-ink outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/20 disabled:opacity-50"
        >
          <option value="">Todos</option>
          {grupos.map((grupo) => (
            <option key={grupo.id} value={grupo.id}>
              {grupo.nome}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
