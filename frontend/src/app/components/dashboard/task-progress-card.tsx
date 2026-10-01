import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Target,
  TrendingUp,
} from "lucide-react";

type TaskProgressCardProps = {
  totalTasks: number;
  pendingCount: number;
  completedCount: number;
  completionRate: number;
  onViewTasks: () => void;
};

export default function TaskProgressCard({
  totalTasks,
  pendingCount,
  completedCount,
  completionRate,
  onViewTasks,
}: TaskProgressCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 sm:p-6">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Target size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-text-primary">
                Task progress
              </h2>

              <p className="mt-1 text-xs text-text-muted">
                Track your overall completion.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full bg-primary/10 px-3 py-1.5">
            <TrendingUp
              size={13}
              className="text-primary"
            />

            <span className="text-xs font-semibold text-primary">
              {completionRate}% complete
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-7">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">
              Overall progress
            </span>

            <span className="text-xs text-text-muted">
              {completedCount} of {totalTasks}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-surface-elevated">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{
                width: `${completionRate}%`,
              }}
            />
          </div>
        </div>

        {/* Breakdown */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <ProgressStat
            icon={CheckCircle2}
            label="Completed"
            value={completedCount}
            tone="success"
          />

          <ProgressStat
            icon={Circle}
            label="Pending"
            value={pendingCount}
            tone="primary"
          />
        </div>

        {/* Footer */}
        <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-muted">
            {getProgressMessage(
              totalTasks,
              completionRate,
            )}
          </p>

          <button
            type="button"
            onClick={onViewTasks}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition hover:text-primary-hover"
          >
            Manage tasks
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ProgressStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  tone: "primary" | "success";
}) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-3">
      <div className="flex items-center gap-2">
        <Icon
          size={15}
          className={
            tone === "success"
              ? "text-success"
              : "text-text-muted"
          }
        />

        <span className="text-xs text-text-muted">
          {label}
        </span>
      </div>

      <p className="mt-2 text-lg font-semibold text-text-primary">
        {value}
      </p>
    </div>
  );
}

function getProgressMessage(
  totalTasks: number,
  completionRate: number,
): string {
  if (totalTasks === 0) {
    return "Create your first task to start tracking progress.";
  }

  if (completionRate === 100) {
    return "All tasks completed. Great work!";
  }

  if (completionRate >= 75) {
    return "You're almost there. Keep going.";
  }

  if (completionRate >= 50) {
    return "You're making solid progress.";
  }

  if (completionRate > 0) {
    return "Keep working through your task list.";
  }

  return "Your tasks are ready when you are.";
}
