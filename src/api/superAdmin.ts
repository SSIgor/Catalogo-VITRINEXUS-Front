import api from './api'

export interface EmpresaCadastro {
  nome: string
  nomeFantasia: string | null
  cnpj: string | null
  email: string
  telefone: string | null
  whatsApp: string | null
  logoUrl: string | null
  descricao: string | null
  slug: string
}

export interface PrimeiroAdministradorCadastro {
  nome: string
  email: string
}

export interface CriarEmpresaRequest {
  empresa: EmpresaCadastro
  administrador: PrimeiroAdministradorCadastro
}

export interface CriarEmpresaResponse {
  empresa: {
    id: string
    nome: string
    nomeFantasia: string | null
    cnpj: string | null
    email: string
    slug: string
    ativo: boolean
  }
  administrador: {
    id: string
    nome: string
    email: string
    empresaId: string | null
  }
  senhaTemporaria: string
  aviso: string
}

export async function criarEmpresa(payload: CriarEmpresaRequest): Promise<CriarEmpresaResponse> {
  const { data } = await api.post<CriarEmpresaResponse>('/api/superadmin/empresas', payload)
  return data
}
