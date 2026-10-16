"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  FileText,
  LoaderCircle,
  Plus,
  RotateCcw,
} from "lucide-react";
import NepaliDate from "nepali-date-converter";

import { getTasks } from "@/lib/api/tasks";
import type { Task } from "@/types/task";
import type { Note } from "@/types/note";

type CalendarMode = "en" | "np";

const EN_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const EN_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const NP_WEEKDAYS = [
  "आइत",
  "सोम",
  "मंगल",
  "बुध",
  "बिही",
  "शुक्र",
  "शनि",
];

type CalendarWidgetProps = {
  token: string;
  notes: Note[];
  onCreateTask: () => void;
  onTaskClick: (task: Task) => void;
};

type TaskRequestState = {
  key: string;
  status: "loading" | "success" | "error";
  error?: string;
};

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function localDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDaysInEnglishMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getDaysInNepaliMonth(year: number, month: number) {
  const first = new NepaliDate(year, month, 1).toJsDate();
  const next = new NepaliDate(year, month + 1, 1).toJsDate();

  return Math.round(
    (localDate(next).getTime() - localDate(first).getTime()) / 86400000,
  );
}

export default function CalendarWidget({
  token,
  notes,
  onCreateTask,
  onTaskClick,
}: CalendarWidgetProps) {
  const [mode, setMode] = useState<CalendarMode>("en");

  const [today] = useState(() => localDate(new Date()));

  const [selectedDate, setSelectedDate] = useState(() =>
    localDate(new Date()),
  );

  const [englishView, setEnglishView] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [nepaliView, setNepaliView] = useState(() => {
    const now = new NepaliDate(new Date());

    return {
      year: now.getYear(),
      month: now.getMonth(),
    };
  });

  const [monthTasks, setMonthTasks] = useState<Task[]>([]);

  // Request state is updated only when an asynchronous request finishes.
  // Loading is derived from the currently visible month's request key.
  const [requestState, setRequestState] = useState<TaskRequestState>({
    key: "",
    status: "loading",
  });

  const todayNepali = useMemo(() => new NepaliDate(today), [today]);

  const selectedNepali = useMemo(
    () => new NepaliDate(selectedDate),
    [selectedDate],
  );

  const visibleMonth = useMemo(() => {
    if (mode === "en") {
      return {
        start: new Date(
          englishView.getFullYear(),
          englishView.getMonth(),
          1,
        ),
        end: new Date(
          englishView.getFullYear(),
          englishView.getMonth() + 1,
          1,
        ),
      };
    }

    return {
      start: new NepaliDate(
        nepaliView.year,
        nepaliView.month,
        1,
      ).toJsDate(),
      end: new NepaliDate(
        nepaliView.year,
        nepaliView.month + 1,
        1,
      ).toJsDate(),
    };
  }, [mode, englishView, nepaliView]);

  const requestKey = useMemo(
    () =>
      [
        token,
        visibleMonth.start.getTime(),
        visibleMonth.end.getTime(),
      ].join(":"),
    [token, visibleMonth.start, visibleMonth.end],
  );

  const loadingTasks =
    requestState.key !== requestKey ||
    requestState.status === "loading";

  const taskError =
    requestState.key === requestKey && requestState.status === "error"
      ? requestState.error ?? "Could not load tasks."
      : null;

  useEffect(() => {
    let cancelled = false;

    getTasks(token, {
      limit: 100,
      due_from: visibleMonth.start.toISOString(),
      due_to: new Date(
        visibleMonth.end.getTime() - 1,
      ).toISOString(),
      order_by_due_date: true,
    })
      .then((response) => {
        if (cancelled) return;

        setMonthTasks(response.items);

        setRequestState({
          key: requestKey,
          status: "success",
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;

        setRequestState({
          key: requestKey,
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Could not load tasks.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [token, requestKey, visibleMonth.start, visibleMonth.end]);

  const selectedTasks = useMemo(
    () =>
      monthTasks.filter(
        (task) =>
          task.due_date &&
          dateKey(new Date(task.due_date)) === dateKey(selectedDate),
      ),
    [monthTasks, selectedDate],
  );

  const selectedNotes = useMemo(
    () =>
      notes.filter(
        (note) =>
          dateKey(new Date(note.created_at)) === dateKey(selectedDate),
      ),
    [notes, selectedDate],
  );

  const taskDates = useMemo(
    () =>
      new Set(
        monthTasks
          .filter((task) => task.due_date)
          .map((task) => dateKey(new Date(task.due_date!))),
      ),
    [monthTasks],
  );

  const noteDates = useMemo(
    () => new Set(notes.map((note) => dateKey(new Date(note.created_at)))),
    [notes],
  );

  const days = useMemo(() => {
    if (mode === "en") {
      const year = englishView.getFullYear();
      const month = englishView.getMonth();
      const offset = new Date(year, month, 1).getDay();
      const count = getDaysInEnglishMonth(year, month);

      return Array.from({ length: offset + count }, (_, index) => {
        if (index < offset) return null;

        const day = index - offset + 1;
        const date = new Date(year, month, day);

        return {
          day,
          date,
          secondary: new NepaliDate(date).getDate(),
          label: date.toLocaleDateString(),
        };
      });
    }

    const { year, month } = nepaliView;
    const first = new NepaliDate(year, month, 1).toJsDate();
    const offset = first.getDay();
    const count = getDaysInNepaliMonth(year, month);

    return Array.from({ length: offset + count }, (_, index) => {
      if (index < offset) return null;

      const day = index - offset + 1;
      const date = new NepaliDate(year, month, day).toJsDate();

      return {
        day,
        date,
        secondary: date.getDate(),
        label: date.toLocaleDateString(),
      };
    });
  }, [mode, englishView, nepaliView]);

  const title =
    mode === "en"
      ? `${EN_MONTHS[englishView.getMonth()]} ${englishView.getFullYear()}`
      : toNepaliDigits(
          new NepaliDate(
            nepaliView.year,
            nepaliView.month,
            1,
          ).format("MMMM YYYY", "np"),
        );

  function moveMonth(direction: -1 | 1) {
    if (mode === "en") {
      setEnglishView(
        (current) =>
          new Date(
            current.getFullYear(),
            current.getMonth() + direction,
            1,
          ),
      );
      return;
    }

    const moved = new NepaliDate(
      nepaliView.year,
      nepaliView.month + direction,
      1,
    );

    setNepaliView({
      year: moved.getYear(),
      month: moved.getMonth(),
    });
  }

  function goToToday() {
    setSelectedDate(today);

    setEnglishView(
      new Date(today.getFullYear(), today.getMonth(), 1),
    );

    setNepaliView({
      year: todayNepali.getYear(),
      month: todayNepali.getMonth(),
    });
  }

  return (
    <section className="comic-paper-widget flex h-full min-h-[420px] min-w-0 flex-col overflow-hidden rounded-sm border-2 border-[#28251f] bg-[#fffaf0]">
      <header className="comic-widget-header flex shrink-0 flex-wrap items-start justify-between gap-2 border-b-2 border-[#28251f]/80 bg-[#efaaa7]/70 px-4 py-4 sm:gap-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-[#28251f] bg-[#efaaa7] text-[#28251f] shadow-[2px_2px_0_#28251f]">
            <CalendarDays size={18} />
          </span>

          <div className="min-w-0">
            <h3 className="comic-heading truncate text-xl text-[#28251f]">Calendar</h3>

            <p className="truncate text-xs text-text-muted">
              {mode === "en"
                ? `Today · BS ${toNepaliDigits(todayNepali.format("DD MMM YYYY", "np"))}`
                : `आज · AD ${today.toLocaleDateString("ne-NP", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}`}
            </p>
          </div>
        </div>

        <div
          className="inline-flex shrink-0 border-2 border-[#28251f]/60 bg-[#e9e0cf] p-1"
          aria-label="Calendar type"
        >
          <button
            type="button"
            onClick={() => setMode("en")}
            aria-pressed={mode === "en"}
            className={`px-2 py-1 text-xs font-bold transition ${
              mode === "en"
                ? "border border-[#28251f] bg-[#f4d64f] text-[#28251f] shadow-[2px_2px_0_#28251f]"
                : "text-[#28251f]/70 hover:bg-[#fffaf0]"
            }`}
          >
            AD
          </button>

          <button
            type="button"
            onClick={() => setMode("np")}
            aria-pressed={mode === "np"}
            className={`px-2 py-1 text-xs font-bold transition ${
              mode === "np"
                ? "border border-[#28251f] bg-[#f4d64f] text-[#28251f] shadow-[2px_2px_0_#28251f]"
                : "text-[#28251f]/70 hover:bg-[#fffaf0]"
            }`}
          >
            नेपाली
          </button>
        </div>
      </header>

      <div className="mt-3 flex items-center justify-between gap-1 sm:mt-4 sm:gap-2 px-4">
        <button
          type="button"
          onClick={() => moveMonth(-1)}
          aria-label="Previous month"
          className="border-2 border-[#28251f]/60 bg-[#fffaf0] p-2 text-[#28251f] transition hover:bg-[#f4d64f] hover:shadow-[2px_2px_0_#28251f]"
        >
          <ChevronLeft size={16} />
        </button>

        <h4
          className="comic-heading min-w-0 truncate text-center text-lg text-[#28251f]"
          aria-live="polite"
        >
          {title}
        </h4>

        <button
          type="button"
          onClick={() => moveMonth(1)}
          aria-label="Next month"
          className="border-2 border-[#28251f]/60 bg-[#fffaf0] p-2 text-[#28251f] transition hover:bg-[#f4d64f] hover:shadow-[2px_2px_0_#28251f]"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="mt-3 grid shrink-0 grid-cols-7 gap-0.5 sm:gap-1 px-4">
        {(mode === "en" ? EN_WEEKDAYS : NP_WEEKDAYS).map((weekday) => (
          <div
            key={weekday}
            className="min-w-0 border-b border-dashed border-[#28251f]/30 py-1 text-center text-[10px] font-bold uppercase tracking-wide text-[#28251f]/70"
          >
            {weekday}
          </div>
        ))}

        {days.map((item, index) => {
          if (!item) {
            return (
              <span
                key={`empty-${index}`}
                aria-hidden="true"
                className="min-w-0"
              />
            );
          }

          const itemKey = dateKey(item.date);
          const isToday = itemKey === dateKey(today);
          const isSelected = itemKey === dateKey(selectedDate);

          const secondaryDay = item.secondary;

          const hasTasks = taskDates.has(itemKey);
          const hasNotes = noteDates.has(itemKey);

          return (
            <button
              key={itemKey}
              type="button"
              onClick={() => setSelectedDate(localDate(item.date))}
              aria-label={item.date.toLocaleDateString()}
              aria-pressed={isSelected}
              className={`relative flex min-h-8 min-w-0 flex-col items-center justify-center border border-transparent text-[11px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28251f] sm:min-h-9 sm:text-xs ${
                isSelected
                  ? "border-[#28251f] bg-[#f4d64f] font-bold text-[#28251f] shadow-[2px_2px_0_#28251f]"
                  : isToday
                    ? "border-2 border-[#28251f] bg-[#c4e3e0] font-bold text-[#28251f]"
                    : "text-[#28251f] hover:border-[#28251f]/40 hover:bg-[#efaaa7]/30"
              }`}
            >
              <span className="font-medium leading-4">
                {mode === "np"
                  ? toNepaliDigits(item.day)
                  : item.day}
              </span>

              <span
                className={`text-[8px] leading-3 ${
                  isSelected ? "text-[#28251f]/70" : "text-[#28251f]/60"
                }`}
              >
                {toNepaliDigits(secondaryDay)}
              </span>

              {(hasTasks || hasNotes) && (
                <span
                  className="absolute bottom-0.5 flex items-center gap-0.5"
                  aria-label="Has agenda items"
                >
                  {hasTasks && (
                    <span
                      className={`h-1 w-1 rounded-full ${
                        isSelected ? "bg-[#28251f]" : "bg-[#28251f]"
                      }`}
                    />
                  )}

                  {hasNotes && (
                    <span
                      className={`h-1 w-1 rounded-full ${
                        isSelected ? "bg-[#28251f]/60" : "bg-[#d48a30]"
                      }`}
                    />
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <section
        className="mt-3 flex min-h-[100px] min-w-0 flex-1 flex-col overflow-hidden border-t-2 border-dashed border-[#28251f]/35 px-4 pt-3"
        aria-label="Selected date agenda"
      >
        <div className="mb-2 flex items-center justify-between gap-2 ">
          <div className="min-w-0">
            <p className="text-xs text-text-muted">Agenda</p>

            <p className="truncate text-sm font-semibold">
              {mode === "en"
                ? selectedDate.toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })
                : toNepaliDigits(selectedNepali.format("DD MMMM YYYY", "np"))}
            </p>
          </div>

          <button
            type="button"
            onClick={onCreateTask}
            className="comic-action inline-flex shrink-0 items-center gap-1 border-2 border-[#28251f] bg-[#f4d64f] px-2.5 py-2 text-xs font-bold text-[#28251f] shadow-[2px_2px_0_#28251f] transition hover:-translate-y-0.5"
            aria-label="Create a task"
          >
            <Plus size={13} />
            Task
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain bg-[radial-gradient(#28251f0b_1px,transparent_1px)] bg-[length:10px_10px] pr-1">
          {loadingTasks ? (
            <p className="flex items-center gap-2 py-2 text-xs text-text-muted">
              <LoaderCircle size={14} className="animate-spin" />
              Loading agenda…
            </p>
          ) : taskError ? (
            <p role="status" className="py-2 text-xs text-error">
              {taskError}
            </p>
          ) : selectedTasks.length === 0 && selectedNotes.length === 0 ? (
            <p className="py-2 text-xs text-text-muted">
              Nothing planned for this date yet.
            </p>
          ) : (
            <>
              {selectedTasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => onTaskClick(task)}
                  className="flex w-full items-center gap-2 border-b border-dashed border-[#28251f]/15 px-2 py-2 text-left transition hover:bg-[#f4d64f]/25"
                >
                  {task.status === "completed" ? (
                    <CheckCircle2
                      size={15}
                      className="shrink-0 text-success"
                    />
                  ) : (
                    <Circle size={15} className="shrink-0 text-primary" />
                  )}

                  <span
                    className={`min-w-0 flex-1 truncate text-xs ${
                      task.status === "completed"
                        ? "text-text-muted line-through"
                        : "text-text-primary"
                    }`}
                  >
                    {task.title}
                  </span>

                  <span className="shrink-0 text-[10px] text-text-muted">
                    {task.priority}
                  </span>
                </button>
              ))}

              {selectedNotes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-center gap-2 border-b border-dashed border-[#28251f]/15 px-2 py-2"
                >
                  <FileText
                    size={14}
                    className="shrink-0 text-amber-600"
                  />

                  <span className="min-w-0 flex-1 truncate text-xs text-text-secondary">
                    {note.title || "Untitled note"}
                  </span>

                  <span className="shrink-0 text-[10px] text-text-muted">
                    Note
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </section>

      <footer className="mt-3 flex shrink-0 items-center justify-between gap-2 border-t-2 border-[#28251f]/70 bg-[#e9e0cf]/70 p-4 pt-3">
        <p className="min-w-0 truncate text-xs text-text-muted">
          {selectedTasks.length} task
          {selectedTasks.length === 1 ? "" : "s"} · {selectedNotes.length}{" "}
          note{selectedNotes.length === 1 ? "" : "s"}
        </p>

        <button
          type="button"
          onClick={goToToday}
          className="comic-action inline-flex shrink-0 items-center gap-1.5 border-2 border-[#28251f] bg-[#fffaf0] px-2.5 py-2 text-xs font-bold text-[#28251f] shadow-[2px_2px_0_#28251f] transition hover:-translate-y-0.5"
        >
          <RotateCcw size={13} />
          Today
        </button>
      </footer>
    </section>
  );
}


function toNepaliDigits(value: string | number): string {
  const digits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  return String(value).replace(/\d/g, (digit) => digits[Number(digit)]);
}
