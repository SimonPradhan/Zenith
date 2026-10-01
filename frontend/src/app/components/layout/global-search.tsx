"use client";

import {
  CheckSquare,
  FileText,
  LayoutDashboard,
  Search,
  Settings,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { getNotes } from "@/lib/api/notes";
import { getTasks } from "@/lib/api/tasks";
import { getToken } from "@/lib/auth";

import type { Note } from "@/types/note";
import type { Task } from "@/types/task";

type SearchResult =
  | {
      type: "task";
      id: string;
      title: string;
      subtitle?: string;
    }
  | {
      type: "note";
      id: string;
      title: string;
      subtitle?: string;
    }
  | {
      type: "page";
      id: string;
      title: string;
      subtitle: string;
      href: string;
    };

const pages: SearchResult[] = [
  {
    type: "page",
    id: "dashboard",
    title: "Dashboard",
    subtitle: "Overview",
    href: "/dashboard",
  },
  {
    type: "page",
    id: "tasks",
    title: "Tasks",
    subtitle: "Manage your tasks",
    href: "/tasks",
  },
  {
    type: "page",
    id: "notes",
    title: "Notes",
    subtitle: "Manage your notes",
    href: "/notes",
  },
  {
    type: "page",
    id: "settings",
    title: "Settings",
    subtitle: "Manage your account",
    href: "/settings",
  },
];

const MAX_RESULTS = 5;

function getTaskSubtitle(task: Task) {
  if (task.status === "completed") {
    return "Completed";
  }

  if (task.due_date) {
    return `Due ${new Date(task.due_date).toLocaleDateString()}`;
  }

  return "Pending";
}

function getNoteSubtitle(note: Note) {
  return new Date(note.updated_at).toLocaleDateString();
}

function getIcon(result: SearchResult) {
  switch (result.type) {
    case "task":
      return CheckSquare;

    case "note":
      return FileText;

    case "page":
      if (result.id === "dashboard") return LayoutDashboard;
      if (result.id === "settings") return Settings;
      if (result.id === "tasks") return CheckSquare;

      return FileText;
  }
}

export default function GlobalSearch() {
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const displayedResults = query.trim() ? results : pages;

  useEffect(() => {
    function handleShortcut(event: globalThis.KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();

        setOpen(true);

        requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
      }

      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }

    window.addEventListener("keydown", handleShortcut);

    return () => {
      window.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  /*
   * Close when clicking outside.
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      const token = getToken();

      if (!token) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const [taskResponse, noteResponse] = await Promise.all([
          getTasks(token, {
            search: trimmedQuery,
            limit: MAX_RESULTS,
            offset: 0,
          }),
          getNotes(token, {
            search: trimmedQuery,
            limit: MAX_RESULTS,
            offset: 0,
          }),
        ]);

        const taskResults: SearchResult[] = taskResponse.items.map((task) => ({
          type: "task",
          id: task.id,
          title: task.title,
          subtitle: getTaskSubtitle(task),
        }));

        const noteResults: SearchResult[] = noteResponse.items.map((note) => ({
          type: "note",
          id: note.id,
          title: note.title,
          subtitle: getNoteSubtitle(note),
        }));

        setResults([...taskResults, ...noteResults]);
        setSelectedIndex(0);
      } catch (error) {
        console.error("Global search failed:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [query]);

  function openResult(result: SearchResult) {
    if (result.type === "page") {
      router.push(result.href);
    }

    if (result.type === "task") {
      router.push(`/tasks?search=${encodeURIComponent(result.title)}`);
    }

    if (result.type === "note") {
      router.push(`/notes?search=${encodeURIComponent(result.title)}`);
    }

    setOpen(false);
    setQuery("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (results.length === 0) return;

      setSelectedIndex((current) =>
        current >= results.length - 1 ? 0 : current + 1,
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

     if (displayedResults.length === 0) return;

      setSelectedIndex((current) =>
        current <= 0 ? results.length - 1 : current - 1,
      );
    }

    if (event.key === "Enter") {
      event.preventDefault();

      const selected = displayedResults[selectedIndex];

      if (selected) {
        openResult(selected);
      }
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  }

  const groupedResults = {
    tasks: displayedResults.filter((result) => result.type === "task"),
    notes: displayedResults.filter((result) => result.type === "note"),
    pages: displayedResults.filter((result) => result.type === "page"),
  };

  let resultCounter = -1;

  return (
    <div
      ref={containerRef}
      className="relative hidden max-w-md flex-1 sm:block"
    >
      <div className="relative">
        <Search
          size={17}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />

        <input
          ref={inputRef}
          type="search"
          value={query}
          onFocus={() => {
            setOpen(true);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search tasks, notes..."
          className="h-10 w-full rounded-xl border border-border bg-surface pl-10 pr-20 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary/60 focus:bg-surface-elevated focus:ring-2 focus:ring-primary/10"
        />

        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-10 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-muted transition hover:bg-surface-elevated hover:text-text-primary"
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        ) : null}

        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-border bg-surface-elevated px-1.5 py-0.5 text-[10px] text-text-muted">
          ⌘ K
        </kbd>
      </div>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-2xl shadow-black/30">
          <div className="max-h-[420px] overflow-y-auto p-2">
            {!query.trim() ? (
              <div className="mb-2 px-2 pb-1 pt-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
                  Quick navigation
                </p>
              </div>
            ) : null}

            {loading ? (
              <div className="space-y-1 p-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-lg p-2.5"
                  >
                    <div className="h-9 w-9 animate-pulse rounded-lg bg-surface" />

                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-2/3 animate-pulse rounded bg-surface" />
                      <div className="h-2.5 w-1/3 animate-pulse rounded bg-surface" />
                    </div>
                  </div>
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Search
                  size={22}
                  className="mx-auto mb-3 text-text-muted"
                />

                <p className="text-sm font-medium text-text-primary">
                  No results found
                </p>

                <p className="mt-1 text-xs text-text-muted">
                  Try a different search term.
                </p>
              </div>
            ) : (
              <>
                {groupedResults.pages.length > 0 ? (
                  <SearchSection
                    title="Pages"
                    results={groupedResults.pages}
                    selectedIndex={selectedIndex}
                    getCounter={() => ++resultCounter}
                    onSelect={openResult}
                    getIcon={getIcon}
                  />
                ) : null}

                {groupedResults.tasks.length > 0 ? (
                  <SearchSection
                    title="Tasks"
                    results={groupedResults.tasks}
                    selectedIndex={selectedIndex}
                    getCounter={() => ++resultCounter}
                    onSelect={openResult}
                    getIcon={getIcon}
                  />
                ) : null}

                {groupedResults.notes.length > 0 ? (
                  <SearchSection
                    title="Notes"
                    results={groupedResults.notes}
                    selectedIndex={selectedIndex}
                    getCounter={() => ++resultCounter}
                    onSelect={openResult}
                    getIcon={getIcon}
                  />
                ) : null}
              </>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border bg-background/40 px-3 py-2 text-[10px] text-text-muted">
            <div className="flex items-center gap-3">
              <span>
                <kbd className="mr-1 rounded border border-border px-1 py-0.5">
                  ↑
                </kbd>
                <kbd className="rounded border border-border px-1 py-0.5">
                  ↓
                </kbd>{" "}
                Navigate
              </span>

              <span>
                <kbd className="mr-1 rounded border border-border px-1 py-0.5">
                  ↵
                </kbd>
                Open
              </span>
            </div>

            <span>
              <kbd className="mr-1 rounded border border-border px-1 py-0.5">
                Esc
              </kbd>
              Close
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type SearchSectionProps = {
  title: string;
  results: SearchResult[];
  selectedIndex: number;
  getCounter: () => number;
  onSelect: (result: SearchResult) => void;
  getIcon: (result: SearchResult) => typeof Search;
};

function SearchSection({
  title,
  results,
  selectedIndex,
  getCounter,
  onSelect,
  getIcon,
}: SearchSectionProps) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="px-2 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-text-muted">
        {title}
      </div>

      {results.map((result) => {
        const index = getCounter();
        const Icon = getIcon(result);
        const selected = index === selectedIndex;

        return (
          <button
            key={`${result.type}-${result.id}`}
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              onSelect(result);
            }}
            className={`flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition ${
              selected
                ? "bg-primary/10 text-text-primary"
                : "text-text-secondary hover:bg-surface hover:text-text-primary"
            }`}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                selected
                  ? "bg-primary/15 text-primary"
                  : "bg-surface text-text-muted"
              }`}
            >
              <Icon size={17} />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {result.title}
              </span>

              <span className="mt-0.5 block truncate text-xs text-text-muted">
                {result.subtitle}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
