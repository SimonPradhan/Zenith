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
  if (loading && notes.length === 0) return <NoteListSkeleton />;
  if (!loading && notes.length === 0) return <NoteEmptyState search={search} />;

  return (
    <div className="relative">
      {loading && (
        <div className="pointer-events-none absolute inset-0 z-10 bg-surface/25 backdrop-blur-[1px]">
          <div className="sticky top-2 flex justify-center pt-3">
            <div className="rounded-sm border border-[var(--ink-outline)] bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary shadow-[2px_2px_0_var(--paper-shadow)]">
              Updating notes…
            </div>
          </div>
        </div>
      )}

      <div
        className={`note-paper-board relative overflow-hidden rounded-sm border-2 border-[var(--ink-outline)] p-4 shadow-[4px_5px_0_var(--paper-shadow)] transition-opacity duration-200 sm:p-6 lg:p-8 ${loading ? "opacity-60" : "opacity-100"}`}
      >
        {/* Decorative tape at the top of the board */}
        <div className="pointer-events-none absolute left-1/2 top-0 z-[1] h-3 w-24 -translate-x-1/2 -translate-y-1/2 rotate-[-2deg] border border-black/10 bg-[#f4d64f]/75 shadow-sm" />
        {/* Dense halftone plus a soft vignette gives the board a printed-paper feel. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_2px_2px,rgba(40,37,31,0.22)_1px,transparent_1.35px),linear-gradient(135deg,rgba(255,255,255,0.16),transparent_55%)] [background-size:7px_7px,auto]"
        />

        <div className="relative grid grid-cols-1 gap-x-7 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      </div>
    </div>
  );
}
