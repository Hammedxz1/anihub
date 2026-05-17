import { apiClient } from './client'
import type { AuthResponse, User } from '../types/auth'

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password })
  return data
}

export async function registerRequest(
  email: string,
  username: string,
  password: string,
): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', {
    email,
    username,
    password,
  })
  return data
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post('/auth/logout')
}

export async function fetchMe(): Promise<User> {
  const { data } = await apiClient.get<User>('/users/me')
  return data
}

export async function forgotPasswordRequest(email: string): Promise<void> {
  await apiClient.post('/auth/forgot-password', { email })
}

export async function resetPasswordRequest(token: string, password: string): Promise<void> {
  await apiClient.post('/auth/reset-password', { token, password })
}
