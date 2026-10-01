export function TaskListSkeleton() {
  return (
    <div>
      {[1, 2, 3, 4, 5].map(
        (item) => (
          <div
            key={item}
            className="flex gap-4 border-b border-border p-5 last:border-0"
          >
            <div className="h-5 w-5 animate-pulse rounded-full bg-surface-elevated" />

            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 animate-pulse rounded bg-surface-elevated" />

              <div className="h-3 w-2/3 animate-pulse rounded bg-surface-elevated" />

              <div className="h-5 w-16 animate-pulse rounded-full bg-surface-elevated" />
            </div>
          </div>
        ),
      )}
    </div>
  );
}
