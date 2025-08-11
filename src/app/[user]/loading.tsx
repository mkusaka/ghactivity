export default function Loading() {
  return (
    <main className="min-h-dvh bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-5xl p-6">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg mt-2" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
          </div>

          {/* Stats cards skeleton */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                  <div>
                    <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-5 w-12 bg-slate-200 dark:bg-slate-800 rounded mt-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filter skeleton */}
          <div className="mt-6 p-4 rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm">
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
              ))}
            </div>
          </div>

          {/* Timeline skeleton */}
          <div className="mt-6 space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-3" />
                <div className="space-y-4 pl-9">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex gap-3">
                      <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded-full flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                        <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}