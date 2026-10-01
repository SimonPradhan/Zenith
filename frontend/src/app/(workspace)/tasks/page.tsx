"use client";

import { useEffect, useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "@/lib/api/tasks";
import { getToken } from "@/lib/auth";

import { TaskModal } from "@/app/components/tasks/task-modal";
import { TaskList } from "@/app/components/tasks/task-list";

import type {
  Task,
  TaskCreate,
  TaskListResponse,
  TaskStatus,
} from "@/types/task";
import { DeleteTaskDialog } from "@/app/components/tasks/delete-task-dialog";

const PAGE_SIZE = 10;

export default function TasksPage() {
  const router = useRouter();

  const [data, setData] = useState<TaskListResponse | null>(
    null,
  );

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<TaskStatus | "all">(
    "all",
  );

  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(
    null,
  );
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Task | null>(
    null,
  );

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  async function loadTasks(token: string) {
    return getTasks(token, {
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
      search: debouncedSearch.trim() || undefined,
      status: status === "all" ? undefined : status,
    });
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const result = await loadTasks(token);

        if (!cancelled) {
          setData(result);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load tasks",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [page, router, debouncedSearch, status]);

  async function handleToggleStatus(task: Task) {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    const nextStatus: TaskStatus =
      task.status === "completed"
        ? "pending"
        : "completed";

    setUpdatingTaskId(task.id);

    setData((current) => {
      if (!current) return current;

      return {
        ...current,
        items: current.items.map((item) =>
          item.id === task.id
            ? { ...item, status: nextStatus }
            : item,
        ),
      };
    });

    setError("");

    try {
      await updateTask(token, task.id, {
        status: nextStatus,
      });
    } catch (error) {
      setData((current) => {
        if (!current) return current;

        return {
          ...current,
          items: current.items.map((item) =>
            item.id === task.id
              ? { ...item, status: task.status }
              : item,
          ),
        };
      });

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update task",
      );
    } finally {
      setUpdatingTaskId(null);
    }
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(0);
  }

  function handleStatusChange(
    value: TaskStatus | "all",
  ) {
    setStatus(value);
    setPage(0);
  }

  function openCreateModal() {
    setEditingTask(null);
    setModalOpen(true);
  }

  function openEditModal(task: Task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingTask(null);
  }

  async function handleSubmitTask(taskData: TaskCreate) {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setSaving(true);

    try {
      if (editingTask) {
        await updateTask(token, editingTask.id, taskData);
      } else {
        await createTask(token, taskData);
      }

      setModalOpen(false);
      setEditingTask(null);

      const result = await loadTasks(token);

      setData(result);
      setError("");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTask() {
    if (!deleteTarget) return;

    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await deleteTask(token, deleteTarget.id);

      setDeleteTarget(null);

      const result = await getTasks(token, {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        search: search || undefined,
        status:
          status === "all"
            ? undefined
            : status,
      });

      // If the deleted task was the only item on the
      // current page, move back one page.
      if (
        result.items.length === 0 &&
        page > 0
      ) {
        setPage((currentPage) => currentPage - 1);
        return;
      }

      setData(result);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete task",
      );
    } finally {
      setDeleting(false);
    }
  }

  const totalPages = data
    ? Math.ceil(data.total / PAGE_SIZE)
    : 0;

  return (
    <>
      <div className="mx-auto max-w-[1400px] space-y-6">
        {/* Header */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-sm text-text-muted">
              Workspace
            </p>

            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Tasks
            </h1>

            <p className="mt-2 text-sm text-text-secondary">
              Organize your work and keep track of what needs
              to be done.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/10 transition hover:bg-primary-hover"
          >
            <Plus size={17} />
            New task
          </button>
        </section>

        {/* Filters */}
        <section className="rounded-2xl border border-border bg-surface p-3">
          <div className="flex flex-col gap-3 md:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />

              <input
              type="search"
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Search tasks..."
                className="h-10 w-full rounded-xl border border-border bg-surface-elevated pl-10 pr-4 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
              />
            </div>

            {/* Status */}
            <div className="relative">
              <SlidersHorizontal
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />

              <select
                value={status}
                onChange={(event) =>
                  handleStatusChange(
                    event.target.value as
                      | TaskStatus
                      | "all",
                  )
                }
                className="h-10 w-full appearance-none rounded-xl border border-border bg-surface-elevated pl-9 pr-10 text-sm text-text-primary outline-none focus:border-primary/60 md:w-44"
              >
                <option value="all">
                  All statuses
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="completed">
                  Completed
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* Summary */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              {data?.total ?? 0}{" "}
              {data?.total === 1
                ? "task"
                : "tasks"}
            </p>

            <p className="text-xs text-text-muted">
              {status === "all"
                ? "All tasks"
                : `${status} tasks`}

              {search &&
                ` matching "${search}"`}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-error/20 bg-error/10 p-4 text-sm text-error">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          <TaskList
            tasks={data?.items ?? []}
            loading={loading}
            search={search}
            status={status}
            updatingTaskId={updatingTaskId}
            onEdit={openEditModal}
            onDelete={setDeleteTarget}
            onToggleStatus={handleToggleStatus}
          />
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted">
              Page {page + 1} of {totalPages}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() =>
                  setPage(
                    (value) => value - 1,
                  )
                }
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-secondary transition hover:bg-surface-elevated hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  page >= totalPages - 1
                }
                onClick={() =>
                  setPage(
                    (value) => value + 1,
                  )
                }
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-secondary transition hover:bg-surface-elevated hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <TaskModal
        open={modalOpen}
        task={editingTask}
        loading={saving}
        onClose={closeModal}
        onSubmit={handleSubmitTask}
      />

      <DeleteTaskDialog
        task={deleteTarget}
        loading={deleting}
        onClose={() => {
          if (!deleting) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={handleDeleteTask}
      />
    </>
  );
}
