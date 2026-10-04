import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import type { Task } from "@/types/task";

type OverdueTasksProps = {
  tasks: Task[];
  onViewAll: () => void;
  onTaskClick: (task: Task) => void;
};

export default function OverdueTasks({
  tasks,
  onViewAll,
  onTaskClick,
}: OverdueTasksProps) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-error/20 bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-error/10 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-error/10 text-error">
            <AlertTriangle size={15} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-text-primary">
                Overdue tasks
              </h2>

              <span className="rounded-full bg-error/10 px-2 py-0.5 text-[10px] font-semibold text-error">
                {tasks.length}
              </span>
            </div>

            <p className="mt-0.5 text-xs text-text-muted">
              Tasks that still need your attention.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="
            inline-flex items-center gap-1.5
            text-xs font-medium
            text-text-muted
            transition
            hover:text-text-primary
          "
        >
          View all
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Tasks */}
      <div className="divide-y divide-border">
        {tasks.map((task) => (
          <OverdueTaskItem
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
          />
        ))}
      </div>
    </section>
  );
}

function OverdueTaskItem({
  task,
  onClick,
}: {
  task: Task;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group flex w-full items-center gap-3
        px-5 py-3.5 text-left
        transition
        hover:bg-surface-elevated
        sm:px-6
      "
    >
      {/* Status */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-error/10 text-error">
        {task.status === "completed" ? (
          <CheckCircle2 size={16} />
        ) : (
          <Clock3 size={16} />
        )}
      </div>

      {/* Task information */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary transition group-hover:text-error">
          {task.title}
        </p>

        <div className="mt-1 flex items-center gap-2">
          {task.due_date && (
            <span className="text-xs text-error">
              Due {formatOverdueDate(task.due_date)}
            </span>
          )}

          <span className="text-border">•</span>

          <PriorityLabel priority={task.priority} />
        </div>
      </div>

      {/* Arrow */}
      <ArrowRight
        size={14}
        className="
          shrink-0
          text-error
          opacity-0
          transition
          group-hover:translate-x-0.5
          group-hover:opacity-100
        "
      />
    </button>
  );
}

function PriorityLabel({
  priority,
}: {
  priority: Task["priority"];
}) {
  const styles: Record<Task["priority"], string> = {
    low: "text-text-muted",
    medium: "text-primary",
    high: "text-warning",
    urgent: "text-error",
  };

  return (
    <span
      className={`text-[11px] font-medium ${styles[priority]}`}
    >
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

function formatOverdueDate(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfDueDate = new Date(date);
  startOfDueDate.setHours(0, 0, 0, 0);

  const difference =
    startOfToday.getTime() - startOfDueDate.getTime();

  const daysOverdue = Math.floor(
    difference / (1000 * 60 * 60 * 24),
  );

  if (daysOverdue === 1) {
    return "Yesterday";
  }

  if (daysOverdue > 1) {
    return `${daysOverdue} days ago`;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
