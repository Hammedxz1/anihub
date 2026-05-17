import { apiClient } from './client'
import type {
  MangaDexManga,
  MangaDexTag,
  MangaListResponse,
  MangaSearchParams,
  MangaSingleResponse,
} from '../types/manga'

interface TagListResponse {
  result: 'ok' | 'error'
  data: MangaDexTag[]
}

export async function searchMangaApi(params: MangaSearchParams = {}): Promise<MangaListResponse> {
  const query: Record<string, string> = {}
  if (params.q) query.q = params.q
  if (params.offset != null) query.offset = String(params.offset)
  if (params.limit != null) query.limit = String(params.limit)
  if (params.tags?.length) query.tags = params.tags.join(',')
  if (params.status) query.status = params.status
  if (params.sort) query.sort = params.sort

  const { data } = await apiClient.get<MangaListResponse>('/manga', { params: query })
  return data
}

export async function getMangaByIdApi(id: string): Promise<MangaDexManga> {
  const { data } = await apiClient.get<MangaSingleResponse>(`/manga/${id}`)
  return data.data
}

export async function getTagsApi(): Promise<MangaDexTag[]> {
  const { data } = await apiClient.get<TagListResponse>('/manga/tags')
  return data.data
}
