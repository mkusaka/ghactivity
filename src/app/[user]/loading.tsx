export default function Loading() {
  return (
    <main className="min-h-dvh bg-canvas text-ink">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="animate-pulse">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="h-8 w-48 bg-line-2 rounded-lg" />
              <div className="h-4 w-36 bg-line-2 rounded-lg mt-2" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-16 bg-line-2 rounded-lg" />
              <div className="h-9 w-20 bg-line-2 rounded-lg" />
              <div className="h-9 w-16 bg-line-2 rounded-lg" />
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-6 rounded-xl border border-line bg-surface overflow-hidden">
            <div className="flex">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex-1 min-w-[80px] px-3 py-4 text-center border-r border-line-2 last:border-r-0">
                  <div className="h-6 w-8 bg-line-2 rounded mx-auto" />
                  <div className="h-3 w-12 bg-line-2 rounded mx-auto mt-2" />
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 px-4 py-3 rounded-xl border border-line bg-surface">
            <div className="flex gap-1.5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-7 w-16 bg-line-2 rounded-full" />
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-6 space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="h-4 w-28 bg-line-2 rounded mb-3" />
                <div className="space-y-5 pl-9">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex gap-3">
                      <div className="w-4 h-4 bg-line-2 rounded-full flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="h-4 w-3/4 bg-line-2 rounded" />
                        <div className="h-3 w-1/2 bg-line-2 rounded mt-1.5" />
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
