"use client";

import { useMemo, useState } from "react";
import { Responsive, useContainerWidth } from "react-grid-layout";
import { GripVertical, Plus, RotateCcw, X } from "lucide-react";

import DashboardStats from "@/app/components/dashboard/dashboard-stats";
import TodayTasks from "@/app/components/dashboard/today-tasks";
import RecentNotes from "@/app/components/dashboard/recent-notes";
import OverdueTasks from "@/app/components/dashboard/overdue-tasks";
import TaskProgressCard from "@/app/components/dashboard/task-progress-card";
import QuickActions from "@/app/components/dashboard/quick-actions";

import type { Task } from "@/types/task";
import type { Note } from "@/types/note";
import type {
  DashboardWidgetId,
  DashboardWidgetLayout,
} from "@/types/dashboard";

import {
  DASHBOARD_WIDGETS,
  getDefaultDashboardLayout,
} from "@/app/components/dashboard/widget-registry";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

type Breakpoint = "lg" | "md" | "sm" | "xs" | "xxs";

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

type CustomizableDashboardProps = {
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
};

const BREAKPOINTS = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
  xxs: 0,
};

const COLUMNS: Record<Breakpoint, number> = {
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4,
  xxs: 2,
};

function toGridItem(item: DashboardWidgetLayout): GridItem {
  return {
    i: item.id,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    minW: item.minW ?? 2,
    minH: item.minH ?? 2,
  };
}

function createDefaultLayouts(): GridLayouts {
  const defaults = getDefaultDashboardLayout();

  const desktop = defaults.map(toGridItem);

  function stackItems(columns: number): GridItem[] {
    let y = 0;

    return defaults.map((item) => {
      const h = item.h;
      const gridItem: GridItem = {
        i: item.id,
        x: 0,
        y,
        w: columns,
        h,
        minW: Math.min(2, columns),
        minH: 2,
      };

      y += h;
      return gridItem;
    });
  }

  return {
    lg: desktop,
    md: stackItems(COLUMNS.md),
    sm: stackItems(COLUMNS.sm),
    xs: stackItems(COLUMNS.xs),
    xxs: stackItems(COLUMNS.xxs),
  };
}

export default function CustomizableDashboard({
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
}: CustomizableDashboardProps) {
  const { width, containerRef, mounted } = useContainerWidth({
    initialWidth: 1200,
  });

  const [layouts, setLayouts] = useState<GridLayouts>(createDefaultLayouts);
  const [editing, setEditing] = useState(false);

  const visibleIds = useMemo(
    () => new Set(layouts.lg.map((item) => item.i)),
    [layouts],
  );

  const availableWidgets = DASHBOARD_WIDGETS.filter(
    (widget) => !visibleIds.has(widget.id),
  );

  function updateLayouts(nextLayouts: GridLayouts) {
    setLayouts(nextLayouts);
  }

  function removeWidget(id: DashboardWidgetId) {
    setLayouts((current) => {
      const next = { ...current };

      for (const breakpoint of Object.keys(next) as Breakpoint[]) {
        next[breakpoint] = next[breakpoint].filter((item) => item.i !== id);
      }

      return next;
    });
  }

  function addWidget(id: DashboardWidgetId) {
    const definition = DASHBOARD_WIDGETS.find((widget) => widget.id === id);

    if (!definition) return;

    setLayouts((current) => {
      const next = { ...current };

      for (const breakpoint of Object.keys(next) as Breakpoint[]) {
        const items = next[breakpoint];

        if (items.some((item) => item.i === id)) continue;

        const columns = COLUMNS[breakpoint];
        const isDesktop = breakpoint === "lg";

        const newItem: GridItem = isDesktop
          ? toGridItem(definition.defaultLayout)
          : {
              i: id,
              x: 0,
              y: items.reduce((max, item) => Math.max(max, item.y + item.h), 0),
              w: columns,
              h: definition.defaultLayout.h,
              minW: Math.min(definition.minW, columns),
              minH: definition.minH,
            };

        const maxY = items.reduce(
          (max, item) => Math.max(max, item.y + item.h),
          0,
        );

        if (isDesktop) {
          newItem.y = maxY;
        }

        next[breakpoint] = [...items, newItem];
      }

      return next;
    });
  }

  function resetLayout() {
    setLayouts(createDefaultLayouts());
  }

  function renderWidget(id: DashboardWidgetId) {
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
            No overdue tasks. You`&apos;`re all caught up!
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

      case "quick-actions":
        return (
          <QuickActions
            onCreateTask={onCreateTask}
            onCreateNote={onCreateNote}
          />
        );
    }
  }

  return (
    <section
      className={`dashboard-customizable space-y-4 ${editing ? "is-editing" : ""}`}
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
            onClick={() => setEditing((value) => !value)}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover"
          >
            {editing ? "Done editing" : "Customize"}
          </button>
        </div>
      </div>

      {editing && (
        <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
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
            Drag widgets using the grip. Resize with the always-visible
            bottom-right corner. Widget actions are paused until you finish
            customizing.
          </p>
        </div>
      )}

      <div ref={containerRef} className="min-w-0">
        {mounted && (
          <Responsive
            width={width}
            layouts={layouts}
            breakpoints={BREAKPOINTS}
            cols={COLUMNS}
            rowHeight={72}
            margin={[16, 16]}
            containerPadding={[0, 0]}
            dragConfig={{
              enabled: editing,
              handle: ".dashboard-widget-handle",
              cancel:
                "button, a, input, textarea, select, [contenteditable='true'], .dashboard-widget-content",
            }}
            resizeConfig={{
              enabled: editing,
              handles: ["se"],
            }}
            onLayoutChange={(_layout, allLayouts) => {
              updateLayouts(allLayouts as GridLayouts);
            }}
          >
            {layouts.lg.map((item) => {
              const id = item.i as DashboardWidgetId;
              const definition = DASHBOARD_WIDGETS.find(
                (widget) => widget.id === id,
              );

              if (!definition) return null;

              return (
                <div key={id} className="min-w-0 overflow-hidden">
                  <div className="flex h-full min-h-0 flex-col">
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
                      className="dashboard-widget-content min-h-0 min-w-0 flex-1 overflow-y-auto"
                      inert={editing}
                      aria-label={
                        editing
                          ? `${definition.title} preview; interactions disabled while customizing`
                          : undefined
                      }
                    >
                      {renderWidget(id)}
                    </div>
                  </div>
                </div>
              );
            })}
          </Responsive>
        )}
      </div>
    </section>
  );
}
