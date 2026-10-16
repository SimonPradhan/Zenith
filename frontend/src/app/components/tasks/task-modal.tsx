"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  if (!open || !portalReady) return null;

  return createPortal(
    <TaskModalForm
      key={`${task?.id ?? "new"}-${initialStatus}`}
      task={task}
      initialStatus={initialStatus}
      loading={loading}
      onClose={onClose}
      onSubmit={onSubmit}
    />,
    document.body,
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
  const today = getTodayInputValue();
  const minimumDueDate = startDate && startDate > today ? startDate : today;

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
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[#211d17]/70 p-0 backdrop-blur-[3px] sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="task-modal-title" className="relative w-full max-w-2xl overflow-hidden border-2 border-[var(--comic-ink)] bg-surface text-text-primary shadow-[7px_7px_0_var(--paper-shadow)] sm:max-h-[92vh] sm:rounded-sm">
        {/* Header */}
        <div className="relative flex items-start justify-between gap-4 border-b-2 border-[var(--comic-ink)] bg-surface-elevated px-5 py-5 sm:px-7">
          <div>
            <h2 id="task-modal-title" className="retro-display text-2xl font-black uppercase leading-tight tracking-tight sm:text-3xl">
              {editing
                ? "Edit task"
                : "Create task"}
            </h2>

            <p className="mt-2 max-w-lg text-sm leading-5 text-text-secondary">
              {editing
                ? "Update the details of your task."
                : "Add a new task to your workspace."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="shrink-0 border-2 border-[var(--comic-ink)] bg-surface px-2 py-2 text-text-primary shadow-[2px_2px_0_var(--comic-ink)] transition hover:-translate-y-0.5 hover:bg-background disabled:opacity-40"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="max-h-[78vh] space-y-6 overflow-y-auto bg-surface p-5 sm:p-7"
        >
          {/* Error */}
          {error && (
            <div className="border-2 border-error bg-error/10 px-4 py-3 text-sm font-semibold text-error shadow-[3px_3px_0_var(--paper-shadow)]">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label
              htmlFor="task-title"
              className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-text-secondary"
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
              className="h-12 w-full rounded-sm border-2 border-[var(--ink-outline)] bg-background px-3.5 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="task-description"
              className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-text-secondary"
            >
              Description
              <span className="ml-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
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
              className="w-full resize-y rounded-sm border-2 border-[var(--ink-outline)] bg-background px-3.5 py-3 text-sm leading-6 text-text-primary outline-none placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
            />
          </div>

          {/* Priority + Status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Priority */}
            <div>
              <label
                htmlFor="task-priority"
                className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-text-secondary"
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
                  className="h-12 w-full appearance-none rounded-sm border-2 border-[var(--ink-outline)] bg-background px-3.5 pr-10 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
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
                className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-text-secondary"
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
                  className="h-12 w-full appearance-none rounded-sm border-2 border-[var(--ink-outline)] bg-background px-3.5 pr-10 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
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
                className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-text-secondary"
              >
                Start date
                <span className="ml-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  (optional)
                </span>
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={openStartDatePicker}
                  disabled={loading}
                  className="absolute left-2 top-1/2 z-10 -translate-y-1/2 border border-[var(--ink-outline)] bg-surface p-1.5 text-text-secondary transition hover:bg-surface-elevated hover:text-text-primary disabled:opacity-40"
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
                  min={!editing ? today : undefined}
                  disabled={loading}
                  className="h-12 w-full rounded-sm border-2 border-[var(--ink-outline)] bg-background pl-12 pr-3 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            {/* Due date */}
            <div>
              <label
                htmlFor="task-due-date"
                className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-text-secondary"
              >
                Due date
                <span className="ml-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  (optional)
                </span>
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={openDueDatePicker}
                  disabled={loading}
                  className="absolute left-2 top-1/2 z-10 -translate-y-1/2 border border-[var(--ink-outline)] bg-surface p-1.5 text-text-secondary transition hover:bg-surface-elevated hover:text-text-primary disabled:opacity-40"
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
                  min={!editing ? minimumDueDate : undefined}
                  disabled={loading}
                  className="h-12 w-full rounded-sm border-2 border-[var(--ink-outline)] bg-background pl-12 pr-3 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Estimated time */}
          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-text-secondary">
              Estimated time
              <span className="ml-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
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
                  className="h-12 w-full rounded-sm border-2 border-[var(--ink-outline)] bg-background pl-10 pr-14 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
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
                  className="h-12 w-full rounded-sm border-2 border-[var(--ink-outline)] bg-background px-3.5 pr-16 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
                />

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">
                  minutes
                </span>
              </div>
            </div>

            <p className="mt-2 border-l-2 border-primary pl-3 text-xs italic text-text-secondary">
              Example: 2 hours and 30 minutes
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t-2 border-[var(--comic-ink)] bg-surface-elevated/60 pt-5 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-11 border-2 border-[var(--comic-ink)] bg-surface px-5 text-sm font-bold text-text-primary shadow-[3px_3px_0_var(--paper-shadow)] transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--paper-shadow)] disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="comic-action inline-flex h-11 items-center justify-center gap-2 border-2 border-[var(--comic-ink)] bg-primary px-5 text-sm font-black uppercase tracking-wide text-white shadow-[3px_3px_0_var(--comic-ink)] transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--comic-ink)] hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
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
function getTodayInputValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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
