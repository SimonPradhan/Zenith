"use client";

import { useEffect, useRef, useState } from "react";
import { LayoutGrid, Plus, Search, StickyNote } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  createNote,
  deleteNote,
  getNote,
  getNotes,
  updateNote,
} from "@/lib/api/notes";
import { getToken } from "@/lib/auth";

import { DeleteNoteDialog } from "@/app/components/notes/delete-note-dialog";
import { NoteBoard, tidyPatches } from "@/app/components/notes/note-board";
import { NoteDetailModal } from "@/app/components/notes/note-detail-modal";
import { NoteEmptyState } from "@/app/components/notes/note-empty-state";
import { NoteListSkeleton } from "@/app/components/notes/note-list-skeleton";
import { NoteModal } from "@/app/components/notes/note-modal";

import type { NoteBoardHandle, NoteMovePatch } from "@/app/components/notes/note-board";
import type {
  Note,
  NoteCreate,
  NoteListResponse,
} from "@/types/note";

/** The board loads every note at once; this matches the API's maximum page. */
const BOARD_LIMIT = 100;

export default function NotesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const boardRef = useRef<NoteBoardHandle>(null);

  const [data, setData] = useState<NoteListResponse | null>(null);

  const [search, setSearch] = useState(() => {
    return searchParams.get("search") ?? "";
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [saving, setSaving] = useState(false);

  const [viewingNoteId, setViewingNoteId] = useState<string | null>(null);

  // A note opened via /notes?note=<id> may be hidden by the current search.
  const [linkedNote, setLinkedNote] = useState<Note | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const [deleting, setDeleting] = useState(false);

  const notes = data?.items ?? [];
  const viewingNote =
    notes.find((note) => note.id === viewingNoteId) ??
    (linkedNote?.id === viewingNoteId ? linkedNote : null);
  const linkedNoteId = searchParams.get("note");

  useEffect(() => {
    if (!linkedNoteId) return;

    let cancelled = false;

    async function loadLinkedNote(id: string) {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const note = await getNote(token, id);

        if (!cancelled) {
          setLinkedNote(note);
          setViewingNoteId(note.id);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load selected note",
          );
        }
      } finally {
        if (!cancelled) {
          router.replace("/notes", { scroll: false });
        }
      }
    }

    loadLinkedNote(linkedNoteId);

    return () => {
      cancelled = true;
    };
  }, [linkedNoteId, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const result = await getNotes(token, {
          limit: BOARD_LIMIT,
          search: debouncedSearch.trim() || undefined,
        });

        if (!cancelled) {
          setData(result);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load notes",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [router, debouncedSearch]);

  async function reloadNotes(token: string) {
    const result = await getNotes(token, {
      limit: BOARD_LIMIT,
      search: debouncedSearch.trim() || undefined,
    });

    setData(result);
  }

  function openCreateModal() {
    setEditingNote(null);
    setModalOpen(true);
  }

  function openEditModal(note: Note) {
    setViewingNoteId(null);
    setEditingNote(note);
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingNote(null);
  }

  async function handleSubmitNote(noteData: NoteCreate) {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setSaving(true);

    try {
      if (editingNote) {
        await updateNote(token, editingNote.id, noteData);
      } else {
        // New notes land on a free spot in the part of the board in view.
        const spot = boardRef.current?.getFreeSpot();

        await createNote(token, { ...noteData, ...spot });
      }

      setModalOpen(false);
      setEditingNote(null);

      await reloadNotes(token);
      setError("");
    } finally {
      setSaving(false);
    }
  }

  /**
   * Moves a note on the board. The UI updates immediately; if the request
   * fails the list is reloaded so the board shows what is actually saved.
   */
  async function handleMoveNote(note: Note, patch: NoteMovePatch) {
    setData((current) =>
      current
        ? {
            ...current,
            items: current.items.map((item) =>
              item.id === note.id ? { ...item, ...patch } : item,
            ),
          }
        : current,
    );

    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      await updateNote(token, note.id, patch);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save note position",
      );

      try {
        await reloadNotes(token);
      } catch {
        // The error banner above already tells the user something is wrong.
      }
    }
  }

  async function handleTidyUp() {
    await Promise.all(
      tidyPatches(notes).map(({ note, patch }) =>
        handleMoveNote(note, patch),
      ),
    );
  }

  async function handleDeleteNote() {
    if (!deleteTarget) return;

    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await deleteNote(token, deleteTarget.id);

      setDeleteTarget(null);
      await reloadNotes(token);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete note",
      );
    } finally {
      setDeleting(false);
    }
  }

  const total = data?.total ?? 0;

  return (
    <>
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Header */}
        <section className="comic-hero comic-hero-paper flex flex-col gap-4 border-2 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
          <div>
            <p className="mb-1 flex items-center gap-2 text-sm text-text-muted">
              <StickyNote size={15} />
              Notice board
            </p>

            <h1 className="comic-heading text-3xl font-black uppercase tracking-tight sm:text-4xl">
              Notes
            </h1>

            <p className="mt-2 text-sm text-text-secondary">
              Drag sticky notes anywhere on the board. Click one to read it.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleTidyUp}
              disabled={notes.length === 0}
              className="comic-btn inline-flex items-center justify-center gap-2 bg-surface px-4 py-2.5 text-sm font-black uppercase text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LayoutGrid size={16} />
              Tidy up
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="comic-btn inline-flex items-center justify-center gap-2 bg-[#f4d64f] px-4 py-2.5 text-sm font-black uppercase text-[#1c1a16]"
            >
              <Plus size={17} />
              New note
            </button>
          </div>
        </section>

        {/* Search */}
        <section className="comic-list-panel border-2 border-[var(--comic-ink)] bg-surface p-3">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search notes..."
              className="h-11 w-full rounded-sm border-2 border-border bg-surface-elevated pl-10 pr-4 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </section>

        {/* Summary */}
        <div>
          <p className="text-sm font-medium">
            {total} {total === 1 ? "note" : "notes"}
          </p>

          <p className="mt-1 text-xs text-text-muted">
            {search ? `Matching "${search}"` : "All notes"}
            {total > BOARD_LIMIT &&
              ` · showing the newest ${BOARD_LIMIT}`}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-sm border-2 border-error/40 bg-error/10 p-4 text-sm text-error">
            {error}
          </div>
        )}

        {/* Board */}
        {loading && notes.length === 0 ? (
          <NoteListSkeleton />
        ) : notes.length === 0 ? (
          <NoteEmptyState search={search} />
        ) : (
          <NoteBoard
            ref={boardRef}
            notes={notes}
            loading={loading}
            onOpen={(note) => setViewingNoteId(note.id)}
            onMove={handleMoveNote}
          />
        )}
      </div>

      {viewingNote && (
        <NoteDetailModal
          note={viewingNote}
          onClose={() => setViewingNoteId(null)}
          onEdit={openEditModal}
          onDelete={(note) => {
            setViewingNoteId(null);
            setDeleteTarget(note);
          }}
        />
      )}

      <NoteModal
        open={modalOpen}
        note={editingNote}
        loading={saving}
        onClose={closeModal}
        onSubmit={handleSubmitNote}
      />

      <DeleteNoteDialog
        note={deleteTarget}
        loading={deleting}
        onClose={() => {
          if (!deleting) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={handleDeleteNote}
      />
    </>
  );
}
