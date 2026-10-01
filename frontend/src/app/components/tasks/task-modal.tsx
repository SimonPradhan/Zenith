"use client";

import { useRef, useState } from "react";
import { Calendar, Loader2, X } from "lucide-react";

import type { Task, TaskCreate } from "@/types/task";

interface TaskModalProps {
  open: boolean;
  task?: Task | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: TaskCreate) => Promise<void>;
}

export function TaskModal({
  open,
  task,
  loading = false,
  onClose,
  onSubmit,
}: TaskModalProps) {
  if (!open) return null;

  return (
    <TaskModalForm
      key={task?.id ?? "new"}
      task={task}
      loading={loading}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

function TaskModalForm({
  task,
  loading,
  onClose,
  onSubmit,
}: {
  task?: Task | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: TaskCreate) => Promise<void>;
}) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(
    task?.title ?? "",
  );

  const [description, setDescription] = useState(
    task?.description ?? "",
  );

  const [dueDate, setDueDate] = useState(() =>
    getDateInputValue(task?.due_date),
  );

  const [error, setError] = useState("");

  const editing = Boolean(task);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError("Task title is required.");
      return;
    }

    if (trimmedTitle.length > 255) {
      setError(
        "Task title must be 255 characters or less.",
      );
      return;
    }

    setError("");

    try {
      await onSubmit({
        title: trimmedTitle,
        description:
          description.trim() || undefined,
        due_date: dueDate
          ? new Date(
              `${dueDate}T23:59:59`,
            ).toISOString()
          : undefined,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save task.",
      );
    }
  }

  function openDatePicker() {
    dateInputRef.current?.showPicker?.();
    dateInputRef.current?.focus();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg rounded-t-2xl border border-border bg-surface shadow-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">
              {editing
                ? "Edit task"
                : "Create task"}
            </h2>

            <p className="mt-1 text-xs text-text-muted">
              {editing
                ? "Update the details of your task."
                : "Add a new task to your workspace."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-text-muted transition hover:bg-surface-elevated hover:text-text-primary disabled:opacity-40"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5"
        >
          {/* Error */}
          {error && (
            <div className="rounded-xl border border-error/20 bg-error/10 px-3 py-2.5 text-sm text-error">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label
              htmlFor="task-title"
              className="mb-2 block text-sm font-medium"
            >
              Title
            </label>

            <input
              id="task-title"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="e.g. Finish authentication flow"
              maxLength={255}
              autoFocus
              disabled={loading}
              className="h-11 w-full rounded-xl border border-border bg-surface-elevated px-3.5 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary/60 focus:ring-2 focus:ring-primary/10 disabled:opacity-50"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="task-description"
              className="mb-2 block text-sm font-medium"
            >
              Description
              <span className="ml-1 text-xs font-normal text-text-muted">
                (optional)
              </span>
            </label>

            <textarea
              id="task-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Add some context about this task..."
              rows={4}
              disabled={loading}
              className="w-full resize-none rounded-xl border border-border bg-surface-elevated px-3.5 py-3 text-sm leading-5 text-text-primary outline-none placeholder:text-text-muted focus:border-primary/60 focus:ring-2 focus:ring-primary/10 disabled:opacity-50"
            />
          </div>

          {/* Due date */}
          <div>
            <label
              htmlFor="task-due-date"
              className="mb-2 block text-sm font-medium"
            >
              Due date
              <span className="ml-1 text-xs font-normal text-text-muted">
                (optional)
              </span>
            </label>

            <div className="relative">
              <button
                type="button"
                onClick={openDatePicker}
                disabled={loading}
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-lg p-1 text-text-muted transition hover:bg-background hover:text-text-primary disabled:opacity-40"
                aria-label="Open due date picker"
              >
                <Calendar size={17} />
              </button>

              <input
                ref={dateInputRef}
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(event) =>
                  setDueDate(event.target.value)
                }
                disabled={loading}
                className="h-11 w-full rounded-xl border border-border bg-surface-elevated pl-11 pr-3 text-sm text-text-primary outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-10 rounded-xl border border-border px-4 text-sm font-medium text-text-secondary transition hover:bg-surface-elevated hover:text-text-primary disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              )}

              {editing
                ? "Save changes"
                : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Converts an API datetime into the value expected
 * by <input type="date">.
 *
 * Example:
 * 2026-10-04T18:15:00.000Z
 *       ↓
 * 2026-10-05
 */
function getDateInputValue(
  value: string | null | undefined,
): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
