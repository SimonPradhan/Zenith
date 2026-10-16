"use client";

import { Loader2, Palette, X } from "lucide-react";
import { useState } from "react";

import type {
  Note,
  NoteColor,
  NoteCreate,
} from "@/types/note";

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

const noteColors: {
  value: NoteColor;
  label: string;
  className: string;
}[] = [
  {
    value: "yellow",
    label: "Yellow",
    className: "bg-[#f4edc8]",
  },
  {
    value: "purple",
    label: "Lavender",
    className: "bg-[#e8e1f5]",
  },
  {
    value: "blue",
    label: "Blue",
    className: "bg-[#dcecf2]",
  },
  {
    value: "green",
    label: "Green",
    className: "bg-[#e2eddc]",
  },
  {
    value: "pink",
    label: "Pink",
    className: "bg-[#f3dfe3]",
  },
  ];

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
  const [color, setColor] = useState<NoteColor>(
    note?.color ?? "yellow",
  );
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
        color,
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
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[#211d17]/70 p-0 backdrop-blur-[3px] sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="note-modal-title" className="comic-note-modal relative flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden border-2 border-[var(--comic-ink)] bg-surface text-text-primary shadow-[7px_7px_0_var(--paper-shadow)] sm:max-h-[92vh] sm:rounded-sm">
        {/* Header */}
        <div className="relative flex shrink-0 items-start justify-between gap-4 border-b-2 border-[var(--comic-ink)] bg-surface-elevated px-5 py-5 sm:px-7">
          <div>
            <h2 id="note-modal-title" className="retro-display text-2xl font-black uppercase leading-tight tracking-tight sm:text-3xl">
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
            className="shrink-0 border-2 border-[var(--comic-ink)] bg-surface px-2 py-2 text-text-primary shadow-[2px_2px_0_var(--comic-ink)] transition hover:-translate-y-0.5 hover:bg-background disabled:opacity-40"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="comic-note-modal-form min-h-0 space-y-6 overflow-y-auto bg-surface p-5 sm:p-7"
        >
          {error && (
            <div className="border-2 border-error bg-error/10 px-4 py-3 text-sm font-semibold text-error shadow-[3px_3px_0_var(--paper-shadow)]">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label
              htmlFor="note-title"
              className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-text-secondary"
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
              className="h-12 w-full rounded-sm border-2 border-[var(--ink-outline)] bg-background px-3.5 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
            />
          </div>

          {/* Content */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="note-content"
                className="block text-xs font-black uppercase tracking-[0.12em] text-text-secondary"
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
              className="w-full resize-y rounded-sm border-2 border-[var(--ink-outline)] bg-background px-3.5 py-3 text-sm leading-6 text-text-primary outline-none placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
            />
          </div>

          {/* Color */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Palette
                size={15}
                className="text-text-muted"
              />

              <label className="text-xs font-black uppercase tracking-[0.12em] text-text-secondary">
                Note color
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              {noteColors.map((noteColor) => {
                const selected = color === noteColor.value;

                return (
                  <button
                    key={noteColor.value}
                    type="button"
                    onClick={() => setColor(noteColor.value)}
                    disabled={loading}
                    aria-label={`Use ${noteColor.label} note color`}
                    aria-pressed={selected}
                    className={`
                      relative h-10 w-10 rounded-lg
                      border
                      ${noteColor.className}
                      transition-all duration-150
                      hover:-translate-y-0.5
                      hover:shadow-md
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                      ${
                        selected
                          ? "border-[var(--comic-ink)] ring-2 ring-primary ring-offset-2 ring-offset-surface shadow-[3px_3px_0_var(--comic-ink)]"
                          : "border-[var(--comic-ink)]/40"
                      }
                    `}
                  >
                    {selected && (
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-zinc-700">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 flex-col-reverse gap-3 border-t-2 border-[var(--comic-ink)] bg-surface-elevated/60 p-5 sm:flex-row sm:justify-between sm:px-7">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-11 border-2 border-[var(--comic-ink)] bg-surface px-5 text-sm font-bold text-text-primary shadow-[3px_3px_0_var(--paper-shadow)] transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--paper-shadow)] disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="comic-action inline-flex h-11 items-center justify-center gap-2 border-2 border-[var(--comic-ink)] bg-primary px-5 text-sm font-black uppercase tracking-wide text-white shadow-[3px_3px_0_var(--comic-ink)] transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--comic-ink)] hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
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
