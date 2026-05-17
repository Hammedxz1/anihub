import { apiClient } from './client'

export interface Comment {
  id: string
  userId: string
  mangaId: string
  content: string
  createdAt: string
  user: {
    username: string
    displayName: string | null
    avatarUrl: string | null
  }
}

export interface CommentsResponse {
  comments: Comment[]
  total: number
  page: number
  limit: number
}

export async function listCommentsApi(
  mangaId: string,
  page = 1,
  limit = 20,
): Promise<CommentsResponse> {
  const { data } = await apiClient.get<CommentsResponse>(`/comments/manga/${mangaId}`, {
    params: { page: String(page), limit: String(limit) },
  })
  return data
}

export async function createCommentApi(mangaId: string, content: string): Promise<Comment> {
  const { data } = await apiClient.post<Comment>(`/comments/manga/${mangaId}`, { content })
  return data
}
