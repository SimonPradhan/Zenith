export function NoteListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="min-h-[190px] rounded-2xl border border-border bg-surface p-5"
        >
          <div className="h-4 w-2/5 animate-pulse rounded bg-surface-elevated" />

          <div className="mt-5 space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-surface-elevated" />
            <div className="h-3 w-11/12 animate-pulse rounded bg-surface-elevated" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-surface-elevated" />
            <div className="h-3 w-3/5 animate-pulse rounded bg-surface-elevated" />
          </div>

          <div className="mt-8 border-t border-border pt-4">
            <div className="h-3 w-24 animate-pulse rounded bg-surface-elevated" />
          </div>
        </div>
      ))}
    </div>
  );
}
