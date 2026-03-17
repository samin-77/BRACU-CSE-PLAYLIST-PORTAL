import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] grid place-items-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="text-2xl font-semibold">404</div>
        <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Page not found.
        </div>
        <Link
          to="/"
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}

