import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminLayout } from './components/layout/AdminLayout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/admin/Dashboard'
import { Placeholder } from './pages/admin/Placeholder'
import { Catalogo } from './pages/public/Catalogo'
import { ProdutoDetalheCatalogo } from './pages/public/ProdutoDetalheCatalogo'
import { Produtos } from './pages/admin/Produtos'
import { ProdutoEditor } from './pages/admin/ProdutoEditor'
import { Categorias } from './pages/admin/Categorias'
import { CategoriaEditor } from './pages/admin/CategoriaEditor'
import { Grupos } from './pages/admin/Grupos'
import { GrupoEditor } from './pages/admin/GrupoEditor'
import { Estoque } from './pages/admin/Estoque'
import { Vendas } from './pages/admin/Vendas'
import { VendaDetalhePage } from './pages/admin/VendaDetalhePage'
import { Clientes } from './pages/admin/Clientes'
import { ClienteDetalhePage } from './pages/admin/ClienteDetalhePage'

export default function App() {
  return <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/catalogo/:slug" element={<Catalogo />} />
    <Route path="/catalogo/:slug/produto/:id" element={<ProdutoDetalheCatalogo />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="produtos" element={<Produtos />} />
        <Route path="produtos/novo" element={<ProdutoEditor />} />
        <Route path="produtos/:id" element={<ProdutoEditor />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="categorias/nova" element={<CategoriaEditor />} />
        <Route path="categorias/:id" element={<CategoriaEditor />} />
        <Route path="grupos" element={<Grupos />} />
        <Route path="grupos/novo" element={<GrupoEditor />} />
        <Route path="grupos/:id" element={<GrupoEditor />} />
        <Route path="estoque" element={<Estoque />} />
        <Route path="vendas" element={<Vendas />} />
        <Route path="vendas/:id" element={<VendaDetalhePage />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="clientes/:id" element={<ClienteDetalhePage />} />
        <Route path="relatorios" element={<Placeholder title="Relatórios" />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/catalogo/demo" replace />} />
  </Routes>
}
