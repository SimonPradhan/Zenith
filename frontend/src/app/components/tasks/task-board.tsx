"use client";

import { useState } from "react";

import type {
  Task,
  TaskStatus,
} from "@/types/task";

import { TaskBoardColumn } from "./task-board-column";

interface TaskBoardProps {
  tasks: Task[];
  updatingTaskId: string | null;
  onOpen: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onCreateTask: (status: TaskStatus) => void;
  onStatusChange: (
    task: Task,
    status: TaskStatus,
  ) => void;
}

const columns: {
  status: TaskStatus;
  title: string;
}[] = [
  { status: "pending", title: "To do" },
  { status: "in_progress", title: "In progress" },
  { status: "completed", title: "Done" },
  { status: "cancelled", title: "Archived" },
];

export function TaskBoard({
  tasks,
  updatingTaskId,
  onOpen,
  onEdit,
  onDelete,
  onCreateTask,
  onStatusChange,
}: TaskBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  function handleDragStart(task: Task) {
    setDraggedTask(task);
  }

  function handleDragEnd() {
    setDraggedTask(null);
  }

  function handleDrop(status: TaskStatus) {
    if (!draggedTask) return;

    if (draggedTask.status !== status) {
      onStatusChange(draggedTask, status);
    }

    setDraggedTask(null);
  }

  const groupedTasks = columns.reduce((groups, column) => {
    groups[column.status] = tasks.filter((task) => task.status === column.status);
    return groups;
  }, {} as Record<TaskStatus, Task[]>);

  return (
    <div className="retro-task-board overflow-x-auto pb-3 scrollbar-thin" aria-label="Task board">
      <div className="flex min-w-[1200px] gap-4">
        {columns.map((column) => (
          <TaskBoardColumn
            key={column.status}
            status={column.status}
            title={column.title}
            tasks={groupedTasks[column.status]}
            updatingTaskId={updatingTaskId}
            onOpen={onOpen}
            onEdit={onEdit}
            onDelete={onDelete}
            onCreateTask={onCreateTask}
            onDropTask={handleDrop}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            draggedTaskId={draggedTask?.id ?? null}
          />
        ))}
      </div>
    </div>
  );
}
