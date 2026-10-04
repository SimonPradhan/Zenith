"use client";

import { useEffect, useState } from "react";
import {
  KanbanSquare,
  List,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  createTask,
  deleteTask,
  getTask,
  getTasks,
  updateTask,
} from "@/lib/api/tasks";
import { getToken } from "@/lib/auth";

import { TaskModal } from "@/app/components/tasks/task-modal";
import { TaskList } from "@/app/components/tasks/task-list";
import { DeleteTaskDialog } from "@/app/components/tasks/delete-task-dialog";
import { TaskBoard } from "@/app/components/tasks/task-board";

import type {
  Task,
  TaskCreate,
  TaskListResponse,
  TaskStatus,
} from "@/types/task";

const PAGE_SIZE = 10;
const BOARD_PAGE_SIZE = 100;

const statusOptions: {
  value: TaskStatus | "all";
  label: string;
}[] = [
  {
    value: "all",
    label: "All statuses",
  },
  {
    value: "pending",
    label: "To do",
  },
  {
    value: "in_progress",
    label: "In progress",
  },
  {
    value: "completed",
    label: "Completed",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
];

export default function TasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<TaskListResponse | null>(null);

  const [search, setSearch] = useState(() => {
    return searchParams.get("search") ?? "";
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [status, setStatus] = useState<TaskStatus | "all">("all");

  const [view, setView] = useState<"list" | "board">("list");

  const [page, setPage] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [newTaskStatus, setNewTaskStatus] =
    useState<TaskStatus>("pending");

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(
    null,
  );

  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const [deleting, setDeleting] = useState(false);

  /*
   * Search debounce.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  /*
   * Load tasks.
   */
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
        const currentPageSize =
          view === "board" ? BOARD_PAGE_SIZE : PAGE_SIZE;

        const currentOffset =
          view === "board" ? 0 : page * PAGE_SIZE;

        const result = await getTasks(token, {
          limit: currentPageSize,
          offset: currentOffset,
          search: debouncedSearch.trim() || undefined,
          status: status === "all" ? undefined : status,
        });

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
  }, [page, router, debouncedSearch, status, view]);

  /*
   * Open a specific task from the dashboard.
   *
   * Dashboard links use:
   * /tasks?task=<task-id>
   *
   * We fetch the task directly instead of searching
   * the currently visible page.
   */
  useEffect(() => {
    const taskId = searchParams.get("task");

    if (!taskId) {
      return;
    }

    let cancelled = false;

    async function loadSelectedTask() {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        if (!taskId) {
          return;
        }

        const task = await getTask(token, taskId);

        if (!cancelled) {
          setEditingTask(task);
          setModalOpen(true);

          router.replace("/tasks", {
            scroll: false,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load selected task",
          );

          router.replace("/tasks", {
            scroll: false,
          });
        }
      }
    }

    loadSelectedTask();

    return () => {
      cancelled = true;
    };
  }, [searchParams, router]);

  /*
   * Toggle task status.
   */
  async function handleToggleStatus(task: Task) {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    let nextStatus: TaskStatus;

    switch (task.status) {
      case "pending":
        nextStatus = "in_progress";
        break;

      case "in_progress":
        nextStatus = "completed";
        break;

      case "completed":
        nextStatus = "pending";
        break;

      case "cancelled":
        nextStatus = "pending";
        break;
    }

    setUpdatingTaskId(task.id);

    setData((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        items: current.items.map((item) =>
          item.id === task.id
            ? {
                ...item,
                status: nextStatus,
              }
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
        if (!current) {
          return current;
        }

        return {
          ...current,
          items: current.items.map((item) =>
            item.id === task.id
              ? {
                  ...item,
                  status: task.status,
                }
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

  /*
   * Kanban drag/drop status change.
   */
  async function handleBoardStatusChange(
    task: Task,
    nextStatus: TaskStatus,
  ) {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    if (task.status === nextStatus) {
      return;
    }

    const previousStatus = task.status;

    setUpdatingTaskId(task.id);

    setData((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        items: current.items.map((item) =>
          item.id === task.id
            ? {
                ...item,
                status: nextStatus,
              }
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
        if (!current) {
          return current;
        }

        return {
          ...current,
          items: current.items.map((item) =>
            item.id === task.id
              ? {
                  ...item,
                  status: previousStatus,
                }
              : item,
          ),
        };
      });

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update task status",
      );
    } finally {
      setUpdatingTaskId(null);
    }
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(0);
  }

  function handleStatusChange(value: TaskStatus | "all") {
    setStatus(value);
    setPage(0);
  }

  function openCreateModal() {
    setNewTaskStatus("pending");
    setEditingTask(null);
    setModalOpen(true);
  }

  function openEditModal(task: Task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingTask(null);
  }

  /*
   * Create / edit task.
   */
  async function handleSubmitTask(taskData: TaskCreate) {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editingTask) {
        await updateTask(token, editingTask.id, taskData);
      } else {
        await createTask(token, taskData);
      }

      setModalOpen(false);
      setEditingTask(null);

      const currentPageSize =
        view === "board" ? BOARD_PAGE_SIZE : PAGE_SIZE;

      const currentOffset =
        view === "board" ? 0 : page * PAGE_SIZE;

      const result = await getTasks(token, {
        limit: currentPageSize,
        offset: currentOffset,
        search: debouncedSearch.trim() || undefined,
        status: status === "all" ? undefined : status,
      });

      setData(result);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save task",
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * Delete task.
   */
  async function handleDeleteTask() {
    if (!deleteTarget) {
      return;
    }

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

      const currentPageSize =
        view === "board" ? BOARD_PAGE_SIZE : PAGE_SIZE;

      const currentOffset =
        view === "board" ? 0 : page * PAGE_SIZE;

      const result = await getTasks(token, {
        limit: currentPageSize,
        offset: currentOffset,
        search: debouncedSearch.trim() || undefined,
        status: status === "all" ? undefined : status,
      });

      if (
        view === "list" &&
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

  const totalPages =
    data && view === "list"
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
              Organize your work and keep track of what needs to be
              done.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="
              inline-flex items-center
              justify-center gap-2
              rounded-xl bg-primary
              px-4 py-2.5
              text-sm font-medium text-white
              shadow-lg shadow-primary/10
              transition
              hover:bg-primary-hover
            "
          >
            <Plus size={17} />
            New task
          </button>
        </section>

        {/* View switcher */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-text-primary">
              Your tasks
            </p>

            <p className="mt-1 text-xs text-text-muted">
              Switch between list and board views.
            </p>
          </div>

          <div className="flex items-center rounded-xl border border-border bg-surface p-1">
            <button
              type="button"
              onClick={() => {
                setView("list");
                setPage(0);
              }}
              className={`
                inline-flex items-center gap-2
                rounded-lg px-3 py-2
                text-xs font-medium
                transition
                ${
                  view === "list"
                    ? "bg-surface-elevated text-text-primary shadow-sm"
                    : "text-text-muted hover:text-text-secondary"
                }
              `}
            >
              <List size={15} />
              List
            </button>

            <button
              type="button"
              onClick={() => {
                setStatus("all");
                setPage(0);
                setView("board");
              }}
              className={`
                inline-flex items-center gap-2
                rounded-lg px-3 py-2
                text-xs font-medium
                transition
                ${
                  view === "board"
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-text-muted hover:text-text-secondary"
                }
              `}
            >
              <KanbanSquare size={15} />
              Board
            </button>
          </div>
        </div>

        {/* Filters */}
        <section className="rounded-2xl border border-border bg-surface p-3">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={17}
                className="
                  absolute left-3 top-1/2
                  -translate-y-1/2
                  text-text-muted
                "
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  handleSearch(event.target.value)
                }
                placeholder="Search tasks..."
                className="
                  h-10 w-full rounded-xl
                  border border-border
                  bg-surface-elevated
                  pl-10 pr-4
                  text-sm text-text-primary
                  outline-none
                  placeholder:text-text-muted
                  focus:border-primary/60
                  focus:ring-2
                  focus:ring-primary/10
                "
              />
            </div>

            <div className="relative">
              <SlidersHorizontal
                size={16}
                className="
                  pointer-events-none
                  absolute left-3 top-1/2
                  -translate-y-1/2
                  text-text-muted
                "
              />

              <select
                value={status}
                disabled={view === "board"}
                onChange={(event) =>
                  handleStatusChange(
                    event.target.value as TaskStatus | "all",
                  )
                }
                className="
                  h-10 w-full
                  appearance-none
                  rounded-xl
                  border border-border
                  bg-surface-elevated
                  pl-9 pr-10
                  text-sm text-text-primary
                  outline-none
                  focus:border-primary/60
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  md:w-48
                "
              >
                {statusOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="bg-surface text-text-primary"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Summary */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              {data?.total ?? 0}{" "}
              {data?.total === 1 ? "task" : "tasks"}
            </p>

            <p className="text-xs capitalize text-text-muted">
              {status === "all"
                ? "All tasks"
                : `${getStatusLabel(status)} tasks`}

              {search && ` matching "${search}"`}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="
              rounded-xl
              border border-error/20
              bg-error/10
              p-4
              text-sm text-error
            "
          >
            {error}
          </div>
        )}

        {/* Tasks */}
        {view === "list" ? (
          <section
            className="
              overflow-hidden
              rounded-2xl
              border border-border
              bg-surface
            "
          >
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
        ) : (
          <div className="relative">
            {loading && (
              <div
                className="
                  absolute
                  inset-x-0
                  top-0
                  z-20
                  flex
                  justify-center
                "
              >
                <div
                  className="
                    rounded-full
                    border border-border
                    bg-surface-elevated
                    px-3 py-1.5
                    text-xs
                    text-text-secondary
                    shadow-sm
                  "
                >
                  Loading tasks...
                </div>
              </div>
            )}

            <TaskBoard
              tasks={data?.items ?? []}
              updatingTaskId={updatingTaskId}
              onEdit={openEditModal}
              onDelete={setDeleteTarget}
              onCreateTask={(status) => {
                setEditingTask(null);
                setNewTaskStatus(status);
                setModalOpen(true);
              }}
              onStatusChange={handleBoardStatusChange}
            />
          </div>
        )}

        {/* Pagination */}
        {view === "list" && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted">
              Page {page + 1} of {totalPages}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() =>
                  setPage((value) => value - 1)
                }
                className="
                  rounded-lg
                  border border-border
                  bg-surface
                  px-3 py-2
                  text-sm
                  text-text-secondary
                  transition
                  hover:bg-surface-elevated
                  hover:text-text-primary
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                Previous
              </button>

              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() =>
                  setPage((value) => value + 1)
                }
                className="
                  rounded-lg
                  border border-border
                  bg-surface
                  px-3 py-2
                  text-sm
                  text-text-secondary
                  transition
                  hover:bg-surface-elevated
                  hover:text-text-primary
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Task modal */}
      <TaskModal
        open={modalOpen}
        task={editingTask}
        initialStatus={newTaskStatus}
        loading={saving}
        onClose={closeModal}
        onSubmit={handleSubmitTask}
      />

      {/* Delete dialog */}
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

function getStatusLabel(status: TaskStatus): string {
  switch (status) {
    case "pending":
      return "To do";

    case "in_progress":
      return "In progress";

    case "completed":
      return "Completed";

    case "cancelled":
      return "Cancelled";
  }
}
