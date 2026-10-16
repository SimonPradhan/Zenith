"use client";

import {
  CalendarDays,
  Clock3,
  Loader2,
  PlayCircle,
  SquareCheckBig,
  SquareDot,
  SquarePen,
  SquareX,
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
  onOpen: (task: Task) => void;
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
      "border-2 border-[#1c1a16] bg-[#cdb6ea] text-[#1c1a16]",
  },

  medium: {
    label: "Medium",
    className:
      "border-2 border-[#1c1a16] bg-[#f4d64f] text-[#1c1a16]",
  },

  high: {
    label: "High",
    className:
      "border-2 border-[#1c1a16] bg-[#f2a65a] text-[#1c1a16]",
  },

  urgent: {
    label: "Urgent",
    className:
      "border-2 border-[#1c1a16] bg-[#ef6f5f] text-[#1c1a16]",
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
      "border-2 border-[#1c1a16] bg-[#a9c9e8] text-[#1c1a16]",
  },

  in_progress: {
    label: "In progress",
    className:
      "border-2 border-[#1c1a16] bg-[#f4d64f] text-[#1c1a16]",
  },

  completed: {
    label: "Completed",
    className:
      "border-2 border-[#1c1a16] bg-[#b8d9b7] text-[#1c1a16]",
  },

  cancelled: {
    label: "Cancelled",
    className:
      "border-2 border-[#1c1a16] bg-[#efaaa7] text-[#1c1a16]",
  },
};

export function TaskRow({
  task,
  last,
  updating = false,
  onOpen,
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
        comic-task-row group relative flex gap-3 border-b-2 border-dashed border-[var(--comic-ink)]/20 p-4 transition
        hover:-translate-y-px hover:bg-[#fffaf0]
        sm:gap-4 sm:p-5
        ${last ? "border-b-0" : ""}
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
          <SquareCheckBig
            size={21}
            className="text-success"
          />
        ) : task.status === "in_progress" ? (
          <SquarePen
            size={21}
            className="text-primary"
          />
        ) :task.status === "cancelled" ? (
          <SquareX
            size={21}
            className="text-primary"
          />
        ): (
          <SquareDot
            size={21}
            className="text-text-muted transition group-hover:text-primary"
          />
        )}
      </button>

      {/* Main content: click or press Enter to open the detail view */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen(task)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpen(task);
          }
        }}
        aria-label={`Open task: ${task.title}`}
        className="min-w-0 flex-1 cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <div className="flex items-start justify-between gap-3">
          <h3
            className={`
              comic-task-title min-w-0 text-sm font-bold
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
              px-2 py-0.5
              text-[10px] font-black uppercase tracking-wide
              ${status.className}
            `}
          >
            {status.label}
          </span>

          {/* Priority */}
          <span
            className={`
              px-2 py-0.5
              text-[10px] font-black uppercase tracking-wide
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
