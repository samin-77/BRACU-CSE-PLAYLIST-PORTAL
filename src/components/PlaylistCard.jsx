import clsx from 'clsx'
import { parseYoutubeUrl, getYoutubeThumbnailUrl } from '../lib/youtube.js'

function isNew(addedAt) {
  if (!addedAt) return false
  const added = new Date(addedAt)
  if (Number.isNaN(added.getTime())) return false
  const days = (Date.now() - added.getTime()) / (1000 * 60 * 60 * 24)
  return days <= 21
}

export function PlaylistCard({ item, videoCount }) {
  const parsed = parseYoutubeUrl(item.playlistUrl)
  const thumb = getYoutubeThumbnailUrl({ videoId: parsed?.videoId })
  const showNew = isNew(item.addedAt)

  return (
    <a
      href={item.playlistUrl}
      target="_blank"
      rel="noreferrer"
      className={clsx(
        'group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition',
        'hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300',
        'focus-visible:ring-4 focus-visible:ring-blue-500/30',
        'dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700',
      )}
      aria-label={`Open ${item.course} playlist by ${item.facultyName}`}
      title="Open playlist in YouTube"
    >
      <div className="flex items-start gap-4">
        <div className="h-20 w-36 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          {thumb ? (
            <img
              src={thumb}
              alt=""
              className="h-full w-full object-cover transition group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div
              className="min-w-0 truncate text-[15px] font-semibold text-slate-900 dark:text-slate-50"
              title={item.title ?? 'Open playlist'}
            >
              {item.title ?? `${item.course} playlist`}
            </div>
            {showNew ? (
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                New
              </span>
            ) : null}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
            <span
              className={clsx(
                'inline-flex items-center rounded-md border px-2 py-0.5 font-mono',
                'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200',
              )}
              title="Faculty initials"
            >
              {item.facultyInitials}
            </span>
            <span className="truncate">{item.facultyName}</span>
            {typeof videoCount === 'number' ? (
              <span className="text-slate-500 dark:text-slate-500">• {videoCount} videos</span>
            ) : null}
          </div>
        </div>
      </div>
    </a>
  )
}

