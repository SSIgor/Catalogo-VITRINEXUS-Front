import axios from 'axios'

export function messageForApiError(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback
  if (error.response?.status === 403) return 'Você não possui permissão para realizar esta ação.'
  if (error.response?.status === 404) return 'Venda não encontrada.'
  if (error.response?.status === 409) return 'A venda não pode ser alterada porque seu estado mudou.'
  if (error.response?.status === 422 || error.response?.status === 400) return 'Os dados enviados não são válidos.'
  const data = error.response?.data as { message?: string; title?: string } | string | undefined
  if (typeof data === 'string' && data) return data
  if (data && typeof data === 'object' && (data.message || data.title)) return data.message ?? data.title ?? fallback
  return fallback
}
