import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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
    // Ensure we show all CSE courses even if they have no playlists yet.
    const out = []
    const q = query.trim().toLowerCase()
    for (const courseCode of courses) {
      if (courseFilter !== 'All' && courseCode !== courseFilter) continue
      const title = (courseTitleByCode.get(courseCode) ?? '').toLowerCase()
      if (q) {
        const courseMatches = courseCode.toLowerCase().includes(q) || title.includes(q)
        if (!courseMatches) {
          // if query exists, also allow matches via playlists (already filtered above)
          const hasPlaylistMatch = (map.get(courseCode) ?? []).length > 0
          if (!hasPlaylistMatch) continue
        }
      }
      out.push([courseCode, map.get(courseCode) ?? []])
    }
    return out
  }, [filtered, courses, courseFilter, query, courseTitleByCode])

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/60">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="text-lg font-semibold">Dashboard</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Search by course, faculty, or playlist title/link.
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="w-full sm:w-72 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full sm:w-40 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="All">All courses</option>
              {courses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={facultyFilter}
              onChange={(e) => setFacultyFilter(e.target.value)}
              className="w-full sm:w-56 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="All">All faculty</option>
              {faculties.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>

            {countsEnabled ? (
              <div className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                {countsLoading ? <Spinner /> : null}
                <span>Video counts</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {grouped.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
          No playlists match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {grouped.map(([course, items]) => (
            <section
              key={course}
              className="space-y-3 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/60"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold tracking-tight">{course}</h2>
                  <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                    {courseTitleByCode.get(course) ?? ''}
                  </div>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {items.length} playlist{items.length === 1 ? '' : 's'}
                </div>
              </div>

              {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                  No playlists added yet for <span className="font-semibold">{course}</span>.{' '}
                  <Link to="/suggest" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
                    Submit a suggestion
                  </Link>
                  .
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {items.map((p) => (
                    <PlaylistCard
                      key={`${p.course}-${p.playlistUrl}`}
                      item={p}
                      videoCount={counts[p.playlistId]}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

