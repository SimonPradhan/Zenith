"use client";

import { useRef, useState } from "react";
import {
  Calendar,
  ChevronDown,
  Clock3,
  Loader2,
  X,
} from "lucide-react";

import type {
  Task,
  TaskCreate,
  TaskPriority,
  TaskStatus,
} from "@/types/task";

interface TaskModalProps {
  open: boolean;
  task?: Task | null;
  initialStatus?: TaskStatus;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: TaskCreate) => Promise<void>;
}

const priorityOptions: {
  value: TaskPriority;
  label: string;
}[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const statusOptions: {
  value: TaskStatus;
  label: string;
}[] = [
  { value: "pending", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function TaskModal({
  open,
  task,
  initialStatus = "pending",
  loading = false,
  onClose,
  onSubmit,
}: TaskModalProps) {
  if (!open) return null;

  return (
    <TaskModalForm
      key={`${task?.id ?? "new"}-${initialStatus}`}
      task={task}
      initialStatus={initialStatus}
      loading={loading}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

function TaskModalForm({
  task,
  initialStatus,
  loading,
  onClose,
  onSubmit,
}: {
  task?: Task | null;
  initialStatus: TaskStatus;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: TaskCreate) => Promise<void>;
}) {
  const startDateInputRef =
    useRef<HTMLInputElement>(null);

  const dueDateInputRef =
    useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(
    task?.title ?? "",
  );

  const [description, setDescription] = useState(
    task?.description ?? "",
  );

  const [status, setStatus] = useState<TaskStatus>(
    task?.status ?? initialStatus,
  );

  const [priority, setPriority] =
    useState<TaskPriority>(
      task?.priority ?? "medium",
    );

  const [startDate, setStartDate] = useState(() =>
    getDateInputValue(task?.start_date),
  );

  const [dueDate, setDueDate] = useState(() =>
    getDateInputValue(task?.due_date),
  );

  const [estimatedHours, setEstimatedHours] =
    useState(() =>
      getDurationHours(task?.estimated_minutes),
    );

  const [estimatedMinutes, setEstimatedMinutes] =
    useState(() =>
      getDurationMinutes(task?.estimated_minutes),
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

    if (
      startDate &&
      dueDate &&
      new Date(dueDate) < new Date(startDate)
    ) {
      setError(
        "Due date cannot be earlier than the start date.",
      );
      return;
    }

    const hours = Number(estimatedHours) || 0;
    const minutes = Number(estimatedMinutes) || 0;

    if (minutes > 59) {
      setError(
        "Estimated minutes must be between 0 and 59.",
      );
      return;
    }

    const totalEstimatedMinutes =
      hours * 60 + minutes;

    if (totalEstimatedMinutes > 10080) {
      setError(
        "Estimated time cannot exceed 7 days.",
      );
      return;
    }

    setError("");

    try {
      await onSubmit({
        title: trimmedTitle,

        description:
          description.trim() || undefined,

        status,
        priority,

        start_date: startDate
          ? new Date(
              `${startDate}T00:00:00`,
            ).toISOString()
          : undefined,

        due_date: dueDate
          ? new Date(
              `${dueDate}T23:59:59`,
            ).toISOString()
          : undefined,

        estimated_minutes:
          totalEstimatedMinutes > 0
            ? totalEstimatedMinutes
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

  function openStartDatePicker() {
    startDateInputRef.current?.showPicker?.();
    startDateInputRef.current?.focus();
  }

  function openDueDatePicker() {
    dueDateInputRef.current?.showPicker?.();
    dueDateInputRef.current?.focus();
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
      <div className="w-full max-w-lg overflow-hidden rounded-t-2xl border border-border bg-surface shadow-2xl sm:rounded-2xl">
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
          className="max-h-[80vh] space-y-5 overflow-y-auto p-5"
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

          {/* Priority + Status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Priority */}
            <div>
              <label
                htmlFor="task-priority"
                className="mb-2 block text-sm font-medium"
              >
                Priority
              </label>

              <div className="relative">
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target
                        .value as TaskPriority,
                    )
                  }
                  disabled={loading}
                  className="h-11 w-full appearance-none rounded-xl border border-border bg-surface-elevated px-3.5 pr-10 text-sm text-text-primary outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 disabled:opacity-50"
                >
                  {priorityOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="bg-surface text-text-primary"
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="task-status"
                className="mb-2 block text-sm font-medium"
              >
                Status
              </label>

              <div className="relative">
                <select
                  id="task-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target
                        .value as TaskStatus,
                    )
                  }
                  disabled={loading}
                  className="h-11 w-full appearance-none rounded-xl border border-border bg-surface-elevated px-3.5 pr-10 text-sm text-text-primary outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 disabled:opacity-50"
                >
                  {statusOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="bg-surface text-text-primary"
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Start date */}
            <div>
              <label
                htmlFor="task-start-date"
                className="mb-2 block text-sm font-medium"
              >
                Start date
                <span className="ml-1 text-xs font-normal text-text-muted">
                  (optional)
                </span>
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={openStartDatePicker}
                  disabled={loading}
                  className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-lg p-1 text-text-muted transition hover:bg-background hover:text-text-primary disabled:opacity-40"
                  aria-label="Open start date picker"
                >
                  <Calendar size={17} />
                </button>

                <input
                  ref={startDateInputRef}
                  id="task-start-date"
                  type="date"
                  value={startDate}
                  onChange={(event) =>
                    setStartDate(
                      event.target.value,
                    )
                  }
                  disabled={loading}
                  className="h-11 w-full rounded-xl border border-border bg-surface-elevated pl-11 pr-3 text-sm text-text-primary outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
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
                  onClick={openDueDatePicker}
                  disabled={loading}
                  className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-lg p-1 text-text-muted transition hover:bg-background hover:text-text-primary disabled:opacity-40"
                  aria-label="Open due date picker"
                >
                  <Calendar size={17} />
                </button>

                <input
                  ref={dueDateInputRef}
                  id="task-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(
                      event.target.value,
                    )
                  }
                  disabled={loading}
                  className="h-11 w-full rounded-xl border border-border bg-surface-elevated pl-11 pr-3 text-sm text-text-primary outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Estimated time */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Estimated time
              <span className="ml-1 text-xs font-normal text-text-muted">
                (optional)
              </span>
            </label>

            <div className="flex gap-3">
              <div className="relative flex-1">
                <Clock3
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />

                <input
                  type="number"
                  min={0}
                  max={168}
                  value={estimatedHours}
                  onChange={(event) =>
                    setEstimatedHours(
                      event.target.value,
                    )
                  }
                  disabled={loading}
                  placeholder="0"
                  className="h-11 w-full rounded-xl border border-border bg-surface-elevated pl-10 pr-14 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary/60 focus:ring-2 focus:ring-primary/10 disabled:opacity-50"
                />

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">
                  hours
                </span>
              </div>

              <div className="relative flex-1">
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={estimatedMinutes}
                  onChange={(event) =>
                    setEstimatedMinutes(
                      event.target.value,
                    )
                  }
                  disabled={loading}
                  placeholder="0"
                  className="h-11 w-full rounded-xl border border-border bg-surface-elevated px-3.5 pr-16 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary/60 focus:ring-2 focus:ring-primary/10 disabled:opacity-50"
                />

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">
                  minutes
                </span>
              </div>
            </div>

            <p className="mt-1.5 text-xs text-text-muted">
              Example: 2 hours and 30 minutes
            </p>
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

function getDurationHours(
  minutes: number | null | undefined,
): string {
  if (!minutes) return "";

  return String(Math.floor(minutes / 60));
}

function getDurationMinutes(
  minutes: number | null | undefined,
): string {
  if (!minutes) return "";

  return String(minutes % 60);
}
