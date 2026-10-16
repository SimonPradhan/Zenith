"use client";

import { Pencil, Trash2 } from "lucide-react";

import { DetailModalShell } from "@/app/components/ui/detail-modal-shell";
import {
  formatNoteDate,
  stickyColorLabels,
  stickyColors,
} from "@/app/components/notes/note-colors";

import type { Note } from "@/types/note";

interface NoteDetailModalProps {
  note: Note;
  onClose: () => void;
  onEdit?: (note: Note) => void;
  onDelete?: (note: Note) => void;
}

export function NoteDetailModal({
  note,
  onClose,
  onEdit,
  onDelete,
}: NoteDetailModalProps) {
  const paper = stickyColors[note.color];

  return (
    <DetailModalShell
      labelledBy="note-detail-title"
      onClose={onClose}
      widthClassName="max-w-2xl"
    >
      <div
        className="detail-modal-paper p-6 pt-10 text-[#1c1a16] sm:p-9 sm:pt-11"
        style={{ backgroundColor: paper }}
      >
        <div className="note-tape" aria-hidden="true" />

        <p className="mb-3 inline-block border-2 border-[#1c1a16] bg-white/60 px-2 py-0.5 text-[11px] font-black uppercase tracking-[0.14em]">
          Note · {stickyColorLabels[note.color]}
        </p>

        <h2
          id="note-detail-title"
          className="comic-title break-words pr-10 text-3xl font-black uppercase leading-tight sm:text-4xl"
        >
          {note.title}
        </h2>

        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs font-semibold text-[#1c1a16]/70">
          <div className="flex gap-1.5">
            <dt>Created</dt>
            <dd>{formatNoteDate(note.created_at)}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt>Updated</dt>
            <dd>{formatNoteDate(note.updated_at)}</dd>
          </div>
        </dl>

        <div className="my-5 h-0.5 bg-[#1c1a16]/70" />

        <p className="whitespace-pre-wrap break-words text-base leading-7">
          {note.content}
        </p>

        {(onEdit || onDelete) && (
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(note)}
                className="comic-btn inline-flex items-center justify-center gap-2 bg-white px-4 py-2.5 text-sm font-black uppercase text-[#b0361f]"
              >
                <Trash2 size={16} />
                Delete
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(note)}
                className="comic-btn inline-flex items-center justify-center gap-2 bg-[#1c1a16] px-5 py-2.5 text-sm font-black uppercase text-[#f4d64f]"
              >
                <Pencil size={16} />
                Edit note
              </button>
            )}
          </div>
        )}
      </div>
    </DetailModalShell>
  );
}
