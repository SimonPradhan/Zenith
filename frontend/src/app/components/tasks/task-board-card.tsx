"use client";

import { CalendarDays, Clock3, GripVertical } from "lucide-react";

import type { Task, TaskPriority } from "@/types/task";

import { TaskActionsMenu } from "./task-action-menu";
import { formatTaskDueDate } from "@/lib/task-date";

interface TaskBoardCardProps {
  task: Task;
  onOpen: (task: Task) => void;
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
    className: "border-2 border-[#1c1a16] bg-[#cdb6ea] text-[#1c1a16]",
    dotClassName: "bg-[#1c1a16]",
  },
  medium: {
    label: "Medium",
    className: "border-2 border-[#1c1a16] bg-[#f4d64f] text-[#1c1a16]",
    dotClassName: "bg-[#1c1a16]",
  },
  high: {
    label: "High",
    className: "border-2 border-[#1c1a16] bg-[#f2a65a] text-[#1c1a16]",
    dotClassName: "bg-[#1c1a16]",
  },
  urgent: {
    label: "Urgent",
    className: "border-2 border-[#1c1a16] bg-[#ef6f5f] text-[#1c1a16]",
    dotClassName: "bg-[#1c1a16]",
  },
};

export function TaskBoardCard({
  task,
  onOpen,
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
      onClick={() => onOpen(task)}
      className="
        comic-board-card group cursor-grab rounded-sm border-2 border-[#1c1a16]
        bg-surface p-4
        shadow-[3px_3px_0_#1c1a16]
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
            <h3 className="comic-heading line-clamp-2 text-lg uppercase leading-5 text-text-primary">
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
                px-2 py-0.5
                text-[10px] font-black uppercase tracking-wide
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
