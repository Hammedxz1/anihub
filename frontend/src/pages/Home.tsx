import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { searchMangaApi } from '../api/manga'
import { HeroCarousel } from '../components/home/HeroCarousel'
import { HorizontalScroll } from '../components/home/HorizontalScroll'
import { GenreGrid } from '../components/home/GenreGrid'
import { ContinueReading } from '../components/home/ContinueReading'
import { MangaCard } from '../components/manga/MangaCard'
import { MangaCardSkeleton } from '../components/manga/MangaCardSkeleton'

export default function Home() {
  const { isAuthenticated } = useAuth()

  const trending = useQuery({
    queryKey: ['home', 'trending'],
    queryFn: () => searchMangaApi({ sort: 'rating', limit: 20 }),
    staleTime: 5 * 60 * 1000,
  })

  const recent = useQuery({
    queryKey: ['home', 'recent'],
    queryFn: () => searchMangaApi({ sort: 'latest', limit: 20 }),
    staleTime: 60 * 1000,
  })

  return (
    <div className="pb-16 pt-6">
      <HeroCarousel />

      {isAuthenticated && <ContinueReading />}

      <div className="mx-auto max-w-7xl">
        <HorizontalScroll title="Trending This Week" seeAllTo="/library?sort=rating">
          {trending.isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <MangaCardSkeleton key={i} className="w-[160px] md:w-[180px]" />
              ))
            : (trending.data?.data ?? []).map((m) => (
                <MangaCard key={m.id} manga={m} className="w-[160px] md:w-[180px]" />
              ))}
        </HorizontalScroll>

        <HorizontalScroll title="New Chapters" seeAllTo="/library?sort=latest">
          {recent.isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <MangaCardSkeleton key={i} className="w-[160px] md:w-[180px]" />
              ))
            : (recent.data?.data ?? []).map((m) => (
                <MangaCard key={m.id} manga={m} className="w-[160px] md:w-[180px]" />
              ))}
        </HorizontalScroll>
      </div>

      <GenreGrid />
    </div>
  )
}
