import { apiClient } from './client'
import type { User } from '../types/auth'
import type { LibraryItem, LibraryStatus } from './library'

export interface PublicProfile {
  id: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  favoriteGenres: string[]
  publicProfile: boolean
  socialTwitter: string | null
  socialAnilist: string | null
  socialMal: string | null
  createdAt: string
}

export interface ProfileStats {
  totalManga: number
  chaptersRead: number
  streak: number
  favoriteGenres: string[]
  monthly: Array<{ date: string; count: number }>
  recent: Array<{
    mangaId: string
    mangaTitle: string
    coverUrl: string | null
    status: LibraryStatus
    updatedAt: string
  }>
}

export interface UpdateProfilePayload {
  displayName?: string | null
  bio?: string | null
  favoriteGenres?: string[]
  publicProfile?: boolean
  socialTwitter?: string | null
  socialAnilist?: string | null
  socialMal?: string | null
  avatarUrl?: string | null
}

export async function getProfileByUsernameApi(username: string): Promise<PublicProfile> {
  const { data } = await apiClient.get<PublicProfile>(`/users/${username}`)
  return data
}

export async function getUserLibraryApi(
  username: string,
  status?: LibraryStatus,
): Promise<LibraryItem[]> {
  const { data } = await apiClient.get<LibraryItem[]>(`/users/${username}/library`, {
    params: status ? { status } : undefined,
  })
  return data
}

export async function getUserStatsApi(username: string): Promise<ProfileStats> {
  const { data } = await apiClient.get<ProfileStats>(`/users/${username}/stats`)
  return data
}

export async function updateProfileApi(payload: UpdateProfilePayload): Promise<User> {
  const { data } = await apiClient.patch<User>('/users/me', payload)
  return data
}

export async function uploadAvatarApi(file: File): Promise<{ avatarUrl: string }> {
  const form = new FormData()
  form.append('avatar', file)
  const { data } = await apiClient.post<{ avatarUrl: string }>('/users/me/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function deleteAccountApi(): Promise<void> {
  await apiClient.delete('/users/me')
}
