"use client";

import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Loader2,
  PlayCircle,
} from "lucide-react";

import type {
  Task,
  TaskPriority,
  TaskStatus,
} from "@/types/task";

import { TaskActionsMenu } from "./task-action-menu";
import { formatTaskDueDate } from "@/lib/task-date";

interface TaskRowProps {
  task: Task;
  last: boolean;
  updating?: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleStatus: (task: Task) => void;
}

const priorityConfig: Record<
  TaskPriority,
  {
    label: string;
    className: string;
  }
> = {
  low: {
    label: "Low",
    className:
      "bg-surface-elevated text-text-muted",
  },

  medium: {
    label: "Medium",
    className:
      "bg-primary/10 text-primary",
  },

  high: {
    label: "High",
    className:
      "bg-warning/10 text-warning",
  },

  urgent: {
    label: "Urgent",
    className:
      "bg-error/10 text-error",
  },
};

const statusConfig: Record<
  TaskStatus,
  {
    label: string;
    className: string;
  }
> = {
  pending: {
    label: "To do",
    className:
      "bg-surface-elevated text-text-secondary",
  },

  in_progress: {
    label: "In progress",
    className:
      "bg-primary/10 text-primary",
  },

  completed: {
    label: "Completed",
    className:
      "bg-success/10 text-success",
  },

  cancelled: {
    label: "Cancelled",
    className:
      "bg-error/10 text-error",
  },
};

export function TaskRow({
  task,
  last,
  updating = false,
  onEdit,
  onDelete,
  onToggleStatus,
}: TaskRowProps) {
  const completed =
    task.status === "completed";

  const dueDate = formatTaskDueDate(
    task.due_date,
  );

  const priority =
    priorityConfig[task.priority];

  const status =
    statusConfig[task.status];

  return (
    <div
      className={`
        group flex gap-3 p-4 transition
        hover:bg-surface-elevated/70
        sm:gap-4 sm:p-5
        ${last ? "" : "border-b border-border"}
        ${completed ? "opacity-75" : ""}
      `}
    >
      {/* Status toggle */}
      <button
        type="button"
        disabled={updating}
        onClick={() =>
          onToggleStatus(task)
        }
        className="mt-0.5 shrink-0 rounded-full transition hover:scale-110 disabled:cursor-not-allowed disabled:hover:scale-100"
        aria-label={
          completed
            ? "Mark task as pending"
            : "Mark task as completed"
        }
      >
        {updating ? (
          <Loader2
            size={21}
            className="animate-spin text-primary"
          />
        ) : completed ? (
          <CheckCircle2
            size={21}
            className="text-success"
          />
        ) : task.status === "in_progress" ? (
          <PlayCircle
            size={21}
            className="text-primary"
          />
        ) : (
          <Circle
            size={21}
            className="text-text-muted transition group-hover:text-primary"
          />
        )}
      </button>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3
            className={`
              min-w-0 text-sm font-medium
              ${
                completed
                  ? "text-text-muted line-through"
                  : "text-text-primary"
              }
            `}
          >
            {task.title}
          </h3>
        </div>

        {task.description && (
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-text-muted">
            {task.description}
          </p>
        )}

        {/* Metadata */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {/* Status */}
          <span
            className={`
              rounded-full px-2 py-1
              text-[11px] font-medium
              ${status.className}
            `}
          >
            {status.label}
          </span>

          {/* Priority */}
          <span
            className={`
              rounded-full px-2 py-1
              text-[11px] font-medium
              ${priority.className}
            `}
          >
            {priority.label}
          </span>

          {/* Due date */}
          {dueDate && (
            <span
              className={`
                inline-flex items-center gap-1
                text-xs
                ${
                  dueDate.tone === "overdue"
                    ? "font-medium text-error"
                    : dueDate.tone === "warning"
                      ? "font-medium text-warning"
                      : "text-text-muted"
                }
              `}
            >
              <CalendarDays size={13} />
              {dueDate.label}
            </span>
          )}

          {/* Estimated duration */}
          {task.estimated_minutes &&
            task.estimated_minutes > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                <Clock3 size={13} />
                {formatDuration(
                  task.estimated_minutes,
                )}
              </span>
            )}

          {/* Start date */}
          {task.start_date && (
            <span className="hidden items-center gap-1 text-xs text-text-muted sm:inline-flex">
              <PlayCircle size={13} />
              Starts {formatShortDate(task.start_date)}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <TaskActionsMenu
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}

function formatDuration(
  minutes: number,
): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function formatShortDate(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
    },
  );
}
