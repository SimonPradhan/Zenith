"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { Note } from "@/types/note";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
}

export function NoteCard({
  note,
  onEdit,
  onDelete,
}: NoteCardProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  function handleEdit() {
    setOpen(false);
    onEdit(note);
  }

  function handleDelete() {
    setOpen(false);
    onDelete(note);
  }

  return (
    <article className="group relative flex min-h-[190px] flex-col rounded-2xl border border-border bg-surface p-5 transition duration-200 hover:border-primary/30 hover:bg-surface-elevated">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-text-primary">
          {note.title}
        </h2>

        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-lg p-1.5 text-text-muted opacity-100 transition hover:bg-background hover:text-text-primary sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Note actions"
            aria-expanded={open}
          >
            <MoreHorizontal size={18} />
          </button>

          {open && (
            <div className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-xl border border-border bg-surface-elevated p-1 shadow-xl">
              <button
                type="button"
                onClick={handleEdit}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-text-secondary transition hover:bg-background hover:text-text-primary"
              >
                <Pencil size={15} />
                Edit note
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-error transition hover:bg-error/10"
              >
                <Trash2 size={15} />
                Delete note
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <p className="mt-4 line-clamp-5 flex-1 whitespace-pre-wrap text-sm leading-6 text-text-secondary">
        {note.content}
      </p>

      {/* Footer */}
      <div className="mt-5 border-t border-border pt-4">
        <p className="text-xs text-text-muted">
          Updated {formatNoteDate(note.updated_at)}
        </p>
      </div>
    </article>
  );
}

function formatNoteDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
