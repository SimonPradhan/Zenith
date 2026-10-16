"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Responsive, verticalCompactor } from "react-grid-layout";
import { GripVertical, Plus, RotateCcw, X } from "lucide-react";

import DashboardStats from "@/app/components/dashboard/dashboard-stats";
import TodayTasks from "@/app/components/dashboard/today-tasks";
import RecentNotes from "@/app/components/dashboard/recent-notes";
import OverdueTasks from "@/app/components/dashboard/overdue-tasks";
import TaskProgressCard from "@/app/components/dashboard/task-progress-card";
import QuickActions from "@/app/components/dashboard/quick-actions";
import CalendarWidget from "@/app/components/dashboard/calendar-widget";

import type { Task } from "@/types/task";
import type { Note } from "@/types/note";
import type {
  DashboardPreferences,
  DashboardWidgetId,
  DashboardWidgetLayout,
} from "@/types/dashboard";

import {
  DASHBOARD_WIDGETS,
  getDefaultDashboardLayout,
} from "@/app/components/dashboard/widget-registry";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import {
  getDashboardPreferences,
  saveDashboardPreferences,
} from "@/lib/api/dashboard-preferences";

type Breakpoint = "lg" | "md" | "sm" | "xs" | "xxs";

const GRID_MARGIN: [number, number] = [12, 12];
const GRID_CONTAINER_PADDING: [number, number] = [0, 0];

const GRID_RESIZE_CONFIG = {
  enabled: false,
  handles: ["se"] as ("s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne")[],
};

type GridItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
};

type GridLayouts = Record<Breakpoint, GridItem[]>;

type SaveStatus = "saved" | "saving" | "error" | null;

const DASHBOARD_LAYOUT_STORAGE_KEY = "zenith_dashboard_layouts_v1";

const BREAKPOINT_KEYS: Breakpoint[] = ["lg", "md", "sm", "xs", "xxs"];

const BREAKPOINTS = {
  lg: 860,
  md: 640,
  sm: 480,
  xs: 360,
  xxs: 0,
};

const COLUMNS: Record<Breakpoint, number> = {
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4,
  xxs: 2,
};

type MasonrySpec = { x: number; w: number; h: number };

const MASONRY_LG: Record<string, MasonrySpec> = {
  stats: { x: 0, w: 12, h: 2 },
  "today-tasks": { x: 0, w: 4, h: 6 },
  "recent-notes": { x: 4, w: 4, h: 8 },
  "task-progress": { x: 8, w: 4, h: 4 },
  "overdue-tasks": { x: 8, w: 4, h: 4 },
  calendar: { x: 0, w: 4, h: 7 },
  "quick-actions": { x: 4, w: 4, h: 3 },
};

const MASONRY_MD: Record<string, MasonrySpec> = {
  stats: { x: 0, w: 10, h: 2 },
  "today-tasks": { x: 0, w: 5, h: 6 },
  "recent-notes": { x: 5, w: 5, h: 8 },
  "task-progress": { x: 0, w: 5, h: 4 },
  "overdue-tasks": { x: 5, w: 5, h: 4 },
  calendar: { x: 0, w: 5, h: 7 },
  "quick-actions": { x: 5, w: 5, h: 3 },
};

function isGridItem(value: unknown): value is GridItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.i === "string" &&
    DASHBOARD_WIDGETS.some((widget) => widget.id === item.i) &&
    typeof item.x === "number" &&
    Number.isFinite(item.x) &&
    typeof item.y === "number" &&
    Number.isFinite(item.y) &&
    typeof item.w === "number" &&
    Number.isFinite(item.w) &&
    item.w > 0 &&
    typeof item.h === "number" &&
    Number.isFinite(item.h) &&
    item.h > 0 &&
    item.x >= 0 &&
    item.y >= 0
  );
}

function toGridItem(item: DashboardWidgetLayout): GridItem {
  const definition = DASHBOARD_WIDGETS.find((widget) => widget.id === item.id);

  return {
    i: item.id,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    minW: definition?.minW ?? 2,
    minH: definition?.minH ?? 2,
    maxW: definition?.maxW,
    maxH: definition?.maxH,
  };
}

function applyMasonry(
  item: DashboardWidgetLayout,
  columns: number,
  spec: MasonrySpec,
): GridItem {
  const base = toGridItem(item);

  const minW = Math.min(base.minW ?? 2, columns);
  const maxW = Math.min(base.maxW ?? columns, columns);
  const w = Math.max(minW, Math.min(maxW, spec.w));
  const h = Math.max(base.minH ?? 2, spec.h);

  return {
    ...base,
    x: Math.max(0, Math.min(spec.x, columns - w)),
    w,
    h,
    minW,
    maxW,
  };
}

function placeMasonry(items: GridItem[]): GridItem[] {
  const placed: GridItem[] = [];

  for (const item of items) {
    let y = 0;

    for (const other of placed) {
      const overlapsHorizontally =
        item.x < other.x + other.w && item.x + item.w > other.x;

      if (overlapsHorizontally) {
        y = Math.max(y, other.y + other.h);
      }
    }

    placed.push({ ...item, y });
  }

  return placed;
}

function createDefaultLayouts(): GridLayouts {
  const defaults = getDefaultDashboardLayout();

  const desktop = placeMasonry(
    defaults.map((item) => {
      const spec = MASONRY_LG[item.id];
      return spec ? applyMasonry(item, COLUMNS.lg, spec) : toGridItem(item);
    }),
  );

  const tablet = placeMasonry(
    defaults.map((item) => {
      const spec = MASONRY_MD[item.id];

      if (spec) {
        return applyMasonry(item, COLUMNS.md, spec);
      }

      const definition = DASHBOARD_WIDGETS.find(
        (widget) => widget.id === item.id,
      );

      const minW = Math.min(definition?.minW ?? 2, COLUMNS.md);
      const maxW = Math.min(definition?.maxW ?? COLUMNS.md, COLUMNS.md);
      const w = Math.max(
        minW,
        Math.min(maxW, Math.round((item.w / COLUMNS.lg) * COLUMNS.md)),
      );

      return {
        ...toGridItem(item),
        x: Math.min(
          COLUMNS.md - w,
          Math.round((item.x / COLUMNS.lg) * COLUMNS.md),
        ),
        w,
        minW,
        maxW,
      };
    }),
  );

  function stackItems(columns: number): GridItem[] {
    let y = 0;

    return desktop.map((item) => {
      const definition = DASHBOARD_WIDGETS.find(
        (widget) => widget.id === item.i,
      );

      const gridItem: GridItem = {
        i: item.i,
        x: 0,
        y,
        w: columns,
        h: item.h,
        minW: Math.min(definition?.minW ?? 2, columns),
        minH: definition?.minH ?? 2,
        maxW: columns,
        maxH: definition?.maxH,
      };

      y += item.h;
      return gridItem;
    });
  }

  return {
    lg: desktop,
    md: tablet,
    sm: stackItems(COLUMNS.sm),
    xs: stackItems(COLUMNS.xs),
    xxs: stackItems(COLUMNS.xxs),
  };
}

function parseLayouts(raw: unknown): GridLayouts | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }

  const candidate = raw as Record<string, unknown>;
  const restored = {} as GridLayouts;
  const defaults = createDefaultLayouts();

  for (const breakpoint of BREAKPOINT_KEYS) {
    const items = candidate[breakpoint];

    if (!Array.isArray(items)) {
      return null;
    }

    const seen = new Set<string>();
    const entries: GridItem[] = [];
    const columns = COLUMNS[breakpoint];

    for (const value of items) {
      if (!isGridItem(value) || seen.has(value.i)) {
        continue;
      }

      const definition = DASHBOARD_WIDGETS.find(
        (widget) => widget.id === value.i,
      );

      if (!definition) {
        continue;
      }

      seen.add(value.i);

      const minW = Math.min(definition.minW, columns);
      const maxW = Math.min(definition.maxW ?? columns, columns);
      const w = Math.max(minW, Math.min(maxW, value.w));
      const h = Math.max(definition.minH, value.h);

      entries.push({
        i: value.i,
        x: Math.max(0, Math.min(value.x, columns - w)),
        y: Math.max(0, value.y),
        w,
        h,
        minW,
        minH: definition.minH,
        maxW,
        maxH: definition.maxH,
      });
    }

    restored[breakpoint] =
      entries.length > 0 || items.length === 0
        ? entries
        : [...defaults[breakpoint]];
  }

  return restored;
}

function readSavedLayouts(): GridLayouts | null {
  try {
    const raw = localStorage.getItem(DASHBOARD_LAYOUT_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    return parseLayouts(JSON.parse(raw));
  } catch {
    return null;
  }
}

function saveLayoutsLocally(layouts: GridLayouts): void {
  try {
    localStorage.setItem(DASHBOARD_LAYOUT_STORAGE_KEY, JSON.stringify(layouts));
  } catch {
    // Ignore local storage quota or availability errors.
  }
}

type CustomizableDashboardProps = {
  token: string;
  todayTasks: Task[];
  overdueTasks: Task[];
  notes: Note[];
  totalTasks: number;
  pendingCount: number;
  completedCount: number;
  totalNotes: number;
  completionRate: number;
  onCreateTask: () => void;
  onCreateNote: () => void;
  onViewTasks: () => void;
  onViewNotes: () => void;
  onTaskClick: (task: Task) => void;
  onNoteClick: (note: Note) => void;
};

export default function CustomizableDashboard({
  token,
  todayTasks,
  overdueTasks,
  notes,
  totalTasks,
  pendingCount,
  completedCount,
  totalNotes,
  completionRate,
  onCreateTask,
  onCreateNote,
  onViewTasks,
  onViewNotes,
  onTaskClick,
  onNoteClick,
}: CustomizableDashboardProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const element = containerRef.current;
    const section = sectionRef.current;

    if (!element || !section) return;

    let committedWidth = Math.floor(element.getBoundingClientRect().width);
    let frame = 0;
    let settleTimer: number | undefined;

    setWidth(committedWidth);

    const commitWidth = () => {
      frame = 0;

      const next = Math.floor(element.getBoundingClientRect().width);

      if (next === committedWidth) return;
      committedWidth = next;

      section.dataset.resizing = "true";
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        delete section.dataset.resizing;
      }, 160);

      setWidth(next);
    };

    const observer = new ResizeObserver(() => {
      if (frame === 0) {
        frame = requestAnimationFrame(commitWidth);
      }
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
    };
  }, []);

  const [layouts, setLayouts] = useState<GridLayouts>(createDefaultLayouts);
  const [editing, setEditing] = useState(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(null);

  const layoutsRef = useRef<GridLayouts>(layouts);
  const hasUserChangedLayout = useRef(false);
  const saveTimer = useRef<number | null>(null);

  const dragConfig = useMemo(
    () => ({
      enabled: editing,
      handle: ".dashboard-widget-handle",
      cancel:
        "button, a, input, textarea, select, [contenteditable='true'], .dashboard-widget-content",
    }),
    [editing],
  );

  const resizeConfig = useMemo(
    () => ({ ...GRID_RESIZE_CONFIG, enabled: editing }),
    [editing],
  );

  useEffect(() => {
    layoutsRef.current = layouts;
  }, [layouts]);


  useEffect(() => {
    let cancelled = false;

    async function loadPreferences() {
      setPreferencesLoaded(false);

      try {
        const response = await getDashboardPreferences(token);

        if (cancelled) {
          return;
        }

        const backendLayouts = parseLayouts(response.preferences.layouts);
        const localLayouts = readSavedLayouts();

        const initialLayouts =
          backendLayouts ?? localLayouts ?? createDefaultLayouts();

        layoutsRef.current = initialLayouts;
        hasUserChangedLayout.current = false;

        setLayouts(initialLayouts);
        saveLayoutsLocally(initialLayouts);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Failed to load dashboard preferences:", error);

        const fallback = readSavedLayouts() ?? createDefaultLayouts();

        layoutsRef.current = fallback;
        hasUserChangedLayout.current = false;

        setLayouts(fallback);
      } finally {
        if (!cancelled) {
          setPreferencesLoaded(true);
        }
      }
    }

    void loadPreferences();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const persistLayouts = useCallback(async () => {
    const layoutsToSave = layoutsRef.current;

    saveLayoutsLocally(layoutsToSave);
    setSaveStatus("saving");

    try {
      const response = await saveDashboardPreferences(token, {
        layouts: layoutsToSave,
      } as DashboardPreferences);

      if (layoutsRef.current === layoutsToSave) {
        hasUserChangedLayout.current = false;
      }

      console.debug("Dashboard preferences saved:", response);
      setSaveStatus("saved");
    } catch (error) {
      console.error("Failed to save dashboard preferences:", error);
      setSaveStatus("error");
    }
  }, [token]);

  useEffect(() => {
    if (!preferencesLoaded || !hasUserChangedLayout.current) {
      return;
    }

    setSaveStatus("saving");

    const timeoutId = window.setTimeout(() => {
      saveTimer.current = null;
      void persistLayouts();
    }, 800);

    saveTimer.current = timeoutId;

    return () => window.clearTimeout(timeoutId);
  }, [layouts, preferencesLoaded, persistLayouts]);

  const visibleIds = useMemo(
    () => new Set(layouts.lg.map((item) => item.i)),
    [layouts],
  );

  const availableWidgets = DASHBOARD_WIDGETS.filter(
    (widget) => !visibleIds.has(widget.id),
  );

  const commitLayouts = useCallback((next: GridLayouts) => {
    layoutsRef.current = next;
    hasUserChangedLayout.current = true;

    saveLayoutsLocally(next);
    setLayouts(next);
  }, []);

  async function finishEditing() {
    setEditing(false);

    if (!preferencesLoaded) {
      return;
    }

    if (saveTimer.current !== null) {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }

    if (!hasUserChangedLayout.current) {
      return;
    }

    await persistLayouts();
  }

  const updateLayouts = useCallback(
    (nextLayouts: GridLayouts) => {
      const previousLayouts = layoutsRef.current;
      const next = {} as GridLayouts;

      for (const breakpoint of BREAKPOINT_KEYS) {
        const previous = previousLayouts[breakpoint] ?? [];
        const incoming = nextLayouts[breakpoint] ?? [];

        const incomingById = new Map<string, GridItem>();

        for (const item of incoming) {
          if (isGridItem(item)) {
            incomingById.set(item.i, item);
          }
        }

        next[breakpoint] = previous.map((oldItem) => {
          const updated = incomingById.get(oldItem.i);

          if (!updated) {
            return oldItem;
          }

          return {
            ...oldItem,
            x: updated.x,
            y: updated.y,
            w: updated.w,
            h: updated.h,
          };
        });
      }

      const hasChanged = BREAKPOINT_KEYS.some((breakpoint) => {
        const previous = previousLayouts[breakpoint] ?? [];
        const current = next[breakpoint] ?? [];

        if (previous.length !== current.length) {
          return true;
        }

        return previous.some((oldItem) => {
          const newItem = current.find((item) => item.i === oldItem.i);

          return (
            !newItem ||
            oldItem.x !== newItem.x ||
            oldItem.y !== newItem.y ||
            oldItem.w !== newItem.w ||
            oldItem.h !== newItem.h
          );
        });
      });

      if (hasChanged) {
        commitLayouts(next);
      }
    },
    [commitLayouts],
  );

  const handleLayoutChange = useCallback(
    (_layout: unknown, allLayouts: unknown) => {
      if (!editing) return;

      updateLayouts(allLayouts as GridLayouts);
    },
    [editing, updateLayouts],
  );

  const removeWidget = useCallback(
    (id: DashboardWidgetId) => {
      const current = layoutsRef.current;
      const next = {} as GridLayouts;

      for (const breakpoint of BREAKPOINT_KEYS) {
        next[breakpoint] = current[breakpoint].filter((item) => item.i !== id);
      }

      commitLayouts(next);
    },
    [commitLayouts],
  );

  function addWidget(id: DashboardWidgetId) {
    const definition = DASHBOARD_WIDGETS.find((widget) => widget.id === id);

    if (!definition) {
      return;
    }

    const current = layoutsRef.current;
    const next = {} as GridLayouts;

    for (const breakpoint of BREAKPOINT_KEYS) {
      const items = current[breakpoint];

      if (items.some((item) => item.i === id)) {
        next[breakpoint] = [...items];
        continue;
      }

      const columns = COLUMNS[breakpoint];
      const isDesktop = breakpoint === "lg";

      const maxY = items.reduce(
        (max, item) => Math.max(max, item.y + item.h),
        0,
      );

      const newItem: GridItem = isDesktop
        ? { ...toGridItem(definition.defaultLayout), y: maxY }
        : {
            i: id,
            x: 0,
            y: maxY,
            w: columns,
            h: definition.defaultLayout.h,
            minW: Math.min(definition.minW, columns),
            minH: definition.minH,
          };

      next[breakpoint] = [...items, newItem];
    }

    commitLayouts(next);
  }

  function resetLayout() {
    commitLayouts(createDefaultLayouts());
  }

  /* --------------------------- Widget elements --------------------------- */
  const widgetNodes = useMemo(() => {
    const build = (id: DashboardWidgetId): ReactNode => {
      switch (id) {
        case "stats":
          return (
            <DashboardStats
              totalTasks={totalTasks}
              pendingCount={pendingCount}
              completedCount={completedCount}
              totalNotes={totalNotes}
            />
          );

        case "overdue-tasks":
          return overdueTasks.length > 0 ? (
            <OverdueTasks
              tasks={overdueTasks}
              onViewAll={onViewTasks}
              onTaskClick={onTaskClick}
            />
          ) : (
            <div className="flex h-full min-h-24 items-center justify-center rounded-2xl border border-border bg-surface p-6 text-sm text-text-muted">
              No overdue tasks. You&apos;re all caught up!
            </div>
          );

        case "today-tasks":
          return (
            <TodayTasks
              tasks={todayTasks}
              onViewAll={onViewTasks}
              onTaskClick={onTaskClick}
            />
          );

        case "recent-notes":
          return (
            <RecentNotes
              notes={notes}
              onViewAll={onViewNotes}
              onCreateNote={onCreateNote}
              onNoteClick={onNoteClick}
            />
          );

        case "task-progress":
          return (
            <TaskProgressCard
              totalTasks={totalTasks}
              pendingCount={pendingCount}
              completedCount={completedCount}
              completionRate={completionRate}
              onViewTasks={onViewTasks}
            />
          );

        case "calendar":
          return (
            <CalendarWidget
              token={token}
              notes={notes}
              onCreateTask={onCreateTask}
              onTaskClick={onTaskClick}
            />
          );

        case "quick-actions":
          return (
            <QuickActions
              onCreateTask={onCreateTask}
              onCreateNote={onCreateNote}
            />
          );

        default:
          return null;
      }
    };

    const nodes = {} as Record<DashboardWidgetId, ReactNode>;

    for (const widget of DASHBOARD_WIDGETS) {
      nodes[widget.id] = build(widget.id);
    }

    return nodes;
  }, [
    token,
    todayTasks,
    overdueTasks,
    notes,
    totalTasks,
    pendingCount,
    completedCount,
    totalNotes,
    completionRate,
    onCreateTask,
    onCreateNote,
    onViewTasks,
    onViewNotes,
    onTaskClick,
    onNoteClick,
  ]);

  const gridChildren = useMemo(
    () =>
      layouts.lg.map((item, index) => {
        const id = item.i as DashboardWidgetId;

        const definition = DASHBOARD_WIDGETS.find(
          (widget) => widget.id === id,
        );

        if (!definition) {
          return null;
        }

        return (
          <div key={id} className="min-w-0">
            <div
              className="dashboard-widget-shell flex h-full min-h-0 flex-col"
              style={
                {
                  "--enter-delay": `${Math.min(index, 8) * 55}ms`,
                } as CSSProperties
              }
            >
              {editing && (
                <div className="mb-2 flex shrink-0 items-center justify-between rounded-lg border border-dashed border-border bg-surface px-3 py-2">
                  <div className="dashboard-widget-handle flex min-h-8 touch-none select-none cursor-grab items-center gap-2 rounded-md px-1 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary active:cursor-grabbing">
                    <GripVertical size={15} />
                    {definition.title}
                  </div>

                  {definition.removable && (
                    <button
                      type="button"
                      aria-label={`Remove ${definition.title}`}
                      onClick={() => removeWidget(id)}
                      className="rounded-md p-1 text-text-muted transition hover:bg-error/10 hover:text-error"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              )}

              <div
                className="dashboard-widget-content min-h-0 min-w-0 flex-1 overflow-hidden"
                inert={editing}
                aria-label={
                  editing
                    ? `${definition.title} preview; interactions disabled while customizing`
                    : undefined
                }
              >
                {widgetNodes[id]}
              </div>
            </div>
          </div>
        );
      }),
    [layouts.lg, editing, widgetNodes, removeWidget],
  );

  return (
    <section
      ref={sectionRef}
      className={`dashboard-customizable space-y-4 ${
        editing ? "is-editing" : ""
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Your dashboard
          </h2>

          <p className="mt-1 text-sm text-text-muted">
            Arrange your workspace the way you like.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={resetLayout}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-text-secondary transition hover:bg-surface-elevated"
          >
            <RotateCcw size={15} />
            Reset
          </button>

          <button
            type="button"
            disabled={!preferencesLoaded}
            onClick={() => {
              if (editing) {
                void finishEditing();
              } else {
                setEditing(true);
              }
            }}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {editing ? "Done editing" : "Customize"}
          </button>

          {saveStatus && (
            <p
              className={`text-xs ${
                saveStatus === "error" ? "text-error" : "text-text-muted"
              }`}
              role="status"
            >
              {saveStatus === "saving" && "Saving layout..."}
              {saveStatus === "saved" && "Layout saved"}
              {saveStatus === "error" && "Failed to save layout"}
            </p>
          )}
        </div>
      </div>

      {editing && (
        <div className="dashboard-panel-in space-y-3 rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center gap-2">
            <Plus size={16} className="text-primary" />

            <h3 className="text-sm font-semibold text-text-primary">
              Add a widget
            </h3>
          </div>

          {availableWidgets.length === 0 ? (
            <p className="text-sm text-text-muted">
              All available widgets are already on your dashboard.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableWidgets.map((widget) => (
                <button
                  key={widget.id}
                  type="button"
                  onClick={() => addWidget(widget.id)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-text-secondary transition hover:border-primary/50 hover:text-text-primary"
                >
                  <Plus size={14} />
                  {widget.title}
                </button>
              ))}
            </div>
          )}

          <p className="text-xs text-text-muted">
            Drag widgets using the grip. Resize with the bottom-right corner.
            Widget actions are paused while customizing.
          </p>
        </div>
      )}

      <div ref={containerRef} className="w-full min-w-0 overflow-x-clip">
        {preferencesLoaded && width > 0 ? (
          <Responsive
            width={width}
            layouts={layouts}
            breakpoints={BREAKPOINTS}
            cols={COLUMNS}
            compactor={verticalCompactor}
            rowHeight={64}
            margin={GRID_MARGIN}
            containerPadding={GRID_CONTAINER_PADDING}
            dragConfig={dragConfig}
            resizeConfig={resizeConfig}
            onLayoutChange={handleLayoutChange}
          >
            {gridChildren}
          </Responsive>
        ) : (
          <div
            className="min-h-96 animate-pulse rounded-2xl border border-border bg-surface"
            aria-busy="true"
            aria-label="Loading dashboard"
          />
        )}
      </div>
    </section>
  );
}
