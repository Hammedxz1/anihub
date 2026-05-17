import { useState } from 'react'

export function Synopsis({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)

  if (!text) return null

  return (
    <div className="mt-6">
      <p
        className={
          expanded
            ? 'whitespace-pre-line text-sm leading-relaxed text-white/80 md:text-base'
            : 'line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-white/80 md:text-base'
        }
      >
        {text}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="mt-1 text-sm font-medium text-primary-300 hover:underline"
      >
        {expanded ? 'Show less' : 'Show more'}
      </button>
    </div>
  )
}
