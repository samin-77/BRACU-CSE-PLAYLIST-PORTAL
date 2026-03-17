export function parseYoutubeUrl(input) {
  try {
    const url = new URL(input)
    if (!/^(www\.)?youtube\.com$/.test(url.hostname) && url.hostname !== 'youtu.be') return null

    let videoId = null
    let playlistId = null

    if (url.hostname === 'youtu.be') {
      videoId = url.pathname.replace('/', '') || null
    } else {
      videoId = url.searchParams.get('v')
    }

    playlistId = url.searchParams.get('list')

    return { url, videoId, playlistId }
  } catch {
    return null
  }
}

export function isValidYoutubeUrl(input) {
  const parsed = parseYoutubeUrl(input)
  return Boolean(parsed?.url)
}

export function getYoutubeThumbnailUrl({ videoId }) {
  if (!videoId) return null
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`
}

export function getYoutubePlaylistTitleFallback({ playlistId }) {
  if (!playlistId) return 'YouTube Playlist'
  return `Playlist (${playlistId.slice(0, 8)}…)`
}

