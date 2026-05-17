const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api'

export function proxyUrl(upstream: string): string {
  return `${API_BASE_URL}/reader/proxy?url=${encodeURIComponent(upstream)}`
}
