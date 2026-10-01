"use client";

import { Loader2, X } from "lucide-react";
import { useState } from "react";

import type { Note, NoteCreate } from "@/types/note";

interface NoteModalProps {
  open: boolean;
  note?: Note | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: NoteCreate) => Promise<void>;
}

export function NoteModal({
  open,
  note,
  loading = false,
  onClose,
  onSubmit,
}: NoteModalProps) {
  if (!open) return null;

  return (
    <NoteModalForm
      key={note?.id ?? "new"}
      note={note}
      loading={loading}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

function NoteModalForm({
  note,
  loading,
  onClose,
  onSubmit,
}: {
  note?: Note | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: NoteCreate) => Promise<void>;
}) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [error, setError] = useState("");

  const editing = Boolean(note);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      setError("Note title is required.");
      return;
    }

    if (trimmedTitle.length > 255) {
      setError("Note title must be 255 characters or less.");
      return;
    }

    if (!trimmedContent) {
      setError("Note content is required.");
      return;
    }

    setError("");

    try {
      await onSubmit({
        title: trimmedTitle,
        content: trimmedContent,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save note.",
      );
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-2xl rounded-t-2xl border border-border bg-surface shadow-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              {editing ? "Edit note" : "Create note"}
            </h2>

            <p className="mt-1 text-xs text-text-muted">
              {editing
                ? "Update the content of your note."
                : "Capture an idea, thought, or piece of information."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-text-muted transition hover:bg-surface-elevated hover:text-text-primary disabled:opacity-40"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5"
        >
          {error && (
            <div className="rounded-xl border border-error/20 bg-error/10 px-3 py-2.5 text-sm text-error">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label
              htmlFor="note-title"
              className="mb-2 block text-sm font-medium text-text-primary"
            >
              Title
            </label>

            <input
              id="note-title"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="e.g. Authentication notes"
              maxLength={255}
              autoFocus
              disabled={loading}
              className="h-11 w-full rounded-xl border border-border bg-surface-elevated px-3.5 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary/60 focus:ring-2 focus:ring-primary/10 disabled:opacity-50"
            />
          </div>

          {/* Content */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="note-content"
                className="block text-sm font-medium text-text-primary"
              >
                Content
              </label>

              <span className="text-xs text-text-muted">
                {content.length} characters
              </span>
            </div>

            <textarea
              id="note-content"
              value={content}
              onChange={(event) =>
                setContent(event.target.value)
              }
              placeholder="Write your note here..."
              rows={9}
              disabled={loading}
              className="w-full resize-y rounded-xl border border-border bg-surface-elevated px-3.5 py-3 text-sm leading-6 text-text-primary outline-none placeholder:text-text-muted focus:border-primary/60 focus:ring-2 focus:ring-primary/10 disabled:opacity-50"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-10 rounded-xl border border-border px-4 text-sm font-medium text-text-secondary transition hover:bg-surface-elevated hover:text-text-primary disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              )}

              {editing ? "Save changes" : "Create note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
