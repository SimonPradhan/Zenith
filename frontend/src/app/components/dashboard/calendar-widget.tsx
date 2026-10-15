"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import NepaliDate from "nepali-date-converter";
import { CheckCircle2, Circle, FileText, Plus, LoaderCircle } from "lucide-react";

import { getTasks } from "@/lib/api/tasks";
import type { Task } from "@/types/task";
import type { Note } from "@/types/note";

type CalendarMode = "en" | "np";

const EN_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const EN_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const NP_WEEKDAYS = ["आइत", "सोम", "मंगल", "बुध", "बिही", "शुक्र", "शनि"];

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
  return Math.round((localDate(next).getTime() - localDate(first).getTime()) / 86400000);
}

type CalendarWidgetProps = {
  token: string;
  notes: Note[];
  onCreateTask: () => void;
  onTaskClick: (task: Task) => void;
};

export default function CalendarWidget({ token, notes, onCreateTask, onTaskClick }: CalendarWidgetProps) {
  const [mode, setMode] = useState<CalendarMode>("en");
  const [today] = useState(() => localDate(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => localDate(new Date()));
  const [englishView, setEnglishView] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [nepaliView, setNepaliView] = useState(() => {
    const now = new NepaliDate(new Date());
    return { year: now.getYear(), month: now.getMonth() };
  });
  const [monthTasks, setMonthTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);

  const todayNepali = useMemo(() => new NepaliDate(today), [today]);
  const selectedNepali = useMemo(() => new NepaliDate(selectedDate), [selectedDate]);
  const visibleMonth = useMemo(() => {
    if (mode === "en") {
      return {
        start: new Date(englishView.getFullYear(), englishView.getMonth(), 1),
        end: new Date(englishView.getFullYear(), englishView.getMonth() + 1, 1),
      };
    }
    return {
      start: new NepaliDate(nepaliView.year, nepaliView.month, 1).toJsDate(),
      end: new NepaliDate(nepaliView.year, nepaliView.month + 1, 1).toJsDate(),
    };
  }, [mode, englishView, nepaliView]);

  useEffect(() => {
    let cancelled = false;
    setLoadingTasks(true);
    setTaskError(null);
    getTasks(token, {
      limit: 100,
      due_from: visibleMonth.start.toISOString(),
      due_to: visibleMonth.end.toISOString(),
      order_by_due_date: true,
    })
      .then((response) => {
        if (!cancelled) setMonthTasks(response.items);
      })
      .catch((error: unknown) => {
        if (!cancelled) setTaskError(error instanceof Error ? error.message : "Could not load tasks.");
      })
      .finally(() => {
        if (!cancelled) setLoadingTasks(false);
      });
    return () => { cancelled = true; };
  }, [token, visibleMonth]);

  const selectedTasks = useMemo(
    () => monthTasks.filter((task) =>
      task.due_date && dateKey(new Date(task.due_date)) === dateKey(selectedDate)
    ),
    [monthTasks, selectedDate],
  );
  const selectedNotes = useMemo(
    () => notes.filter((note) => dateKey(new Date(note.created_at)) === dateKey(selectedDate)),
    [notes, selectedDate],
  );
  const taskDates = useMemo(
    () => new Set(monthTasks.filter((task) => task.due_date).map((task) => dateKey(new Date(task.due_date!)))),
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
        return {
          day: index - offset + 1,
          date: new Date(year, month, index - offset + 1),
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
      return {
        day,
        date: new NepaliDate(year, month, day).toJsDate(),
      };
    });
  }, [mode, englishView, nepaliView]);

  const title = mode === "en"
    ? `${EN_MONTHS[englishView.getMonth()]} ${englishView.getFullYear()}`
    : new NepaliDate(nepaliView.year, nepaliView.month, 1).format("MMMM YYYY", "np");

  function moveMonth(direction: -1 | 1) {
    if (mode === "en") {
      setEnglishView((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1));
      return;
    }

    const moved = new NepaliDate(nepaliView.year, nepaliView.month + direction, 1);
    setNepaliView({ year: moved.getYear(), month: moved.getMonth() });
  }

  function goToToday() {
    setSelectedDate(today);
    const english = new Date(today.getFullYear(), today.getMonth(), 1);
    setEnglishView(english);
    setNepaliView({ year: todayNepali.getYear(), month: todayNepali.getMonth() });
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface p-4 text-text-primary">
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-elevated text-primary">
            <CalendarDays size={18} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">Calendar</h3>
            <p className="truncate text-xs text-text-muted">
              {mode === "en"
                ? `Today · BS ${todayNepali.format("DD MMM YYYY", "np")}`
                : `आज · AD ${today.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`}
            </p>
          </div>
        </div>
        <div className="inline-flex shrink-0 rounded-lg border border-border bg-surface-elevated p-1" aria-label="Calendar type">
          <button
            type="button"
            onClick={() => setMode("en")}
            aria-pressed={mode === "en"}
            className={`rounded-md px-2 py-1 text-xs font-medium transition ${mode === "en" ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
          >
            AD
          </button>
          <button
            type="button"
            onClick={() => setMode("np")}
            aria-pressed={mode === "np"}
            className={`rounded-md px-2 py-1 text-xs font-medium transition ${mode === "np" ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
          >
            नेपाली
          </button>
        </div>
      </header>

      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => moveMonth(-1)}
          aria-label="Previous month"
          className="rounded-lg border border-border p-2 text-text-secondary transition hover:bg-surface-elevated hover:text-text-primary"
        >
          <ChevronLeft size={16} />
        </button>
        <h4 className="text-sm font-semibold" aria-live="polite">{title}</h4>
        <button
          type="button"
          onClick={() => moveMonth(1)}
          aria-label="Next month"
          className="rounded-lg border border-border p-2 text-text-secondary transition hover:bg-surface-elevated hover:text-text-primary"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1">
        {(mode === "en" ? EN_WEEKDAYS : NP_WEEKDAYS).map((weekday) => (
          <div key={weekday} className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            {weekday}
          </div>
        ))}
        {days.map((item, index) => {
          if (!item) return <span key={`empty-${index}`} aria-hidden="true" />;
          const isToday = dateKey(item.date) === dateKey(today);
          const isSelected = dateKey(item.date) === dateKey(selectedDate);
          const secondaryDay = mode === "en"
            ? new NepaliDate(item.date).getDate()
            : item.date.getDate();

          return (
            <button
              key={dateKey(item.date)}
              type="button"
              onClick={() => setSelectedDate(localDate(item.date))}
              aria-label={item.date.toLocaleDateString()}
              aria-pressed={isSelected}
              className={`relative flex min-h-9 flex-col items-center justify-center rounded-lg text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isSelected ? "bg-primary text-white" : isToday ? "border border-primary text-primary" : "text-text-primary hover:bg-surface-elevated"}`}
            >
              <span className="font-medium leading-4">{mode === "np" ? item.day.toLocaleString("ne-NP") : item.day}</span>
              <span className={`text-[8px] leading-3 ${isSelected ? "text-white/80" : "text-text-muted"}`}>
                {mode === "en" ? secondaryDay.toLocaleString("ne-NP") : secondaryDay}
              </span>
              {(taskDates.has(dateKey(item.date)) || noteDates.has(dateKey(item.date))) && (
                <span className="absolute bottom-0.5 flex items-center gap-0.5" aria-label="Has agenda items">
                  {taskDates.has(dateKey(item.date)) && <span className={`h-1 w-1 rounded-full ${isSelected ? "bg-white" : "bg-primary"}`} />}
                  {noteDates.has(dateKey(item.date)) && <span className={`h-1 w-1 rounded-full ${isSelected ? "bg-white/70" : "bg-amber-500"}`} />}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <section className="mt-3 flex min-h-0 flex-1 flex-col border-t border-border pt-3" aria-label="Selected date agenda">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-text-muted">Agenda</p>
            <p className="truncate text-sm font-semibold">
              {mode === "en"
                ? selectedDate.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
                : selectedNepali.format("DD MMMM YYYY", "np")}
            </p>
          </div>
          <button type="button" onClick={onCreateTask} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary px-2.5 py-2 text-xs font-medium text-white transition hover:bg-primary-hover" aria-label="Create a task">
            <Plus size={13} /> Task
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pr-1">
          {loadingTasks ? (
            <p className="flex items-center gap-2 py-2 text-xs text-text-muted"><LoaderCircle size={14} className="animate-spin" /> Loading agenda…</p>
          ) : taskError ? (
            <p role="status" className="py-2 text-xs text-error">{taskError}</p>
          ) : selectedTasks.length === 0 && selectedNotes.length === 0 ? (
            <p className="py-2 text-xs text-text-muted">Nothing planned for this date yet.</p>
          ) : (
            <>
              {selectedTasks.map((task) => (
                <button key={task.id} type="button" onClick={() => onTaskClick(task)} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition hover:bg-surface-elevated">
                  {task.status === "completed" ? <CheckCircle2 size={15} className="shrink-0 text-success" /> : <Circle size={15} className="shrink-0 text-primary" />}
                  <span className={`min-w-0 flex-1 truncate text-xs ${task.status === "completed" ? "text-text-muted line-through" : "text-text-primary"}`}>{task.title}</span>
                  <span className="shrink-0 text-[10px] text-text-muted">{task.priority}</span>
                </button>
              ))}
              {selectedNotes.map((note) => (
                <div key={note.id} className="flex items-center gap-2 rounded-lg px-2 py-2">
                  <FileText size={14} className="shrink-0 text-amber-600" />
                  <span className="min-w-0 flex-1 truncate text-xs text-text-secondary">{note.title || "Untitled note"}</span>
                  <span className="shrink-0 text-[10px] text-text-muted">Note</span>
                </div>
              ))}
            </>
          )}
        </div>
      </section>

      <footer className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
        <p className="text-xs text-text-muted">{selectedTasks.length} task{selectedTasks.length === 1 ? "" : "s"} · {selectedNotes.length} note{selectedNotes.length === 1 ? "" : "s"}</p>
        <button
          type="button"
          onClick={goToToday}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 py-2 text-xs font-medium text-text-secondary transition hover:bg-surface-elevated hover:text-text-primary"
        >
          <RotateCcw size={13} />
          Today
        </button>
      </footer>
    </section>
  );
}
