import { motion } from 'framer-motion'
import { Play, Clock, Sparkles, BookOpen } from 'lucide-react'
import clsx from 'clsx'
import { parseYoutubeUrl, getYoutubeThumbnailUrl } from '../lib/youtube.js'

function isNew(addedAt) {
  if (!addedAt) return false
  const added = new Date(addedAt)
  if (Number.isNaN(added.getTime())) return false
  const days = (Date.now() - added.getTime()) / (1000 * 60 * 60 * 24)
  return days <= 21
}

// Generate a consistent dummy thumbnail based on course code
function getDummyThumbnail(course) {
  const colors = [
    'from-blue-400 to-blue-600',
    'from-purple-400 to-purple-600',
    'from-green-400 to-green-600',
    'from-red-400 to-red-600',
    'from-indigo-400 to-indigo-600',
    'from-pink-400 to-pink-600',
    'from-yellow-400 to-yellow-600',
    'from-teal-400 to-teal-600',
  ]
  
  const hash = course.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const colorIndex = hash % colors.length
  
  return colors[colorIndex]
}

export function PlaylistCard({ item, videoCount }) {
  const parsed = parseYoutubeUrl(item.playlistUrl)
  const thumb = getYoutubeThumbnailUrl({ videoId: parsed?.videoId })
  const showNew = isNew(item.addedAt)

  return (
    <motion.a
      href={item.playlistUrl}
      target="_blank"
      rel="noreferrer"
      className={clsx(
        'group block rounded-2xl border border-white/20 bg-white/40 backdrop-blur-sm p-5 shadow-lg transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-2xl hover:border-white/30 hover:bg-white/60',
        'focus-visible:ring-4 focus-visible:ring-blue-500/30',
        'dark:border-slate-800/20 dark:bg-slate-900/40 dark:hover:border-slate-700/30 dark:hover:bg-slate-900/60',
      )}
      aria-label={`Open ${item.course} playlist by ${item.facultyName}`}
      title="Open playlist in YouTube"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-4">
        <div className="relative h-20 w-36 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
          {thumb ? (
            <>
              <img
                src={thumb}
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="rounded-full bg-white/90 p-2 backdrop-blur-sm">
                  <Play className="w-4 h-4 text-slate-900" />
                </div>
              </motion.div>
            </>
          ) : (
            <div className={`h-full w-full bg-gradient-to-br ${getDummyThumbnail(item.course)} flex items-center justify-center`}>
              <BookOpen className="w-8 h-8 text-white/80" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div
              className="min-w-0 truncate text-[15px] font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-white dark:to-slate-300"
              title={item.title ?? 'Open playlist'}
            >
              {item.title ?? `${item.course} playlist`}
            </div>
            {showNew ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2 py-0.5 text-[11px] font-semibold text-white shadow-lg"
              >
                <Sparkles className="w-3 h-3" />
                New
              </motion.span>
            ) : null}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span
              className={clsx(
                'inline-flex items-center rounded-lg border px-2 py-1 font-mono text-xs font-semibold',
                'border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 dark:border-blue-800 dark:from-blue-900/30 dark:to-blue-800/30 dark:text-blue-300',
              )}
              title="Faculty initials"
            >
              {item.facultyInitials}
            </span>
            <span className="text-slate-600 dark:text-slate-400 text-sm">{item.facultyName}</span>
            {typeof videoCount === 'number' ? (
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-500">
                <Clock className="w-3 h-3" />
                <span className="text-xs">{videoCount} videos</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </motion.a>
  )
}

