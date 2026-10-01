import type { UseFormRegisterReturn } from 'react-hook-form'
import type { Grupo } from '../../types/grupo'

interface Props { grupos: Grupo[]; registration: UseFormRegisterReturn; className?: string }
export function GrupoSelect({ grupos, registration, className = '' }: Props) {
  return <select {...registration} className={className}><option value="">Selecione um grupo</option>{grupos.filter((grupo) => grupo.ativo).map((grupo) => <option key={grupo.id} value={grupo.id}>{grupo.nome}</option>)}</select>
}
