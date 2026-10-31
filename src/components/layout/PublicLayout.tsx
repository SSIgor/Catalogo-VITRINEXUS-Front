import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ShoppingBag, Store } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { obterEmpresaCatalogo } from '../../api/catalogo'
import { getNomeCatalogo, resolveLogoCatalogoUrl, shouldShowLogo } from '../../utils/identidadeCatalogo'

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const currentSlug = location.pathname.match(/^\/catalogo\/([^/]+)/)?.[1]
  const { itemCount } = useCart()
  const company = useQuery({
    queryKey: ['catalogo', currentSlug, 'empresa'],
    queryFn: () => obterEmpresaCatalogo(currentSlug),
    enabled: Boolean(currentSlug),
  })
  const logoUrl = resolveLogoCatalogoUrl(company.data?.logoUrl)
  const [imageFailed, setImageFailed] = useState(false)
  useEffect(() => setImageFailed(false), [logoUrl])
  const showLogo = shouldShowLogo(logoUrl, imageFailed)
  const catalogName = getNomeCatalogo(company.data?.nomeFantasia)

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {/* Header */}
      <header className="border-b border-ink/10 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <button
            onClick={() => navigate(currentSlug ? `/catalogo/${currentSlug}` : '/login')}
          className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-teal text-white">
              {showLogo
                ? <img src={logoUrl!} alt={`Logo de ${catalogName}`} onError={() => setImageFailed(true)} className="h-full w-full object-contain" />
                : <Store size={26} />}
            </div>
            <div className="min-w-0">
              <p className="max-w-[48vw] truncate text-left font-display text-lg font-bold text-ink sm:max-w-md">{catalogName}</p>
              <p className="text-xs text-ink/50">Catálogo</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate(currentSlug ? `/catalogo/${currentSlug}/carrinho` : '/login')}
            aria-label="Carrinho"
            className="relative inline-flex items-center gap-2 rounded-full bg-paper px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ink/5"
          >
            <span className="relative grid h-9 w-9 place-items-center rounded-full bg-paper text-ink">
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </span>
            <span>Carrinho{itemCount > 0 ? ` (${itemCount})` : ''}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-ink/10 bg-white py-8 text-center">
        <p className="text-sm text-ink/50">© 2026 Catálogo Online. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
