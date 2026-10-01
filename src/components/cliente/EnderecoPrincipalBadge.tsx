import { Star } from 'lucide-react'

export function EnderecoPrincipalBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
      <Star size={12} fill="currentColor" />
      PADRÃO
    </span>
  )
}
