import { apiClient } from './client'

export interface Bookmark {
  id: string
  userId: string
  mangaId: string
  chapterId: string
  pageNumber: number
  note: string | null
  createdAt: string
}

export async function listBookmarksApi(): Promise<Bookmark[]> {
  const { data } = await apiClient.get<Bookmark[]>('/bookmarks')
  return data
}

export async function createBookmarkApi(b: {
  mangaId: string
  chapterId: string
  pageNumber: number
  note?: string
}): Promise<Bookmark> {
  const { data } = await apiClient.post<Bookmark>('/bookmarks', b)
  return data
}

export async function deleteBookmarkApi(id: string): Promise<void> {
  await apiClient.delete(`/bookmarks/${id}`)
}
