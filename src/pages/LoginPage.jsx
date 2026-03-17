import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'

export function LoginPage() {
  const { user, loginWithGoogle, authError } = useAuth()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const from = location.state?.from || '/'

  if (user) return <Navigate to={from} replace />

  return (
    <div className="min-h-[80vh] grid place-items-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="text-xl font-semibold tracking-tight">BRAC CSE Playlist Portal</div>
        <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Sign in with your BRAC GSuite email to access playlists and submit suggestions.
        </div>

        {(error || authError) ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
            {error || authError}
          </div>
        ) : null}

        <button
          type="button"
          disabled={loading}
          onClick={async () => {
            setLoading(true)
            setError(null)
            try {
              await loginWithGoogle()
            } catch (e) {
              setError(e?.message || 'Login failed. Please try again.')
            } finally {
              setLoading(false)
            }
          }}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Continue with Google'}
        </button>

        <div className="mt-4 text-xs text-slate-500 dark:text-slate-500">
          Allowed: <span className="font-mono">@g.bracu.ac.bd</span>
        </div>
      </div>
    </div>
  )
}

