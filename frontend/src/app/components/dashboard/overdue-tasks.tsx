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
  return (
    <section className="comic-list-panel flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-sm border-2 border-[#28251f] bg-[#fffaf0]">
      {/* Fixed header */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b-2 border-[#28251f]/80 bg-[#efaaa7]/70 px-3 py-3 sm:px-5 sm:py-4">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-[#28251f]/70 bg-[#fffaf0]/70 text-[#28251f]">
            <AlertTriangle size={16} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="comic-heading text-xl text-[#28251f] sm:text-2xl">
                Overdue tasks
              </h2>

              <span className="border border-[#28251f]/50 bg-[#fffaf0] px-2 py-0.5 text-[10px] font-bold text-[#28251f]">
                {tasks.length}
              </span>
            </div>

            <p className="mt-0.5 text-xs text-text-muted">
              Tasks needing your attention
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="comic-action inline-flex shrink-0 items-center gap-1 border-2 border-[#28251f] bg-[#fffaf0] px-2.5 py-1.5 text-xs font-bold text-[#28251f] shadow-[2px_2px_0_#28251f] transition hover:-translate-y-0.5"
        >
          View all
          <ArrowRight size={13} />
        </button>
      </header>

      {/* Scrollable content */}
      {tasks.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-[radial-gradient(#28251f12_1px,transparent_1px)] bg-[length:10px_10px] p-4 text-center">
          <CheckCircle2
            size={22}
            className="text-success"
          />
          <p className="mt-2 text-sm font-medium text-text-primary">
            All caught up!
          </p>
          <p className="mt-1 text-xs text-text-muted">
            No overdue tasks to worry about.
          </p>
        </div>
      ) : (
        <div className="min-h-0 min-w-0 flex-1 divide-y divide-dashed divide-[#28251f]/20 overflow-x-hidden overflow-y-auto overscroll-contain bg-[radial-gradient(#28251f0b_1px,transparent_1px)] bg-[length:10px_10px]">
          {tasks.map((task) => (
            <OverdueTaskItem
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </div>
      )}
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
      className="group flex w-full min-w-0 items-start gap-2.5 border-b border-dashed border-[#28251f]/15 bg-[#fffaf0]/85 px-3 py-3 text-left transition hover:bg-[#efaaa7]/20 sm:items-center sm:gap-3 sm:px-5"
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border-2 border-[#28251f]/40 bg-[#efaaa7]/45 text-[#28251f] sm:mt-0">
        {task.status === "completed" ? (
          <CheckCircle2 size={16} />
        ) : (
          <Clock3 size={16} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="break-words text-sm font-semibold text-[#28251f] transition group-hover:underline [overflow-wrap:anywhere]">
          {task.title}
        </p>

        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          {task.due_date && (
            <span className="text-xs text-error">
              Due {formatOverdueDate(task.due_date)}
            </span>
          )}

          <PriorityLabel priority={task.priority} />
        </div>
      </div>

      <ArrowRight
        size={14}
        className="mt-2 shrink-0 text-error opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100 sm:mt-0 sm:group-hover:opacity-100"
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
    <span className={`shrink-0 text-[11px] font-medium ${styles[priority]}`}>
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
