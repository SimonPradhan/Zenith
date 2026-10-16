"use client";

import {
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

import type { Task } from "@/types/task";

interface TaskActionsMenuProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

type MenuPosition = {
  top: number;
  left: number;
};

const MENU_HEIGHT = 88;
const MENU_WIDTH = 160;
const VIEWPORT_GAP = 8;

export function TaskActionsMenu({
  task,
  onEdit,
  onDelete,
}: TaskActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  function updatePosition() {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const openAbove =
      window.innerHeight - rect.bottom < MENU_HEIGHT + VIEWPORT_GAP &&
      rect.top > MENU_HEIGHT + VIEWPORT_GAP;

    const top = openAbove
      ? Math.max(VIEWPORT_GAP, rect.top - MENU_HEIGHT - 4)
      : Math.min(
          window.innerHeight - MENU_HEIGHT - VIEWPORT_GAP,
          rect.bottom + 4,
        );
    const left = Math.max(
      VIEWPORT_GAP,
      Math.min(
        rect.right - MENU_WIDTH,
        window.innerWidth - MENU_WIDTH - VIEWPORT_GAP,
      ),
    );

    setPosition({ top, left });
  }

  useEffect(() => {
    if (!open) return;

    updatePosition();

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    function handleViewportChange() {
      updatePosition();
    }

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [open]);

  function toggleMenu() {
    if (!open) updatePosition();
    setOpen((value) => !value);
  }

  function handleEdit() {
    setOpen(false);
    onEdit(task);
  }

  function handleDelete() {
    setOpen(false);
    onDelete(task);
  }

  return (
    <>
      <div className="relative z-50 shrink-0">
        <button
          ref={triggerRef}
          type="button"
          onClick={toggleMenu}
          className="rounded-sm border-2 border-transparent p-2 text-text-muted transition hover:border-[var(--comic-ink)] hover:bg-[#f4d64f] hover:text-[#28251f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label={`Task actions for ${task.title}`}
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      {open && position && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="task-actions-popover fixed z-[9999] w-40 rounded-sm border-2 border-[var(--comic-ink)] bg-background p-1 shadow-[4px_4px_0_var(--paper-shadow)]"
            style={{ top: position.top, left: position.left }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={handleEdit}
              className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm font-semibold text-text-secondary transition hover:bg-[#f4d64f] hover:text-[#28251f]"
            >
              <Pencil size={15} />
              Edit task
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={handleDelete}
              className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm font-semibold text-error transition hover:bg-error/10"
            >
              <Trash2 size={15} />
              Delete task
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
