import { ShoppingBag, Store } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {/* Header */}
      <header className="border-b border-ink/10 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <button
            onClick={() => navigate('/catalogo/demo')}
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal text-white">
              <Store size={20} />
            </div>
            <div>
              <p className="font-display text-lg font-bold text-ink">Catálogo</p>
              <p className="text-xs text-ink/50">Produtos disponíveis</p>
            </div>
          </button>

          <button
            aria-label="Carrinho"
            className="relative grid h-10 w-10 place-items-center rounded-full bg-paper text-ink transition-colors hover:bg-ink/5"
          >
            <ShoppingBag size={20} />
            <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-coral text-xs font-bold text-white">
              0
            </span>
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
