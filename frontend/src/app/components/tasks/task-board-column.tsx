"use client";

import { useState } from "react";
import { CheckCircle2, CircleDashed, Plus } from "lucide-react";

import type { Task, TaskStatus } from "@/types/task";

import { TaskBoardCard } from "./task-board-card";

interface TaskBoardColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  updatingTaskId: string | null;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onCreateTask: (status: TaskStatus) => void;
  onDropTask: (status: TaskStatus) => void;
  onDragStart: (task: Task) => void;
  onDragEnd: () => void;
  draggedTaskId: string | null;
}

const statusConfig: Record<
  TaskStatus,
  {
    dotClassName: string;
    countClassName: string;
  }
> = {
  pending: {
    dotClassName: "bg-text-muted",
    countClassName: "bg-surface-elevated text-text-secondary",
  },
  in_progress: {
    dotClassName: "bg-primary",
    countClassName: "bg-primary/10 text-primary",
  },
  completed: {
    dotClassName: "bg-success",
    countClassName: "bg-success/10 text-success",
  },
  cancelled: {
    dotClassName: "bg-error",
    countClassName: "bg-error/10 text-error",
  },
};

export function TaskBoardColumn({
  status,
  title,
  tasks,
  updatingTaskId,
  onEdit,
  onDelete,
  onCreateTask,
  onDropTask,
  onDragStart,
  onDragEnd,
  draggedTaskId,
}: TaskBoardColumnProps) {
  const config = statusConfig[status];

  return (
    <ColumnDropZone
      status={status}
      title={title}
      tasks={tasks}
      config={config}
      updatingTaskId={updatingTaskId}
      onEdit={onEdit}
      onDelete={onDelete}
      onCreateTask={onCreateTask}
      onDropTask={onDropTask}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      draggedTaskId={draggedTaskId}
    />
  );
}

function ColumnDropZone({
  status,
  title,
  tasks,
  config,
  updatingTaskId,
  onEdit,
  onDelete,
  onCreateTask,
  onDropTask,
  onDragStart,
  onDragEnd,
  draggedTaskId,
}: {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  config: {
    dotClassName: string;
    countClassName: string;
  };
  updatingTaskId: string | null;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onCreateTask: (status: TaskStatus) => void;
  onDropTask: (status: TaskStatus) => void;
  onDragStart: (task: Task) => void;
  onDragEnd: () => void;
  draggedTaskId: string | null;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    if (event.currentTarget.contains(event.relatedTarget as Node)) {
      return;
    }

    setIsDragOver(false);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(false);
    onDropTask(status);
  }

  return (
    <section
      className={`
        relative
        flex min-h-[520px] min-w-[280px]
        flex-1 flex-col rounded-2xl
        border
        bg-surface/60
        transition-all duration-200
        ${
          isDragOver
            ? "border-primary/60 bg-primary/5 ring-2 ring-primary/10"
            : "border-border"
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragOver && draggedTaskId && (
        <div
          className="
            pointer-events-none absolute inset-x-3 top-14 z-10
            flex items-center justify-center
            rounded-xl border border-dashed
            border-primary/40
            bg-primary/5
            py-3
            text-xs font-medium
            text-primary
          "
        >
          Drop task here
        </div>
      )}
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className={`h-2 w-2 rounded-full ${config.dotClassName}`} />

          <h2 className="text-sm font-medium text-text-primary">{title}</h2>

          <span
            className={`
              rounded-full px-2 py-0.5
              text-[11px] font-medium
              ${config.countClassName}
            `}
          >
            {tasks.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onCreateTask(status)}
          className="
            rounded-lg p-1.5
            text-text-muted
            transition
            hover:bg-surface-elevated
            hover:text-text-primary
          "
          aria-label={`Add task to ${title}`}
        >
          <Plus size={16} />
        </button>
      </header>

      <div className="flex flex-1 flex-col gap-3 p-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={draggedTaskId === task.id ? "opacity-40" : ""}
          >
            <TaskBoardCard
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              updating={updatingTaskId === task.id}
            />
          </div>
        ))}

        {tasks.length === 0 && (
          <button
            type="button"
            onClick={() => onCreateTask(status)}
            className="
              group/empty
              flex min-h-40 flex-1 flex-col
              items-center justify-center
              rounded-xl border border-dashed
              border-border
              bg-transparent
              px-4
              text-center
              transition-all duration-200
              hover:border-primary/30
              hover:bg-primary/5
            "
          >
            <span
              className="
                mb-3 flex h-10 w-10 items-center justify-center
                rounded-xl
                bg-surface-elevated
                text-text-muted
                transition-all duration-200
                group-hover/empty:bg-primary/10
                group-hover/empty:text-primary
              "
            >
              {status === "completed" ? (
                <CheckCircle2 size={18} />
              ) : (
                <CircleDashed size={18} />
              )}
            </span>

            <span className="text-xs font-medium text-text-secondary">
              No {title.toLowerCase()} tasks
            </span>

            <span className="mt-1 text-[11px] text-text-muted">
              Drag a task here or click to create one
            </span>
          </button>
        )}

        {tasks.length > 0 && (
          <button
            type="button"
            onClick={() => onCreateTask(status)}
            className="
              flex items-center justify-center gap-2
              rounded-xl border border-dashed
              border-border py-2.5
              text-xs text-text-muted
              transition
              hover:border-primary/30
              hover:bg-surface-elevated
              hover:text-text-secondary
            "
          >
            <Plus size={14} />
            Add task
          </button>
        )}
      </div>
    </section>
  );
}
