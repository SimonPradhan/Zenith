export function TaskListSkeleton() {
  return (
    <div className="comic-task-skeleton">
      {[1, 2, 3, 4, 5].map(
        (item) => (
          <div
            key={item}
            className="flex gap-4 border-b-2 border-dashed border-[var(--comic-ink)]/15 p-5 last:border-0"
          >
            <div className="h-5 w-5 animate-pulse border border-[var(--comic-ink)]/15 bg-[#e9e0cf]" />

            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 animate-pulse border border-[var(--comic-ink)]/10 bg-[#e9e0cf]" />

              <div className="h-3 w-2/3 animate-pulse border border-[var(--comic-ink)]/10 bg-[#e9e0cf]" />

              <div className="h-5 w-16 animate-pulse border border-[var(--comic-ink)]/15 bg-[#e9e0cf]" />
            </div>
          </div>
        ),
      )}
    </div>
  );
}
