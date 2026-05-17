import { apiClient } from './client'
import type { ChapterListResponse, ChapterPagesResponse } from '../types/chapter'

export async function getChaptersApi(
  mangaId: string,
  options: { limit?: number; offset?: number; lang?: string } = {},
): Promise<ChapterListResponse> {
  const { data } = await apiClient.get<ChapterListResponse>(`/manga/${mangaId}/chapters`, {
    params: {
      limit: String(options.limit ?? 100),
      offset: String(options.offset ?? 0),
      lang: options.lang ?? 'en',
    },
  })
  return data
}

export async function getChapterPagesApi(chapterId: string): Promise<ChapterPagesResponse> {
  const { data } = await apiClient.get<ChapterPagesResponse>(
    `/reader/chapter/${chapterId}/pages`,
  )
  return data
}
