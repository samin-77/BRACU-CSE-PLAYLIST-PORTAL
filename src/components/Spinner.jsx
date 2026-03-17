import clsx from 'clsx'

export function Spinner({ className }) {
  return (
    <div
      className={clsx(
        'h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 dark:border-slate-700 dark:border-t-slate-100',
        className,
      )}
      aria-hidden="true"
    />
  )
}

export function FullPageSpinner({ label = 'Loading…' }) {
  return (
    <div className="min-h-[70vh] w-full grid place-items-center px-6">
      <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
        <Spinner className="h-6 w-6" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  )
}

