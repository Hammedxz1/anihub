import { apiClient } from './client'

export interface Download {
  id: string
  userId: string
  mangaId: string
  mangaTitle: string
  chapterId: string
  chapterTitle: string
  status: 'pending' | 'completed' | 'failed'
  filePath: string | null
  fileSize: number | null
  createdAt: string
  updatedAt: string
}

export async function listDownloadsApi(): Promise<Download[]> {
  const { data } = await apiClient.get<Download[]>('/downloads')
  return data
}

export async function startDownloadApi(params: {
  mangaId: string
  mangaTitle: string
  chapterId: string
  chapterTitle: string
}): Promise<Download> {
  const { data } = await apiClient.post<Download>('/downloads', params)
  return data
}

export async function deleteDownloadApi(id: string): Promise<void> {
  await apiClient.delete(`/downloads/${id}`)
}
