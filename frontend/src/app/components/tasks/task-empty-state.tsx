import {
  ListTodo,
} from "lucide-react";

import type { TaskStatus } from "@/types/task";

interface TaskEmptyStateProps {
  search: string;
  status: TaskStatus | "all";
}

export function TaskEmptyState({
  search,
  status,
}: TaskEmptyStateProps) {
  const filtered =
    Boolean(search) || status !== "all";

  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <ListTodo
          size={25}
          className="text-primary"
        />
      </div>

      <h3 className="font-medium">
        {filtered
          ? "No matching tasks"
          : "No tasks yet"}
      </h3>

      <p className="mt-2 max-w-sm text-sm text-text-muted">
        {filtered
          ? "Try changing your search or filter."
          : "Create your first task to start organizing your work."}
      </p>
    </div>
  );
}
