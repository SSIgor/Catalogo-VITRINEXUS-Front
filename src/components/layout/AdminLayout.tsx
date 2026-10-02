import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { BarChart3, Boxes, ClipboardList, FolderTree, LayoutDashboard, LogOut, Menu, Package, Percent, ShoppingBag, Tags, Users, X } from 'lucide-react'
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

export function AdminLayout() {
  const [open, setOpen] = useState(false)
  const { usuario, logout } = useAuth()
  return <div className="min-h-screen bg-paper lg:flex">
    {open && <button aria-label="Fechar menu" onClick={() => setOpen(false)} className="fixed inset-0 z-20 bg-ink/30 lg:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col bg-ink px-5 py-6 text-white transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between px-3">
        <div><p className="font-display text-2xl font-bold tracking-tight">nexo<span className="text-coral">.</span></p><p className="mt-1 text-xs text-white/45">painel da empresa</p></div>
        <button aria-label="Fechar menu" onClick={() => setOpen(false)} className="lg:hidden"><X size={20} /></button>
      </div>
      <nav className="mt-12 flex-1 space-y-1">
        {menu.map(({ label, to, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${isActive ? 'bg-teal text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}><Icon size={18} strokeWidth={1.8} />{label}</NavLink>)}
      </nav>
      <div className="border-t border-white/10 pt-5"><p className="truncate px-3 text-sm font-medium">{usuario?.nome ?? 'Usuário'}</p><p className="truncate px-3 pt-1 text-xs text-white/45">{usuario?.email}</p><button onClick={logout} className="mt-5 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/60 hover:bg-white/10 hover:text-white"><LogOut size={18} />Sair</button></div>
    </aside>
    <div className="min-w-0 flex-1"><header className="flex h-20 items-center justify-between border-b border-ink/10 bg-white px-5 sm:px-8"><button aria-label="Abrir menu" onClick={() => setOpen(true)} className="text-ink lg:hidden"><Menu /></button><div className="ml-auto flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-mint font-display font-bold text-teal">{usuario?.nome?.charAt(0).toUpperCase() ?? 'U'}</div><div className="hidden sm:block"><p className="text-sm font-semibold">{usuario?.nome}</p><p className="text-xs text-ink/50">Administrador</p></div></div></header><main className="mx-auto max-w-7xl p-5 sm:p-8"><Outlet /></main></div>
  </div>
}
