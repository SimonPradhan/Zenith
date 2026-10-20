import { ArrowRight, FileText, Plus, Clipboard } from "lucide-react";

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
      <div className="flex shrink-0 items-center justify-between gap-3 border-b-2 border-[#28251f]/80 bg-[#efaaa7]/70 px-4 py-4 sm:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-[#28251f] bg-[#efaaa7] text-[#28251f] shadow-[2px_2px_0_#28251f]">
          <Clipboard size={19} />
        </div>
        <div>
          <h3 className="comic-heading truncate text-xl text-foreground">
            Recent notes
          </h3>

          <p className="mt-1 text-xs text-text-muted">
            Your latest saved notes.
          </p>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="comic-action inline-flex shrink-0 items-center gap-1.5 border-2 border-[#28251f] bg-[#fffaf0] px-3 py-2 text-xs font-bold text-[#28251f] shadow-[2px_2px_0_#28251f] transition hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#28251f]"
        >
          View all
          <ArrowRight size={13} />
        </button>
      </div>

      {notes.length === 0 ? (
        <EmptyNotes onCreateNote={onCreateNote} />
      ) : (
        <div className="min-h-0 flex-1 divide-y divide-dashed divide-[#28251f]/20 overflow-y-auto overscroll-auto bg-[radial-gradient(#28251f0b_1px,transparent_1px)] bg-[length:10px_10px]">
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

function NoteItem({ note, onClick }: { note: Note; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="comic-note-row flex w-full cursor-pointer items-start gap-3 border-b border-dashed border-[#28251f]/20 bg-[#fffaf0]/85 px-4 py-4 text-left transition hover:bg-[#f4d64f]/20 sm:px-6"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-[#28251f]/70 bg-[#f4d64f]/70 text-[#28251f] shadow-[2px_2px_0_#28251f]">
        <FileText size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#28251f]">
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

function EmptyNotes({ onCreateNote }: { onCreateNote: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-[radial-gradient(#28251f12_1px,transparent_1px)] bg-[length:10px_10px] px-5 py-6 text-center sm:px-6">
      <div className="mx-auto flex h-11 w-11 items-center justify-center border-2 border-[#28251f] bg-[#f4d64f]/70 text-[#28251f] shadow-[3px_3px_0_#28251f]">
        <FileText size={18} />
      </div>

      <p className="mt-3 text-sm font-medium text-text-primary">No notes yet</p>

      <p className="mt-1 text-xs text-text-muted">
        Capture an idea or something important.
      </p>

      <button
        type="button"
        onClick={onCreateNote}
        className="comic-action mt-4 inline-flex items-center gap-1.5 border-2 border-[#28251f] bg-[#c4e3e0] px-3 py-2 text-xs font-bold text-[#28251f] shadow-[3px_3px_0_#28251f] transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#28251f]"
      >
        <Plus size={14} />
        Create note
      </button>
    </div>
  );
}
