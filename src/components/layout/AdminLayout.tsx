import { type CSSProperties, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  BarChart3,
  Boxes,
  Building2,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Percent,
  ShoppingBag,
  Tags,
  Users,
  X,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const menu = [
  { label: 'Dashboard', to: 'dashboard', icon: LayoutDashboard },
  { label: 'Produtos', to: 'produtos', icon: Package },
  { label: 'Categorias', to: 'categorias', icon: Tags },
  { label: 'Grupos', to: 'grupos', icon: FolderTree },
  { label: 'Cupons', to: 'cupons', icon: Percent },
  { label: 'Estoque', to: 'estoque', icon: Boxes },
  { label: 'Vendas', to: 'vendas', icon: ShoppingBag },
  { label: 'Clientes', to: 'clientes', icon: Users },
  { label: 'Relatórios', to: 'relatorios', icon: BarChart3 },
]

const SIDEBAR_STORAGE_KEY = 'vitrinexus_sidebar_collapsed'

function getInitialSidebarState() {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(getInitialSidebarState)
  const { usuario, logout, isSuperAdmin } = useAuth()
  const visibleMenu = isSuperAdmin
    ? [...menu, { label: 'Administração da plataforma', to: 'plataforma/empresas/nova', icon: Building2 }]
    : menu
  const sidebarStyle = { '--sidebar-width': collapsed ? '72px' : '260px' } as CSSProperties

  function toggleSidebar() {
    const next = !collapsed
    setCollapsed(next)
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next))
    } catch {
      // A sidebar continua alternável mesmo quando o navegador bloqueia o armazenamento.
    }
  }

  return <div className="flex h-screen h-[100dvh] min-h-0 overflow-hidden bg-paper">
    {mobileOpen && <button aria-label="Fechar menu" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-20 bg-ink/30 lg:hidden" />}

    <aside
      data-collapsed={collapsed}
      style={sidebarStyle}
      className={`fixed inset-y-0 left-0 z-30 flex w-[var(--sidebar-width)] flex-col overflow-x-hidden bg-ink px-4 py-5 text-white transition-[width,transform] duration-300 lg:static lg:inset-auto lg:z-auto lg:h-full lg:shrink-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      <div className={`flex items-center ${collapsed ? 'min-h-[132px] flex-col justify-center gap-1' : 'min-h-12 justify-between px-2'}`}>
        {collapsed
          ? <span aria-label="VITRINEXUS" title="VITRINEXUS" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 font-display text-lg font-bold"><span>V<span className="text-coral">N</span></span></span>
          : <div><p className="font-display text-2xl font-bold tracking-tight">VITRI<span className="text-coral">NEXUS</span></p><p className="mt-1 text-xs text-white/45">painel da empresa</p></div>}

        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMobileOpen(false)}
          title="Fechar menu"
          className="inline-flex rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white lg:hidden"
        >
          <X size={20} />
        </button>

        <button
          type="button"
          aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          aria-pressed={collapsed}
          onClick={toggleSidebar}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          className="inline-flex shrink-0 rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      <nav aria-label="Navegação administrativa" className="mt-8 min-h-0 flex-1 space-y-1 overflow-y-auto">
        {visibleMenu.map(({ label, to, icon: Icon }) => <NavLink
          key={to}
          to={to}
          onClick={() => setMobileOpen(false)}
          title={collapsed ? label : undefined}
          aria-label={label}
          className={({ isActive }) => `flex items-center rounded-xl py-3 text-sm transition ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} ${isActive ? 'bg-teal text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
        >
          <Icon size={18} strokeWidth={1.8} className="shrink-0" />
          {!collapsed && <span>{label}</span>}
        </NavLink>)}
      </nav>

      <div className={`mt-4 border-t border-white/10 pt-4 ${collapsed ? 'flex flex-col items-center' : ''}`}>
        {!collapsed && <div>
          <p className="truncate px-3 text-sm font-medium">{usuario?.nome ?? 'Usuário'}</p>
          <p className="truncate px-3 pt-1 text-xs text-white/45">{usuario?.email}</p>
        </div>}
        {collapsed && <div title={usuario?.nome ?? 'Usuário'} className="mb-2 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-sm font-semibold">{usuario?.nome?.charAt(0).toUpperCase() ?? 'U'}</div>}
        <button
          onClick={logout}
          title={collapsed ? 'Sair' : undefined}
          aria-label="Sair"
          className={`mt-3 flex w-full items-center rounded-xl py-3 text-sm text-white/60 transition hover:bg-white/10 hover:text-white ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'}`}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>

    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <header className="flex h-20 shrink-0 items-center justify-between border-b border-ink/10 bg-white px-5 sm:px-8">
        <button aria-label="Abrir menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-ink hover:bg-paper lg:hidden"><Menu /></button>
        <div className="ml-auto flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-mint font-display font-bold text-teal">{usuario?.nome?.charAt(0).toUpperCase() ?? 'U'}</div>
          <div className="hidden sm:block"><p className="text-sm font-semibold">{usuario?.nome}</p><p className="text-xs text-ink/50">{isSuperAdmin ? 'Superadministrador' : 'Administrador'}</p></div>
        </div>
      </header>
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto max-w-7xl p-5 sm:p-8"><Outlet /></div>
      </main>
      <footer className="flex min-h-11 shrink-0 items-center justify-center border-t border-ink/10 bg-white px-4 text-xs text-ink/45">
        © {new Date().getFullYear()} VITRINEXUS
      </footer>
    </div>
  </div>
}
