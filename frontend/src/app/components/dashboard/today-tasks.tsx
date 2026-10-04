import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock3,
} from "lucide-react";

import type { Task } from "@/types/task";

type TodayTasksProps = {
  tasks: Task[];
  onViewAll: () => void;
  onTaskClick: (task: Task) => void;
};

type TaskGroup = {
  label: string;
  tasks: Task[];
};

export default function TodayTasks({
  tasks,
  onViewAll,
  onTaskClick,
}: TodayTasksProps) {
  const groups = groupTasksByDate(tasks);

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <CalendarClock
              size={16}
              className="text-primary"
            />

            <h2 className="font-semibold text-text-primary">
              Today & upcoming
            </h2>
          </div>

          <p className="mt-1 text-xs text-text-muted">
            Your scheduled tasks from today onward.
          </p>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="
            inline-flex items-center gap-1.5
            text-xs font-medium
            text-primary
            transition
            hover:text-primary-hover
          "
        >
          View all
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Content */}
      {groups.length === 0 ? (
        <div className="px-5 py-10 text-center sm:px-6">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarClock size={18} />
          </div>

          <p className="mt-3 text-sm font-medium text-text-primary">
            Nothing scheduled
          </p>

          <p className="mt-1 text-xs text-text-muted">
            You have no tasks due today or later.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {groups.map((group) => (
            <div key={group.label}>
              {/* Group label */}
              <div className="bg-surface-elevated/50 px-5 py-2 sm:px-6">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  {group.label}
                </p>
              </div>

              {/* Tasks */}
              <div className="divide-y divide-border">
                {group.tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onClick={() => onTaskClick(task)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function TaskItem({
  task,
  onClick,
}: {
  task: Task;
  onClick: () => void;
}) {
  const completed = task.status === "completed";

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
      <div
        className={`
          flex h-8 w-8 shrink-0
          items-center justify-center
          rounded-full
          transition
          ${
            completed
              ? "bg-success/10 text-success"
              : "bg-primary/10 text-primary"
          }
        `}
      >
        {completed ? (
          <CheckCircle2 size={16} />
        ) : (
          <Circle size={16} />
        )}
      </div>

      {/* Task information */}
      <div className="min-w-0 flex-1">
        <p
          className={`
            truncate text-sm font-medium
            transition
            group-hover:text-primary
            ${
              completed
                ? "text-text-muted line-through"
                : "text-text-primary"
            }
          `}
        >
          {task.title}
        </p>

        <div className="mt-1 flex items-center gap-2">
          {task.due_date && (
            <>
              <Clock3
                size={12}
                className="shrink-0 text-text-muted"
              />

              <span className="text-xs text-text-muted">
                {formatDueDate(task.due_date)}
              </span>
            </>
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
          text-text-muted
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

function groupTasksByDate(tasks: Task[]): TaskGroup[] {
  const today: Task[] = [];
  const tomorrow: Task[] = [];
  const upcoming: Task[] = [];

  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const dayAfterTomorrow = new Date(todayStart);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  for (const task of tasks) {
    if (!task.due_date) {
      continue;
    }

    const dueDate = new Date(task.due_date);

    if (Number.isNaN(dueDate.getTime())) {
      continue;
    }

    if (dueDate < tomorrowStart) {
      today.push(task);
    } else if (dueDate < dayAfterTomorrow) {
      tomorrow.push(task);
    } else {
      upcoming.push(task);
    }
  }

  const groups: TaskGroup[] = [];

  if (today.length > 0) {
    groups.push({
      label: "Today",
      tasks: today,
    });
  }

  if (tomorrow.length > 0) {
    groups.push({
      label: "Tomorrow",
      tasks: tomorrow,
    });
  }

  if (upcoming.length > 0) {
    groups.push({
      label: "Upcoming",
      tasks: upcoming,
    });
  }

  return groups;
}

function formatDueDate(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const dayAfterTomorrow = new Date(todayStart);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  if (date >= todayStart && date < tomorrowStart) {
    return `Due ${formatTime(date)}`;
  }

  if (date >= tomorrowStart && date < dayAfterTomorrow) {
    return `Tomorrow · ${formatTime(date)}`;
  }

  const sameYear =
    date.getFullYear() === now.getFullYear();

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}
