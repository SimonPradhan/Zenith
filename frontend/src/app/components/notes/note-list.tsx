"use client";

import type { Note } from "@/types/note";

import { NoteCard } from "./note-card";
import { NoteListSkeleton } from "./note-list-skeleton";
import { NoteEmptyState } from "./note-empty-state";

interface NoteListProps {
  notes: Note[];
  loading: boolean;
  search: string;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
}

export function NoteList({
  notes,
  loading,
  search,
  onEdit,
  onDelete,
}: NoteListProps) {
  if (loading && notes.length === 0) {
    return <NoteListSkeleton />;
  }

  if (!loading && notes.length === 0) {
    return <NoteEmptyState search={search} />;
  }

  return (
    <div className="relative">
      {loading && (
        <div className="pointer-events-none absolute inset-0 z-10 bg-surface/20 backdrop-blur-[1px]">
          <div className="sticky top-2 flex justify-center pt-2">
            <div className="rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-secondary shadow-lg">
              Updating...
            </div>
          </div>
        </div>
      )}

      <div
        className={`
          relative overflow-hidden rounded-3xl
          border border-border
          bg-surface-elevated/40
          p-5 sm:p-7
          transition-opacity duration-200
          ${loading ? "opacity-60" : "opacity-100"}
        `}
      >
        {/* Subtle board texture */}
        <div
          className="
            pointer-events-none absolute inset-0
            opacity-[0.025]
            [background-image:radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)]
            [background-size:18px_18px]
          "
        />

        <div
          className="
            relative
            grid grid-cols-1 gap-8
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          "
        >
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
