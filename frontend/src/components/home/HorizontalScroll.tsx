import { useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface HorizontalScrollProps {
  title: string
  seeAllTo?: string
  children: ReactNode
}

export function HorizontalScroll({ title, seeAllTo, children }: HorizontalScrollProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  function scrollBy(direction: 1 | -1) {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <section className="mt-12">
      <div className="mb-4 flex items-end justify-between gap-4 px-4 md:px-6">
        <h2 className="font-display text-3xl tracking-wider text-white md:text-4xl">{title}</h2>
        <div className="flex items-center gap-2">
          {seeAllTo && (
            <Link to={seeAllTo} className="text-sm text-primary-300 hover:underline">
              See all
            </Link>
          )}
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-surface-border bg-surface-card text-white transition hover:bg-surface-hover md:flex"
            aria-label="Scroll left"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-surface-border bg-surface-card text-white transition hover:bg-surface-hover md:flex"
            aria-label="Scroll right"
          >
            ›
          </button>
        </div>
      </div>

      <div
        ref={ref}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 md:px-6 [&>*]:flex-shrink-0 [&>*]:snap-start"
      >
        {children}
      </div>
    </section>
  )
}
