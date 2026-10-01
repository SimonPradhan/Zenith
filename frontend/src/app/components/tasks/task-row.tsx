"use client";

import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import type { Task } from "@/types/task";
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

  const dueDate = formatTaskDueDate(task.due_date);

  return (
    <div
      className={`
        group flex gap-4 p-4 transition
        hover:bg-surface-elevated sm:p-5
        ${last ? "" : "border-b border-border"}
      `}
    >
      <button
        type="button"
        disabled={updating}
        onClick={() => onToggleStatus(task)}
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
          <CheckCircle2 size={21} className="text-success" />
        ) : (
          <Circle
            size={21}
            className="text-text-muted transition group-hover:text-primary"
          />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <h3
          className={`text-sm font-medium ${
            completed
              ? "text-text-muted line-through"
              : "text-text-primary"
          }`}
        >
          {task.title}
        </h3>

        {task.description && (
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-text-muted">
            {task.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className={`
              rounded-full px-2 py-1 text-[11px] font-medium
              ${
                completed
                  ? "bg-success/10 text-success"
                  : "bg-primary/10 text-primary"
              }
            `}
          >
            {completed
              ? "Completed"
              : "Pending"}
          </span>

          {dueDate && (
            <span
              className={`text-xs ${
                dueDate.tone === "overdue"
                  ? "font-medium text-error"
                  : dueDate.tone === "warning"
                    ? "font-medium text-warning"
                    : "text-text-muted"
              }`}
            >
              {dueDate.label}
            </span>
          )}
        </div>
      </div>

      <TaskActionsMenu
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
