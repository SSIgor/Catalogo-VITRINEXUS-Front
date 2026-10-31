export function getNomeCatalogo(nomeFantasia?: string | null) {
  return nomeFantasia?.trim() || 'Catálogo da empresa'
}

export function resolveLogoCatalogoUrl(
  logoUrl?: string | null,
  apiBaseUrl = import.meta.env.VITE_API_URL,
  isDev = import.meta.env.DEV,
): string | null {
  const value = logoUrl?.trim()
  if (!value) return null
  if (/^https?:\/\//i.test(value)) return value
  if (!value.startsWith('/uploads/produtos/')) return null
  if (isDev || !apiBaseUrl) return value
  return new URL(value, `${apiBaseUrl.replace(/\/+$/, '')}/`).toString()
}

export function shouldShowLogo(logoUrl: string | null, imageFailed: boolean) {
  return Boolean(logoUrl) && !imageFailed
}
