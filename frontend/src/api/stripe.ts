import { apiClient } from './client'

export async function createCheckoutApi(): Promise<{ url: string }> {
  const { data } = await apiClient.post<{ url: string }>('/stripe/checkout')
  return data
}

export async function createPortalApi(): Promise<{ url: string }> {
  const { data } = await apiClient.post<{ url: string }>('/stripe/portal')
  return data
}
