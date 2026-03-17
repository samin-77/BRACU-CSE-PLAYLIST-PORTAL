import { useAuth } from '../state/AuthContext.jsx'

export function ProfilePage() {
  const { user } = useAuth()

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="text-lg font-semibold">Profile</div>
        <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Your account details (from Google Sign-In).
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-4">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="h-14 w-14 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-800"
            />
          ) : (
            <div className="h-14 w-14 rounded-2xl bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800" />
          )}
          <div className="min-w-0">
            <div className="truncate text-base font-semibold">{user?.displayName ?? 'Student'}</div>
            <div className="truncate text-sm text-slate-600 dark:text-slate-400">{user?.email}</div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-900/40">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              UID
            </div>
            <div className="mt-1 break-all font-mono text-xs text-slate-800 dark:text-slate-200">
              {user?.uid}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-900/40">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Email verified
            </div>
            <div className="mt-1 text-sm text-slate-800 dark:text-slate-200">
              {user?.emailVerified ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-600 dark:text-slate-400">
          Logout is available from the top-right navigation.
        </div>
      </div>
    </div>
  )
}

