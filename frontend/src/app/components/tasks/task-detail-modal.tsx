"use client";

import {
  CalendarDays,
  SquareCheckBig,
  SquareDot,
  SquarePen,
  SquareX,
  Clock3,
  Flag,
  Loader2,
  Pencil,
  Timer,
  Trash2,
} from "lucide-react";

import { DetailModalShell } from "@/app/components/ui/detail-modal-shell";
import { formatTaskDueDate } from "@/lib/task-date";

import type {
  Task,
  TaskPriority,
  TaskStatus,
} from "@/types/task";

interface TaskDetailModalProps {
  task: Task;
  updating?: boolean;
  onClose: () => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onToggleStatus?: (task: Task) => void;
}

const statusLabels: Record<TaskStatus, string> = {
  pending: "To do",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Archived",
};

const statusColors: Record<TaskStatus, string> = {
  pending: "#a9c9e8",
  in_progress: "#f4d64f",
  completed: "#b8d9b7",
  cancelled: "#efaaa7",
};

const priorityColors: Record<TaskPriority, string> = {
  low: "#cdb6ea",
  medium: "#f4d64f",
  high: "#f2a65a",
  urgent: "#ef6f5f",
};

export function TaskDetailModal({
  task,
  updating = false,
  onClose,
  onEdit,
  onDelete,
  onToggleStatus,
}: TaskDetailModalProps) {
  const completed = task.status === "completed";
  const due = formatTaskDueDate(task.due_date);

  return (
    <DetailModalShell
      labelledBy="task-detail-title"
      onClose={onClose}
      widthClassName="max-w-2xl"
    >
      <div className="detail-modal-paper bg-[#fbf5e9] p-6 pt-10 text-[#1c1a16] sm:p-9 sm:pt-11">
        <h3 className="mb-3 comic-heading uppercase tracking-[0.14em] text-[#1c1a16]/60">
          Task
        </h3>

        <div className="flex items-start gap-3">
          {onToggleStatus && (
            <button
              type="button"
              disabled={updating}
              onClick={() => onToggleStatus(task)}
              aria-label={
                completed
                  ? "Mark task as pending"
                  : "Mark task as completed"
              }
              className="mt-1 shrink-0 transition hover:scale-110 disabled:opacity-60 cursor-pointer"
            >
              {updating ? (
                <Loader2 size={28} className="animate-spin" />
              ) : completed ? (
                <SquareCheckBig size={28} className="border-2 border-[#1c1a16] bg-[#b8d9b7] text-[#1c1a16]" />
              ) :  task.status === "in_progress" ? (
                <SquarePen size={28} className="border-2 border-[#1c1a16] bg-[#f4d64f] text-[#1c1a16]" />
              ):  task.status === "cancelled" ? (
                <SquareX size={28} className="border-2 border-[#1c1a16] bg-[#efaaa7] text-[#1c1a16]" />
              )  : (
                <SquareDot size={28} />
              )}
            </button>
          )}

          <h2
            id="task-detail-title"
            className={`comic-heading min-w-0 break-words pr-10 text-3xl font-black uppercase leading-tight sm:text-4xl ${
              completed ? "line-through decoration-2 opacity-60" : ""
            }`}
          >
            {task.title}
          </h2>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className="inline-flex items-center gap-1.5 border-2 border-[#1c1a16] px-2.5 py-1 text-xs font-black uppercase"
            style={{ backgroundColor: statusColors[task.status] }}
          >
            <Clock3 size={13} />
            {statusLabels[task.status]}
          </span>

          <span
            className="inline-flex items-center gap-1.5 border-2 border-[#1c1a16] px-2.5 py-1 text-xs font-black uppercase"
            style={{ backgroundColor: priorityColors[task.priority] }}
          >
            <Flag size={13} />
            {task.priority} priority
          </span>
        </div>

        <div className="my-5 h-0.5 bg-[#1c1a16]/70" />

        <section aria-label="Description">
          {task.description ? (
            <p className="whitespace-pre-wrap break-words text-base leading-7">
              {task.description}
            </p>
          ) : (
            <p className="text-sm italic text-[#1c1a16]/55">
              No description added.
            </p>
          )}
        </section>

        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          <DetailField
            icon={<CalendarDays size={15} />}
            label="Due"
            value={
              task.due_date
                ? `${formatDateTime(task.due_date)}${
                    due && due.tone !== "normal"
                      ? ` · ${due.label}`
                      : ""
                  }`
                : "No due date"
            }
            danger={due?.tone === "overdue" && !completed}
          />
          <DetailField
            icon={<CalendarDays size={15} />}
            label="Starts"
            value={
              task.start_date
                ? formatDateTime(task.start_date)
                : "Not scheduled"
            }
          />
          <DetailField
            icon={<Timer size={15} />}
            label="Estimate"
            value={
              task.estimated_minutes
                ? formatMinutes(task.estimated_minutes)
                : "No estimate"
            }
          />
          <DetailField
            icon={<Clock3 size={15} />}
            label="Created"
            value={formatDateTime(task.created_at)}
          />
        </dl>

        {(onEdit || onDelete) && (
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(task)}
                className="comic-btn inline-flex items-center justify-center gap-2 bg-white px-4 py-2.5 text-sm font-black uppercase text-[#b0361f]"
              >
                <Trash2 size={16} />
                Delete
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(task)}
                className="comic-btn inline-flex items-center justify-center gap-2 bg-[#1c1a16] px-5 py-2.5 text-sm font-black uppercase text-[#f4d64f]"
              >
                <Pencil size={16} />
                Edit task
              </button>
            )}
          </div>
        )}
      </div>
    </DetailModalShell>
  );
}

function DetailField({
  icon,
  label,
  value,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="border-2 border-[#1c1a16]/80 bg-white/55 px-3 py-2.5">
      <dt className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#1c1a16]/60">
        {icon}
        {label}
      </dt>
      <dd
        className={`mt-1 text-sm font-semibold ${
          danger ? "text-[#b0361f]" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatMinutes(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;

  return `${hours} h ${minutes} min`;
}
