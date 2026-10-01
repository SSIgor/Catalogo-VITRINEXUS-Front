export interface EnderecoCliente {
  id: string
  clienteId: string
  nomeEndereco: string
  cep: string
  logradouro: string
  numero: string
  complemento?: string | null
  bairro: string
  cidade: string
  estado: string
  referencia?: string | null
  principal: boolean
  ativo: boolean
  dataCriacao?: string
  dataAtualizacao?: string | null
}

export interface Cliente {
  id: string
  empresaId: string
  nome: string
  email?: string | null
  telefone?: string | null
  whatsApp?: string | null
  ativo: boolean
  dataCriacao?: string
  dataAtualizacao?: string | null
  enderecos?: EnderecoCliente[] | null
}
