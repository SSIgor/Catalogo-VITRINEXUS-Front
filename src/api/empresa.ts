import api from './api'

export interface EmpresaConfiguracao {
  id: string
  nome: string
  nomeFantasia: string | null
  cnpj: string | null
  email: string
  telefone: string | null
  whatsApp: string | null
  logoUrl: string | null
  descricao: string | null
  slug: string
  ativo: boolean
  dataCriacao: string
  endereco: string | null
}

export interface EmpresaConfiguracaoUpdate {
  nome: string
  nomeFantasia: string | null
  email: string
  telefone: string | null
  whatsApp: string | null
  slug: string
  endereco: string | null
}

export async function obterMinhaEmpresa(): Promise<EmpresaConfiguracao> {
  const { data } = await api.get<EmpresaConfiguracao>('/api/empresa/me')
  return data
}

export async function atualizarMinhaEmpresa(payload: EmpresaConfiguracaoUpdate): Promise<EmpresaConfiguracao> {
  const { data } = await api.put<EmpresaConfiguracao>('/api/empresa/me', payload)
  return data
}

export async function enviarLogoEmpresa(arquivo: File): Promise<EmpresaConfiguracao> {
  const formData = new FormData()
  formData.append('arquivo', arquivo)
  const { data } = await api.post<EmpresaConfiguracao>('/api/empresa/me/logo', formData)
  return data
}

export async function removerLogoEmpresa(): Promise<EmpresaConfiguracao> {
  const { data } = await api.delete<EmpresaConfiguracao>('/api/empresa/me/logo')
  return data
}
