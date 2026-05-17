import { useEffect, useState } from 'react'

export type ReadingMode = 'paged' | 'long-strip' | 'webtoon'
export type ReadingDirection = 'ltr' | 'rtl'

export interface ReaderSettings {
  mode: ReadingMode
  direction: ReadingDirection
  brightness: number
}

const KEY = 'mv:readerSettings'

const DEFAULTS: ReaderSettings = {
  mode: 'paged',
  direction: 'ltr',
  brightness: 100,
}

function load(): ReaderSettings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULTS
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<ReaderSettings>) }
  } catch {
    return DEFAULTS
  }
}

export function useReaderSettings(): [ReaderSettings, (patch: Partial<ReaderSettings>) => void] {
  const [settings, setSettings] = useState<ReaderSettings>(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(settings))
  }, [settings])

  function update(patch: Partial<ReaderSettings>) {
    setSettings((s) => ({ ...s, ...patch }))
  }

  return [settings, update]
}
