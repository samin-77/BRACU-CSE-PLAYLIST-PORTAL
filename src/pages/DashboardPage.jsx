import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Search, Filter, BookOpen, Users, PlayCircle, Sparkles } from 'lucide-react'
import { PLAYLISTS } from '../data/playlists.js'
import { COURSES } from '../data/courses.js'
import { parseYoutubeUrl } from '../lib/youtube.js'
import { usePlaylistCounts } from '../hooks/usePlaylistCounts.js'
import { PlaylistCard } from '../components/PlaylistCard.jsx'
import { Spinner } from '../components/Spinner.jsx'

function uniqSorted(arr) {
  return Array.from(new Set(arr.filter(Boolean))).sort((a, b) => a.localeCompare(b))
}

export function DashboardPage() {
  const [query, setQuery] = useState('')
  const [courseFilter, setCourseFilter] = useState('All')
  const [facultyFilter, setFacultyFilter] = useState('All')

  const courses = useMemo(() => uniqSorted(COURSES.map((c) => c.code)), [])
  const courseTitleByCode = useMemo(() => {
    const map = new Map()
    for (const c of COURSES) map.set(c.code, c.title)
    return map
  }, [])
  const faculties = useMemo(
    () => uniqSorted(PLAYLISTS.map((p) => `${p.facultyInitials} — ${p.facultyName}`)),
    [],
  )

  const enriched = useMemo(() => {
    return PLAYLISTS.map((p) => {
      const parsed = parseYoutubeUrl(p.playlistUrl)
      return {
        ...p,
        playlistId: parsed?.playlistId ?? null,
        title: `${p.course} — ${p.facultyInitials}`,
        facultyKey: `${p.facultyInitials} — ${p.facultyName}`,
      }
    })
  }, [])

  const playlistIds = useMemo(() => enriched.map((p) => p.playlistId).filter(Boolean), [enriched])
  const { counts, loading: countsLoading, enabled: countsEnabled } = usePlaylistCounts(playlistIds)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return enriched.filter((p) => {
      if (courseFilter !== 'All' && p.course !== courseFilter) return false
      if (facultyFilter !== 'All' && p.facultyKey !== facultyFilter) return false
      if (!q) return true
      return (
        p.course.toLowerCase().includes(q) ||
        (courseTitleByCode.get(p.course) ?? '').toLowerCase().includes(q) ||
        p.facultyInitials.toLowerCase().includes(q) ||
        p.facultyName.toLowerCase().includes(q) ||
        p.playlistUrl.toLowerCase().includes(q)
      )
    })
  }, [enriched, query, courseFilter, facultyFilter, courseTitleByCode])

  const grouped = useMemo(() => {
    const map = new Map()
    for (const p of filtered) {
      if (!map.has(p.course)) map.set(p.course, [])
      map.get(p.course).push(p)
    }
    const out = []
    const q = query.trim().toLowerCase()
    for (const courseCode of courses) {
      if (courseFilter !== 'All' && courseCode !== courseFilter) continue
      const title = (courseTitleByCode.get(courseCode) ?? '').toLowerCase()
      if (q) {
        const courseMatches = courseCode.toLowerCase().includes(q) || title.includes(q)
        if (!courseMatches) {
          const hasPlaylistMatch = (map.get(courseCode) ?? []).length > 0
          if (!hasPlaylistMatch) continue
        }
      }
      out.push([courseCode, map.get(courseCode) ?? []])
    }
    return out
  }, [filtered, courses, courseFilter, query, courseTitleByCode])

  const totalPlaylists = filtered.length
  const totalCourses = grouped.length

  return (
    <div className="space-y-8">
      {/* Header with stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl" />
        <div className="relative border border-white/20 bg-white/40 backdrop-blur-xl rounded-3xl p-6 shadow-xl dark:border-slate-800/20 dark:bg-slate-900/40">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Search by course, faculty, or playlist title/link.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <motion.div
                className="text-center px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalCourses}</div>
                <div className="text-xs text-blue-700 dark:text-blue-300">Courses</div>
              </motion.div>
              <motion.div
                className="text-center px-4 py-2 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalPlaylists}</div>
                <div className="text-xs text-purple-700 dark:text-purple-300">Playlists</div>
              </motion.div>
              {(courseFilter !== 'All' || facultyFilter !== 'All' || query) && (
                <motion.div
                  className="text-center px-4 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{filtered.length}</div>
                  <div className="text-xs text-amber-700 dark:text-amber-300">Filtered</div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Search and filters */}
          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1 lg:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search playlists, courses, or faculty..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/20 bg-white/60 backdrop-blur-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800/20 dark:bg-slate-900/60 dark:text-slate-100"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="appearance-none pl-10 pr-8 py-3 rounded-xl border border-white/20 bg-white/60 backdrop-blur-sm text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800/20 dark:bg-slate-900/60 dark:text-slate-100"
                >
                  <option value="All">All courses</option>
                  {courses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={facultyFilter}
                  onChange={(e) => setFacultyFilter(e.target.value)}
                  className="appearance-none pl-10 pr-8 py-3 rounded-xl border border-white/20 bg-white/60 backdrop-blur-sm text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800/20 dark:bg-slate-900/60 dark:text-slate-100"
                >
                  <option value="All">All faculty</option>
                  {faculties.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              {countsEnabled ? (
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20 dark:border-slate-800/20 dark:bg-slate-900/60">
                  {countsLoading ? <Spinner /> : <PlayCircle className="w-4 h-4 text-blue-500" />}
                  <span className="text-sm text-slate-600 dark:text-slate-400">Video counts</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Playlist grid */}
      {grouped.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border border-dashed border-slate-300/50 bg-white/30 backdrop-blur-sm rounded-3xl p-12 text-center dark:border-slate-700/50 dark:bg-slate-900/30"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No playlists found
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Try adjusting your filters or search terms.
          </p>
          <Link
            to="/suggest"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Submit a suggestion
          </Link>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-6 lg:grid-cols-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {grouped.map(([course, items], index) => (
            <motion.section
              key={course}
              className="space-y-4 border border-white/20 bg-white/40 backdrop-blur-sm rounded-3xl p-6 shadow-xl dark:border-slate-800/20 dark:bg-slate-900/40"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {course}
                  </h2>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {courseTitleByCode.get(course) ?? ''}
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30">
                  <PlayCircle className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {items.length} playlist{items.length === 1 ? '' : 's'}
                  </span>
                </div>
              </div>

              {items.length === 0 ? (
                <div className="border border-dashed border-slate-300/50 bg-white/50 rounded-2xl p-6 text-center dark:border-slate-700/50 dark:bg-slate-900/50">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    No playlists added yet for <span className="font-semibold">{course}</span>
                  </p>
                  <Link
                    to="/suggest"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold shadow hover:shadow-lg transition-all"
                  >
                    Submit a suggestion
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((p) => (
                    <PlaylistCard
                      key={`${p.course}-${p.playlistUrl}`}
                      item={p}
                      videoCount={counts[p.playlistId]}
                    />
                  ))}
                </div>
              )}
            </motion.section>
          ))}
        </motion.div>
      )}
    </div>
  )
}

