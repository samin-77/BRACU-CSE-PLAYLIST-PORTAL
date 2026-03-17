import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '../state/AuthContext.jsx'
import { useDarkMode } from '../hooks/useDarkMode.js'

function TabLink({ to, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        clsx(
          'px-3 py-2 rounded-lg text-sm font-medium transition',
          isActive
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900',
        )
      }
    >
      {children}
    </NavLink>
  )
}

export function AppShell() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useDarkMode()
  const navigate = useNavigate()

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
        <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-base font-semibold tracking-tight">
                BRACU CSE Playlist Portal
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                by Ishfak Mahbub Samin
              </div>
            </div>
            <button
              type="button"
              onClick={toggle}
              className="sm:hidden inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>

          <nav className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/60 p-1 shadow-sm dark:border-slate-800 dark:bg-slate-950/50">
            <TabLink to="/" end>
              Dashboard
            </TabLink>
            <TabLink to="/suggest">Submit Suggestion</TabLink>
            <TabLink to="/profile">Profile</TabLink>
          </nav>

          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
            <button
              type="button"
              onClick={async () => {
                await logout()
                navigate('/login')
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-10">
        <div className="flex flex-col gap-2 border-t border-slate-200 pt-6 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <div>
            Signed in as <span className="font-medium">{user?.displayName ?? 'Student'}</span> ({user?.email})
          </div>
          <div className="text-slate-500 dark:text-slate-500">
            © 2026 Made with love by <span className="font-medium">Ishfak Mahbub Samin</span>. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

