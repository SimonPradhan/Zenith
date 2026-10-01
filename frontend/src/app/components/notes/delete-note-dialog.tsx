"use client";

import { Loader2, Trash2, X } from "lucide-react";

import type { Note } from "@/types/note";

interface DeleteNoteDialogProps {
  note: Note | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteNoteDialog({
  note,
  loading = false,
  onClose,
  onConfirm,
}: DeleteNoteDialogProps) {
  if (!note) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md rounded-t-2xl border border-border bg-surface shadow-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error/10">
              <Trash2
                size={18}
                className="text-error"
              />
            </div>

            <div>
              <h2 className="text-base font-semibold text-text-primary">
                Delete note
              </h2>

              <p className="mt-1 text-xs text-text-muted">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-text-muted transition hover:bg-surface-elevated hover:text-text-primary disabled:opacity-40"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-5">
          <p className="text-sm leading-6 text-text-secondary">
            Are you sure you want to delete{" "}
            <span className="font-medium text-text-primary">
              {note.title}
            </span>
            ?
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-2 border-t border-border p-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-10 rounded-xl border border-border px-4 text-sm font-medium text-text-secondary transition hover:bg-surface-elevated hover:text-text-primary disabled:opacity-40"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-error px-5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <Loader2
                size={16}
                className="animate-spin"
              />
            )}

            {loading ? "Deleting..." : "Delete note"}
          </button>
        </div>
      </div>
    </div>
  );
}
