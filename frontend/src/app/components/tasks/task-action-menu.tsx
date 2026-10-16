"use client";

import {
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { Task } from "@/types/task";

interface TaskActionsMenuProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskActionsMenu({
  task,
  onEdit,
  onDelete,
}: TaskActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  function handleEdit() {
    setOpen(false);
    onEdit(task);
  }

  function handleDelete() {
    setOpen(false);
    onDelete(task);
  }

  return (
    <div
      ref={menuRef}
      className={`relative z-50 shrink-0 ${open ? "task-actions-menu-open" : ""}`}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-sm border-2 border-transparent p-2 text-text-muted transition hover:border-[var(--comic-ink)] hover:bg-[#f4d64f] hover:text-[#28251f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        aria-label="Task actions"
        aria-expanded={open}
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[100] mt-1 w-40 overflow-visible rounded-sm border-2 border-[var(--comic-ink)] bg-background p-1 shadow-[4px_4px_0_var(--paper-shadow)]">
          <button
            type="button"
            onClick={handleEdit}
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm font-semibold text-text-secondary transition hover:bg-[#f4d64f] hover:text-[#28251f]"
          >
            <Pencil size={15} />
            Edit task
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm font-semibold text-error transition hover:bg-error/10"
          >
            <Trash2 size={15} />
            Delete task
          </button>
        </div>
      )}
    </div>
  );
}
