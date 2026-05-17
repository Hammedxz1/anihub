import type { Request, Response } from 'express'

const ALLOWED_HOSTS = [
  'uploads.mangadex.org',
  'mangadex.org',
  'cmdxd98sb0x3yprd.mangadex.network',
]

const CACHE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds

export async function proxyMangaImage(req: Request, res: Response): Promise<void> {
  const imageUrl = req.query.url as string

  if (!imageUrl) {
    res.status(400).json({ error: 'Missing url query parameter' })
    return
  }

  let parsed: URL
  try {
    parsed = new URL(imageUrl)
  } catch {
    res.status(400).json({ error: 'Invalid url' })
    return
  }

  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    res.status(403).json({ error: 'Host not allowed' })
    return
  }

  // Strip any fragment or auth components before forwarding
  const safeUrl = `${parsed.protocol}//${parsed.host}${parsed.pathname}${parsed.search}`

  let upstream: globalThis.Response
  try {
    upstream = await fetch(safeUrl, {
      headers: {
        'User-Agent': 'MangaVerse/1.0 (https://github.com/hammedxz1/anihub)',
        Referer: 'https://mangadex.org',
      },
      signal: AbortSignal.timeout(15_000),
    })
  } catch (err) {
    console.error('[imageProxy] fetch error:', err)
    res.status(502).json({ error: 'Failed to fetch upstream image' })
    return
  }

  if (!upstream.ok) {
    res.status(upstream.status).json({ error: 'Upstream error' })
    return
  }

  const contentType = upstream.headers.get('content-type') ?? 'image/jpeg'
  const contentLength = upstream.headers.get('content-length')

  res.setHeader('Content-Type', contentType)
  res.setHeader('Cache-Control', `public, max-age=${CACHE_MAX_AGE}, immutable`)
  res.setHeader('X-Content-Type-Options', 'nosniff')

  if (contentLength) {
    res.setHeader('Content-Length', contentLength)
  }

  // Stream response body directly to client
  if (upstream.body) {
    const reader = upstream.body.getReader()
    const stream = new ReadableStream({
      start(controller) {
        function pump(): Promise<void> {
          return reader.read().then(({ done, value }) => {
            if (done) {
              controller.close()
              return
            }
            controller.enqueue(value)
            return pump()
          })
        }
        return pump()
      },
    })

    const nodeStream = require('stream').Readable.from(
      (async function* () {
        const reader2 = stream.getReader()
        while (true) {
          const { done, value } = await reader2.read()
          if (done) break
          yield value
        }
      })(),
    )

    nodeStream.pipe(res)
  } else {
    res.end()
  }
}
