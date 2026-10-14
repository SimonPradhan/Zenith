
export type DashboardWidgetId =
  | "stats"
  | "overdue-tasks"
  | "today-tasks"
  | "recent-notes"
  | "task-progress"
  | "quick-actions";

export type DashboardBreakpoint = "lg" | "md" | "sm" | "xs";

export type DashboardWidgetLayout = {
  id: DashboardWidgetId;
  x: number;
  y: number;
  w: number;
  h: number;
  removable?: boolean;
};

export type ResponsiveDashboardLayouts = Record<
  DashboardBreakpoint,
  DashboardWidgetLayout[]
>;

export type DashboardTheme = "light" | "dark" | "system";

export type DashboardPreferences = {
  version: 1;
  theme: DashboardTheme;
  layouts: ResponsiveDashboardLayouts;
  hiddenWidgets: DashboardWidgetId[];
};
