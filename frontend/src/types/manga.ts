export type MangaStatus = 'ongoing' | 'completed' | 'hiatus' | 'cancelled'

export interface MangaDexTagAttributes {
  name: Record<string, string>
  description?: Record<string, string>
  group: string
  version: number
}

export interface MangaDexTag {
  id: string
  type: 'tag'
  attributes: MangaDexTagAttributes
}

export interface MangaDexRelationship {
  id: string
  type: string
  attributes?: Record<string, unknown>
}

export interface MangaDexMangaAttributes {
  title: Record<string, string>
  altTitles?: Array<Record<string, string>>
  description?: Record<string, string>
  status: MangaStatus
  year?: number | null
  contentRating?: string
  tags: MangaDexTag[]
  lastChapter?: string | null
  lastVolume?: string | null
  originalLanguage?: string
  publicationDemographic?: string | null
  updatedAt?: string
  createdAt?: string
  latestUploadedChapter?: string
}

export interface MangaDexManga {
  id: string
  type: 'manga'
  attributes: MangaDexMangaAttributes
  relationships: MangaDexRelationship[]
}

export interface MangaListResponse {
  result: 'ok' | 'error'
  response: 'collection'
  data: MangaDexManga[]
  limit: number
  offset: number
  total: number
}

export interface MangaSingleResponse {
  result: 'ok' | 'error'
  response: 'entity'
  data: MangaDexManga
}

export interface MangaSearchParams {
  q?: string
  offset?: number
  limit?: number
  tags?: string[]
  status?: MangaStatus
  sort?:
    | 'popular'
    | 'rating'
    | 'latest'
    | 'newest'
    | 'oldest'
    | 'title_asc'
    | 'title_desc'
    | 'year_desc'
    | 'relevance'
}
