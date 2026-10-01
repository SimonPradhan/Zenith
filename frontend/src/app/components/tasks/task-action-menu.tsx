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
      className="relative shrink-0"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-lg p-2 text-text-muted transition hover:bg-background hover:text-text-primary"
        aria-label="Task actions"
        aria-expanded={open}
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-xl border border-border bg-background p-1 shadow-xl">
          <button
            type="button"
            onClick={handleEdit}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-text-secondary transition hover:bg-background hover:text-text-primary"
          >
            <Pencil size={15} />
            Edit task
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-error transition hover:bg-error/10"
          >
            <Trash2 size={15} />
            Delete task
          </button>
        </div>
      )}
    </div>
  );
}
