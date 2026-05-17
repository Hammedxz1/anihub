import { apiClient } from './client'

export type LibraryStatus = 'reading' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_read'

export interface LibraryItem {
  id: string
  userId: string
  mangaId: string
  mangaTitle: string
  coverUrl: string | null
  status: LibraryStatus
  chaptersRead: number
  totalChapters: number | null
  addedAt: string
  updatedAt: string
}

export async function listLibraryApi(status?: LibraryStatus): Promise<LibraryItem[]> {
  const { data } = await apiClient.get<LibraryItem[]>('/library', {
    params: status ? { status } : undefined,
  })
  return data
}

export async function addToLibraryApi(item: {
  mangaId: string
  mangaTitle: string
  coverUrl?: string | null
  status?: LibraryStatus
  totalChapters?: number
}): Promise<LibraryItem> {
  const { data } = await apiClient.post<LibraryItem>('/library', item)
  return data
}

export async function updateLibraryApi(
  mangaId: string,
  updates: { status?: LibraryStatus; chaptersRead?: number; totalChapters?: number },
): Promise<LibraryItem> {
  const { data } = await apiClient.patch<LibraryItem>(`/library/${mangaId}`, updates)
  return data
}

export async function removeFromLibraryApi(mangaId: string): Promise<void> {
  await apiClient.delete(`/library/${mangaId}`)
}
