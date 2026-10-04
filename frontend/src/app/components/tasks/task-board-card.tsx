"use client";

import { CalendarDays, Clock3, GripVertical } from "lucide-react";

import type { Task, TaskPriority } from "@/types/task";

import { TaskActionsMenu } from "./task-action-menu";
import { formatTaskDueDate } from "@/lib/task-date";

interface TaskBoardCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onDragStart: (task: Task) => void;
  onDragEnd: () => void;
  updating?: boolean;
}

const priorityConfig: Record<
  TaskPriority,
  {
    label: string;
    className: string;
    dotClassName: string;
  }
> = {
  low: {
    label: "Low",
    className: "bg-surface-elevated text-text-muted",
    dotClassName: "bg-text-muted",
  },
  medium: {
    label: "Medium",
    className: "bg-primary/10 text-primary",
    dotClassName: "bg-primary",
  },
  high: {
    label: "High",
    className: "bg-warning/10 text-warning",
    dotClassName: "bg-warning",
  },
  urgent: {
    label: "Urgent",
    className: "bg-error/10 text-error",
    dotClassName: "bg-error",
  },
};

export function TaskBoardCard({
  task,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  updating,
}: TaskBoardCardProps) {
  const priority = priorityConfig[task.priority];
  const dueDate = formatTaskDueDate(task.due_date);

  return (
    <article
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/task-id", task.id);

        onDragStart(task);
      }}
      onDragEnd={onDragEnd}
      onDoubleClick={() => onEdit(task)}
      className="
        group cursor-grab rounded-xl border border-border
        bg-surface p-4
        shadow-sm
        transition
        hover:-translate-y-0.5
        hover:border-primary/30
        hover:bg-surface-elevated
        hover:shadow-md
        active:cursor-grabbing
      "
    >
      <div className="flex items-start gap-2">
        <GripVertical
          size={16}
          className="
            mt-0.5 shrink-0
            text-text-muted/40
            transition
            group-hover:text-text-muted
          "
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-medium leading-5 text-text-primary">
              {task.title}
            </h3>

            <TaskActionsMenu task={task} onEdit={onEdit} onDelete={onDelete} />
          </div>

          {task.description && (
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-text-muted">
              {task.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`
                inline-flex items-center gap-1.5
                rounded-full px-2 py-1
                text-[11px] font-medium
                ${priority.className}
              `}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${priority.dotClassName}`}
              />
              {priority.label}
            </span>

            {dueDate && (
              <span
                className={`
                  inline-flex items-center gap-1
                  text-[11px]
                  ${
                    dueDate.tone === "overdue"
                      ? "font-medium text-error"
                      : dueDate.tone === "warning"
                        ? "font-medium text-warning"
                        : "text-text-muted"
                  }
                `}
              >
                <CalendarDays size={12} />
                {dueDate.label}
              </span>
            )}

            {task.estimated_minutes && task.estimated_minutes > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-text-muted">
                <Clock3 size={12} />
                {formatDuration(task.estimated_minutes)}
              </span>
            )}
          </div>
        </div>
      </div>
      {updating && (
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          Saving...
        </div>
      )}
    </article>
  );
}

function formatDuration(minutes: number): string {
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
