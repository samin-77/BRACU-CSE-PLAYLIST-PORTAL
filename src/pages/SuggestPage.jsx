import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { useMemo, useState } from 'react'
import { db, firebaseReady } from '../lib/firebase.js'
import { COURSES } from '../data/courses.js'
import { validateSuggestion } from '../lib/validators.js'
import { useAuth } from '../state/AuthContext.jsx'

const SUGGESTIONS_COLLECTION = 'playlistSuggestions'

export function SuggestPage() {
  const { user } = useAuth()

  const courses = useMemo(() => {
    return COURSES.map((c) => c.code).sort((a, b) => a.localeCompare(b))
  }, [])

  const courseTitleByCode = useMemo(() => {
    const map = new Map()
    for (const c of COURSES) map.set(c.code, c.title)
    return map
  }, [])

  const [values, setValues] = useState({
    course: courses[0] ?? '',
    playlistUrl: '',
    facultyInitials: '',
    facultyName: '',
    comments: '',
  })
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [success, setSuccess] = useState(false)

  const errors = useMemo(() => validateSuggestion(values), [values])
  const canSubmit = Object.keys(errors).length === 0 && !submitting

  async function submit() {
    setSuccess(false)
    setSubmitError(null)
    setSubmitting(true)
    try {
      if (!firebaseReady || !db) throw new Error('Firestore is not configured.')
      await addDoc(collection(db, SUGGESTIONS_COLLECTION), {
        ...values,
        createdAt: serverTimestamp(),
        status: 'pending',
        submittedBy: {
          uid: user.uid,
          name: user.displayName ?? null,
          email: user.email ?? null,
        },
      })
      setSuccess(true)
      setValues((v) => ({
        ...v,
        playlistUrl: '',
        facultyInitials: '',
        facultyName: '',
        comments: '',
      }))
      setTouched({})
    } catch (e) {
      setSubmitError(e?.message || 'Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function fieldProps(name) {
    return {
      value: values[name],
      onChange: (e) => setValues((v) => ({ ...v, [name]: e.target.value })),
      onBlur: () => setTouched((t) => ({ ...t, [name]: true })),
    }
  }

  function showError(name) {
    return Boolean(touched[name] && errors[name])
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="text-lg font-semibold">Submit a playlist suggestion</div>
        <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Missing a playlist? Submit it here—an admin can review and add it to the dashboard later.
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        {!firebaseReady ? (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            Firestore is not configured yet. Add your Firebase keys in <code className="font-mono">.env</code>{' '}
            to enable submissions.
          </div>
        ) : null}
        {success ? (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
            Suggestion submitted. Thanks!
          </div>
        ) : null}
        {submitError ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
            {submitError}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <div className="text-sm font-medium">Course</div>
            <select
              {...fieldProps('course')}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            >
              {courses.map((c) => (
                <option key={c} value={c}>
                  {c} — {courseTitleByCode.get(c) ?? ''}
                </option>
              ))}
            </select>
            {showError('course') ? (
              <div className="mt-1 text-xs text-rose-600">{errors.course}</div>
            ) : null}
          </label>

          <label className="block md:col-span-2">
            <div className="text-sm font-medium">Playlist link (YouTube)</div>
            <input
              {...fieldProps('playlistUrl')}
              placeholder="https://www.youtube.com/watch?v=...&list=..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />
            {showError('playlistUrl') ? (
              <div className="mt-1 text-xs text-rose-600">{errors.playlistUrl}</div>
            ) : null}
          </label>

          <label className="block">
            <div className="text-sm font-medium">Faculty initials</div>
            <input
              {...fieldProps('facultyInitials')}
              placeholder="e.g. MUNR"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />
            {showError('facultyInitials') ? (
              <div className="mt-1 text-xs text-rose-600">{errors.facultyInitials}</div>
            ) : null}
          </label>

          <label className="block">
            <div className="text-sm font-medium">Faculty full name</div>
            <input
              {...fieldProps('facultyName')}
              placeholder="e.g. A B M Muntasir Rahman"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />
            {showError('facultyName') ? (
              <div className="mt-1 text-xs text-rose-600">{errors.facultyName}</div>
            ) : null}
          </label>

          <label className="block md:col-span-2">
            <div className="text-sm font-medium">Comments (optional)</div>
            <textarea
              {...fieldProps('comments')}
              rows={4}
              placeholder="Anything helpful (e.g., semester, topics covered, missing chapters)…"
              className="mt-1 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-600 dark:text-slate-400">
            Submitting as <span className="font-medium">{user?.email}</span>
          </div>

          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => {
              setTouched({
                course: true,
                playlistUrl: true,
                facultyInitials: true,
                facultyName: true,
              })
              if (Object.keys(errors).length > 0) return
              submit()
            }}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit suggestion'}
          </button>
        </div>
      </div>
    </div>
  )
}

