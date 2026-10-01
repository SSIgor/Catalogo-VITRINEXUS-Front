import api from './api'
import type { Cliente, EnderecoCliente } from '../types/cliente'
import type { Venda } from '../types/venda'

export async function listarClientes(): Promise<Cliente[]> {
  const { data } = await api.get<Cliente[]>('/api/clientes')
  return data
}

export async function obterCliente(id: string): Promise<Cliente> {
  const { data } = await api.get<Cliente>(`/api/clientes/${id}`)
  return data
}

export async function listarEnderecosCliente(clienteId: string): Promise<EnderecoCliente[]> {
  const { data } = await api.get<EnderecoCliente[]>(`/api/clientes/${clienteId}/enderecos`)
  return data
}

export async function listarVendasCliente(clienteId: string): Promise<Venda[]> {
  try {
    const { data } = await api.get<Venda[]>(`/api/clientes/${clienteId}/vendas`)
    return data
  } catch (error) {
    // Se o endpoint não existir, retornar array vazio
    return []
  }
}
