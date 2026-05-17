export interface MangaDexChapterAttributes {
  volume: string | null
  chapter: string | null
  title: string | null
  translatedLanguage: string
  externalUrl?: string | null
  publishAt: string
  readableAt: string
  createdAt: string
  updatedAt: string
  pages: number
}

export interface MangaDexChapter {
  id: string
  type: 'chapter'
  attributes: MangaDexChapterAttributes
  relationships: Array<{
    id: string
    type: string
    attributes?: { name?: string }
  }>
}

export interface ChapterListResponse {
  result: 'ok' | 'error'
  data: MangaDexChapter[]
  limit: number
  offset: number
  total: number
}

export interface ChapterPagesResponse {
  result?: 'ok' | 'error'
  baseUrl: string
  chapter: {
    hash: string
    data: string[]
    dataSaver: string[]
  }
}
