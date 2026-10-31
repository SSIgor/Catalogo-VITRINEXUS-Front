import type { ReactNode } from 'react'

type StatusBadgeTone = 'success' | 'neutral' | 'warning' | 'danger' | 'info'

const toneClasses: Record<StatusBadgeTone, string> = {
  success: 'bg-emerald-100 text-emerald-700',
  neutral: 'bg-ink/10 text-ink/55',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-rose-100 text-rose-700',
  info: 'bg-sky-100 text-sky-700',
}

export function StatusBadge({ tone, children }: { tone: StatusBadgeTone; children: ReactNode }) {
  return <span className={`inline-flex w-fit max-w-full shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-transparent px-2.5 py-1 text-xs font-semibold leading-4 ${toneClasses[tone]}`}>
    {children}
  </span>
}
