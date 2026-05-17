import { apiClient } from './client'

export interface Rating {
  id: string
  userId: string
  mangaId: string
  score: number
  createdAt: string
}

export interface RatingSummary {
  ratings: Rating[]
  average: number | null
  count: number
}

export async function getRatingsApi(mangaId: string): Promise<RatingSummary> {
  const { data } = await apiClient.get<RatingSummary>(`/ratings/manga/${mangaId}`)
  return data
}

export async function upsertRatingApi(mangaId: string, score: number): Promise<Rating> {
  const { data } = await apiClient.put<Rating>(`/ratings/manga/${mangaId}`, { score })
  return data
}
