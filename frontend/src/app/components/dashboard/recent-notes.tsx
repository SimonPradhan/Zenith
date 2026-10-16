import {
  ArrowRight,
  FileText,
  Plus,
} from "lucide-react";

import type { Note } from "@/types/note";

type RecentNotesProps = {
  notes: Note[];
  onViewAll: () => void;
  onCreateNote: () => void;
  onNoteClick: (note: Note) => void;
};

export default function RecentNotes({
  notes,
  onViewAll,
  onCreateNote,
  onNoteClick,
}: RecentNotesProps) {
  return (
    <section className="comic-list-panel flex h-full min-h-0 flex-col overflow-hidden rounded-sm border-2 border-text-primary bg-surface">
      <div className="flex items-center justify-between border-b-2 border-text-primary/70 bg-[#efaaa7]/55 px-5 py-4 sm:px-6">
        <div>
          <h2 className="font-semibold text-text-primary">
            Recent notes
          </h2>

          <p className="mt-1 text-xs text-text-muted">
            Your latest saved notes.
          </p>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition hover:text-primary-hover"
        >
          View all
          <ArrowRight size={13} />
        </button>
      </div>

      {notes.length === 0 ? (
        <EmptyNotes onCreateNote={onCreateNote} />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain divide-y divide-border">
          {notes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onClick={() => onNoteClick(note)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function NoteItem({
  note,
  onClick,
}: {
  note: Note;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="comic-note-row flex w-full cursor-pointer text-left items-start gap-3 border-b border-dashed border-text-primary/20 px-5 py-4 transition hover:bg-surface-elevated sm:px-6">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-text-primary/25 bg-[#f4d64f]/60 text-text-primary">
        <FileText size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">
          {note.title}
        </p>

        {note.content && (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-text-muted">
            {note.content}
          </p>
        )}
      </div>
    </button>
  );
}

function EmptyNotes({
  onCreateNote,
}: {
  onCreateNote: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-6 text-center sm:px-6">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <FileText size={18} />
      </div>

      <p className="mt-3 text-sm font-medium text-text-primary">
        No notes yet
      </p>

      <p className="mt-1 text-xs text-text-muted">
        Capture an idea or something important.
      </p>

      <button
        type="button"
        onClick={onCreateNote}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white transition hover:bg-primary-hover"
      >
        <Plus size={14} />
        Create note
      </button>
    </div>
  );
}
