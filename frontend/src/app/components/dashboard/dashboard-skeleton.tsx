export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="h-3 w-20 animate-pulse rounded bg-surface-elevated" />
          <div className="h-8 w-64 animate-pulse rounded bg-surface-elevated" />
          <div className="h-4 w-72 animate-pulse rounded bg-surface-elevated" />
        </div>

        <div className="h-10 w-28 animate-pulse rounded-xl bg-surface-elevated" />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-border bg-surface p-5"
          >
            <div className="h-10 w-10 animate-pulse rounded-xl bg-surface-elevated" />

            <div className="mt-5 space-y-2">
              <div className="h-3 w-20 animate-pulse rounded bg-surface-elevated" />
              <div className="h-7 w-12 animate-pulse rounded bg-surface-elevated" />
              <div className="h-3 w-28 animate-pulse rounded bg-surface-elevated" />
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="h-80 animate-pulse rounded-2xl border border-border bg-surface" />

        <div className="h-80 animate-pulse rounded-2xl border border-border bg-surface" />
      </div>

      {/* Recent content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl border border-border bg-surface" />

        <div className="h-72 animate-pulse rounded-2xl border border-border bg-surface" />
      </div>
    </div>
  );
}
