export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg bg-slate-100 dark:bg-slate-800" />
          <div className="h-4 w-72 rounded-lg bg-slate-100 dark:bg-slate-850" />
        </div>
        <div className="h-10 w-32 rounded-lg bg-slate-100 dark:bg-slate-800" />
      </div>

      {/* Grid Stats Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className="h-28 rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4 flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <div className="h-3.5 w-20 rounded-md bg-slate-100 dark:bg-slate-800" />
              <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="space-y-2">
              <div className="h-6 w-14 rounded-md bg-slate-150 dark:bg-slate-800" />
              <div className="h-2.5 w-24 rounded-md bg-slate-100 dark:bg-slate-850" />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Layout - Recent & Shortcuts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Table Skeleton */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 space-y-4">
          <div className="space-y-2">
            <div className="h-5 w-36 rounded-md bg-slate-150 dark:bg-slate-800" />
            <div className="h-3 w-56 rounded-md bg-slate-100 dark:bg-slate-850" />
          </div>
          <div className="space-y-3 pt-4">
            <div className="h-8 w-full rounded-md bg-slate-50 dark:bg-slate-850/50" />
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="h-11 w-full rounded-md bg-slate-100/50 dark:bg-slate-800/40" />
            ))}
          </div>
        </div>

        {/* Info Box Skeleton */}
        <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 flex flex-col justify-between h-[380px]">
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800" />
            <div className="space-y-2">
              <div className="h-5 w-40 rounded-md bg-slate-150 dark:bg-slate-800" />
              <div className="h-3 w-full rounded-md bg-slate-100 dark:bg-slate-850" />
              <div className="h-3 w-5/6 rounded-md bg-slate-100 dark:bg-slate-850" />
            </div>
          </div>
          <div className="rounded-lg bg-slate-50/50 dark:bg-slate-900/40 p-4 space-y-3">
            <div className="h-3 w-16 rounded-md bg-slate-150 dark:bg-slate-800" />
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-36 rounded-md bg-slate-100 dark:bg-slate-850" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-40 rounded-md bg-slate-100 dark:bg-slate-850" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
