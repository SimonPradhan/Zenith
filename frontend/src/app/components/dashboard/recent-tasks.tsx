import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock3,
} from "lucide-react";

import type { Task } from "@/types/task";

type RecentTasksProps = {
  tasks: Task[];
  onViewAll: () => void;
};

export default function RecentTasks({
  tasks,
  onViewAll,
}: RecentTasksProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
        <div>
          <h2 className="font-semibold text-text-primary">
            Recent tasks
          </h2>

          <p className="mt-1 text-xs text-text-muted">
            Your latest tasks and their status.
          </p>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition hover:text-primary-hover"
        >
          View all
          <ArrowRight size={13} />
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="px-5 py-10 text-center sm:px-6">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ListTodoIcon />
          </div>

          <p className="mt-3 text-sm font-medium text-text-primary">
            No tasks yet
          </p>

          <p className="mt-1 text-xs text-text-muted">
            Create your first task to get started.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </section>
  );
}

function TaskItem({ task }: { task: Task }) {
  const completed = task.status === "completed";

  return (
    <div className="flex items-center gap-3 px-5 py-4 transition hover:bg-surface-elevated sm:px-6">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          completed
            ? "bg-success/10 text-success"
            : "bg-primary/10 text-primary"
        }`}
      >
        {completed ? (
          <CheckCircle2 size={16} />
        ) : (
          <Clock3 size={16} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-medium ${
            completed
              ? "text-text-muted line-through"
              : "text-text-primary"
          }`}
        >
          {task.title}
        </p>

        <p className="mt-1 text-xs text-text-muted">
          {completed ? "Completed" : "Pending"}
        </p>
      </div>

      <StatusBadge completed={completed} />
    </div>
  );
}

function StatusBadge({
  completed,
}: {
  completed: boolean;
}) {
  return (
    <span
      className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium sm:inline-flex ${
        completed
          ? "bg-success/10 text-success"
          : "bg-primary/10 text-primary"
      }`}
    >
      {completed ? (
        <CheckCircle2 size={12} />
      ) : (
        <Circle size={12} />
      )}

      {completed ? "Completed" : "Pending"}
    </span>
  );
}

function ListTodoIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  );
}
