"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  Search,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
} from "@/lib/api/notes";
import { getToken } from "@/lib/auth";

import { DeleteNoteDialog } from "@/app/components/notes/delete-note-dialog";
import { NoteList } from "@/app/components/notes/note-list";
import { NoteModal } from "@/app/components/notes/note-modal";

import type {
  Note,
  NoteCreate,
  NoteListResponse,
} from "@/types/note";

const PAGE_SIZE = 10;

export default function NotesPage() {
  const router = useRouter();


  const searchParams = useSearchParams();

  const [data, setData] = useState<NoteListResponse | null>(null);

  const [search, setSearch] = useState(() => {
    return searchParams.get("search") ?? "";
  });
  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  const [page, setPage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingNote, setEditingNote] =
    useState<Note | null>(null);

  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] =
    useState<Note | null>(null);

  const [deleting, setDeleting] = useState(false);

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
          limit: PAGE_SIZE,
          offset: page * PAGE_SIZE,
          search:
            debouncedSearch.trim() || undefined,
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
  }, [page, router, debouncedSearch]);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(0);
  }

  function openCreateModal() {
    setEditingNote(null);
    setModalOpen(true);
  }

  function openEditModal(note: Note) {
    setEditingNote(note);
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingNote(null);
  }

  async function handleSubmitNote(
    noteData: NoteCreate,
  ) {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setSaving(true);

    try {
      if (editingNote) {
        await updateNote(
          token,
          editingNote.id,
          noteData,
        );
      } else {
        await createNote(token, noteData);
      }

      setModalOpen(false);
      setEditingNote(null);

      const result = await getNotes(token, {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        search:
          debouncedSearch.trim() || undefined,
      });

      setData(result);
      setError("");
    } finally {
      setSaving(false);
    }
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
      await deleteNote(
        token,
        deleteTarget.id,
      );

      setDeleteTarget(null);

      const result = await getNotes(token, {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        search:
          debouncedSearch.trim() || undefined,
      });

      if (
        result.items.length === 0 &&
        page > 0
      ) {
        setPage(
          (currentPage) => currentPage - 1,
        );
        return;
      }

      setData(result);
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

  const totalPages = data
    ? Math.ceil(data.total / PAGE_SIZE)
    : 0;

  return (
    <>
      <div className="mx-auto max-w-[1400px] space-y-6">
        {/* Header */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 flex items-center gap-2 text-sm text-text-muted">
              <FileText size={15} />
              Workspace
            </p>

            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Notes
            </h1>

            <p className="mt-2 text-sm text-text-secondary">
              Capture ideas, information, and things worth keeping.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/10 transition hover:bg-primary-hover"
          >
            <Plus size={17} />
            New note
          </button>
        </section>

        {/* Search */}
        <section className="rounded-2xl border border-border bg-surface p-3">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                handleSearch(event.target.value)
              }
              placeholder="Search notes..."
              className="h-10 w-full rounded-xl border border-border bg-surface-elevated pl-10 pr-4 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </section>

        {/* Summary */}
        <div>
          <p className="text-sm font-medium">
            {data?.total ?? 0}{" "}
            {data?.total === 1
              ? "note"
              : "notes"}
          </p>

          <p className="mt-1 text-xs text-text-muted">
            {search
              ? `Matching "${search}"`
              : "All notes"}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-error/20 bg-error/10 p-4 text-sm text-error">
            {error}
          </div>
        )}

        {/* Notes */}
        <NoteList
          notes={data?.items ?? []}
          loading={loading}
          search={search}
          onEdit={openEditModal}
          onDelete={setDeleteTarget}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted">
              Page {page + 1} of {totalPages}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() =>
                  setPage(
                    (value) => value - 1,
                  )
                }
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-secondary transition hover:bg-surface-elevated hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  page >= totalPages - 1
                }
                onClick={() =>
                  setPage(
                    (value) => value + 1,
                  )
                }
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-secondary transition hover:bg-surface-elevated hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

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
