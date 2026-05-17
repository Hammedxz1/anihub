import { apiClient } from './client'

export interface ReadingProgress {
  id: string
  userId: string
  mangaId: string
  chapterId: string
  pageNumber: number
  updatedAt: string
}

export async function fetchRecentProgress(limit = 4): Promise<ReadingProgress[]> {
  const { data } = await apiClient.get<ReadingProgress[]>('/progress/recent', {
    params: { limit: String(limit) },
  })
  return data
}

export async function getProgressByMangaApi(mangaId: string): Promise<ReadingProgress[]> {
  const { data } = await apiClient.get<ReadingProgress[]>(`/progress/${mangaId}`)
  return data
}

export async function upsertProgressApi(p: {
  mangaId: string
  chapterId: string
  pageNumber: number
}): Promise<ReadingProgress> {
  const { data } = await apiClient.put<ReadingProgress>('/progress', p)
  return data
}
