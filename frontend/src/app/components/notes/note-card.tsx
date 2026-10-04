"use client";

import {
  MoreHorizontal,
  Pencil,
  Pin,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { Note } from "@/types/note";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
}

const paperColors: Record<Note["color"], string> = {
  yellow: "bg-[#f4edc8]",
  purple: "bg-[#e8e1f5]",
  blue: "bg-[#dcecf2]",
  green: "bg-[#e2eddc]",
  pink: "bg-[#f3dfe3]",
};

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

  const paperColor = paperColors[note.color];

  return (
    <article
      onClick={() => onEdit(note)}
      className="
        group relative
        flex min-h-[220px] flex-col
        cursor-pointer
        p-5 pt-7
        text-zinc-900
        transition-all duration-300
        hover:-translate-y-1.5
        hover:rotate-[0.35deg]
        hover:scale-[1.01]
        hover:z-10
      "
    >
      {/* Paper + fold (shadow wrapper so the cut corner casts a proper shadow) */}
      <div
        className="
          pointer-events-none absolute inset-0
          drop-shadow-[2px_4px_6px_rgba(0,0,0,0.18)]
          transition-all duration-200
          group-hover:drop-shadow-[4px_8px_10px_rgba(0,0,0,0.22)]
        "
      >
        {/* Paper with bottom-right corner cut off */}
        <div
          className={`
            absolute inset-0 rounded-sm ${paperColor}
            [clip-path:polygon(0_0,100%_0,100%_calc(100%_-_36px),calc(100%_-_36px)_100%,0_100%)]
          `}
        >
          {/* Subtle paper texture */}
          <div
            className="
              absolute inset-0 opacity-[0.035]
              [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)]
              [background-size:10px_10px]
            "
          />
        </div>

        {/* Shadow cast by the flap onto the paper */}
        <div
          className="
            absolute bottom-0 right-0 h-9 w-9
            translate-x-[-2px] translate-y-[-2px]
            bg-black/25 blur-[3px]
            [clip-path:polygon(0_0,100%_0,0_100%)]
          "
        />

        {/* Folded flap (underside of the paper) */}
        <div
          className={`
            absolute bottom-0 right-0 h-9 w-9 ${paperColor}
            [clip-path:polygon(0_0,100%_0,0_100%)]
          `}
        >
          <div className="absolute inset-0 bg-gradient-to-tl from-black/25 via-black/10 to-black/0" />
        </div>
      </div>

      {/* Push pin */}
      <div className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-[42%]">
        <div className="relative h-7 w-7">
          {/* Pin shadow */}
          <div className="absolute left-1/2 top-2 h-5 w-5 -translate-x-1/2 rounded-full bg-black/20 blur-[3px]" />

          {/* Pin head */}
          <div
            className="
              absolute left-1/2 top-0
              h-6 w-6 -translate-x-1/2
              rounded-full
              bg-primary
              shadow-[0_3px_5px_rgba(0,0,0,0.35)]
            "
          >
            {/* Highlight */}
            <span
              className="
                absolute left-[5px] top-[4px]
                h-2 w-2 rounded-full
                bg-white/50
                blur-[0.5px]
              "
            />

            {/* Subtle center */}
            <span
              className="
                absolute inset-[6px]
                rounded-full
                bg-black/10
              "
            />
          </div>

          {/* Pin needle */}
          <span
            className="
              absolute left-1/2 top-[21px]
              h-3 w-[2px]
              -translate-x-1/2
              rounded-full
              bg-zinc-500/70
            "
          />
        </div>
      </div>

      {/* Header */}
      <div className="relative flex items-start justify-between gap-4">
        <h2 className="min-w-0 flex-1 text-base font-semibold leading-6 text-zinc-800">
          {note.title}
        </h2>

        <div
          ref={menuRef}
          className="relative shrink-0"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-lg p-1.5 text-zinc-500 opacity-100 transition hover:bg-black/5 hover:text-zinc-800 sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Note actions"
            aria-expanded={open}
          >
            <MoreHorizontal size={18} />
          </button>

          {open && (
            <div className="absolute right-0 top-full z-30 mt-1 w-36 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 shadow-xl">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleEdit();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
              >
                <Pencil size={15} />
                Edit note
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleDelete();
                }}
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
      <p className="relative mt-4 line-clamp-6 flex-1 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
        {note.content}
      </p>

      {/* Footer */}
      <div className="relative mt-5 border-t border-black/10 pt-3 pr-6">
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-zinc-500">
            Updated {formatNoteDate(note.updated_at)}
          </p>
          <Pin size={13} className="text-zinc-400/70" />
        </div>
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
