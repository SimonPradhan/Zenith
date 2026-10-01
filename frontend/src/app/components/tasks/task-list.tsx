"use client";

import { Loader2 } from "lucide-react";

import type { Task, TaskStatus } from "@/types/task";

import { TaskRow } from "./task-row";
import { TaskListSkeleton } from "./task-list-skeleton";
import { TaskEmptyState } from "./task-empty-state";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  search: string;
  status: TaskStatus | "all";
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleStatus: (task: Task) => void;
  updatingTaskId?: string | null;
}

export function TaskList({
  tasks,
  loading,
  search,
  status,
  updatingTaskId,
  onEdit,
  onDelete,
  onToggleStatus,
}: TaskListProps) {
  // Show skeleton only when there is no existing data.
  if (loading && tasks.length === 0) {
    return <TaskListSkeleton />;
  }

  if (!loading && tasks.length === 0) {
    return (
      <TaskEmptyState
        search={search}
        status={status}
      />
    );
  }

  return (
    <div className="relative">
      {/* Subtle loading overlay while refreshing existing results */}
      {loading && (
        <div className="pointer-events-none absolute inset-0 z-10 bg-surface/20 backdrop-blur-[1px]">
          <div className="sticky top-2 flex justify-center pt-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-secondary shadow-lg">
              <Loader2
                size={13}
                className="animate-spin text-primary"
              />
              Updating...
            </div>
          </div>
        </div>
      )}

      <div
        className={`transition-opacity duration-200 ${
          loading ? "opacity-60" : "opacity-100"
        }`}
      >
        {tasks.map((task, index) => (
          <TaskRow
            key={task.id}
            task={task}
            last={index === tasks.length - 1}
            updating={updatingTaskId === task.id}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
          />
        ))}
      </div>
    </div>
  );
}
