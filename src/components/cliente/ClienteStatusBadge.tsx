export function ClienteStatusBadge({ ativo }: { ativo: boolean }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-ink/10 text-ink/55'}`}>
    {ativo ? 'Ativo' : 'Inativo'}
  </span>
}
