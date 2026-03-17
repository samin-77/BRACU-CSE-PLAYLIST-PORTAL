import { useEffect, useMemo, useState } from 'react'

/**
 * Optional enhancement:
 * If `VITE_YOUTUBE_API_KEY` is set, we fetch playlist `itemCount` from YouTube Data API.
 */
export function usePlaylistCounts(playlistIds) {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(false)

  const ids = useMemo(() => {
    const uniq = Array.from(new Set((playlistIds ?? []).filter(Boolean)))
    uniq.sort()
    return uniq
  }, [playlistIds])

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!apiKey || ids.length === 0) {
        setCounts({})
        return
      }

      setLoading(true)
      try {
        // YouTube API has an `id` limit per request; 50 is safe.
        const out = {}
        for (let i = 0; i < ids.length; i += 50) {
          const batch = ids.slice(i, i + 50)
          const res = await fetch(
            `https://www.googleapis.com/youtube/v3/playlists?part=contentDetails&id=${batch.join(
              ',',
            )}&key=${apiKey}`,
          )
          if (!res.ok) continue
          const json = await res.json()
          for (const item of json.items ?? []) {
            const id = item.id
            const count = item?.contentDetails?.itemCount
            if (id && typeof count === 'number') out[id] = count
          }
        }
        if (!cancelled) setCounts(out)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [apiKey, ids])

  return { counts, loading, enabled: Boolean(apiKey) }
}

