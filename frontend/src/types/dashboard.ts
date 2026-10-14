
export type DashboardWidgetId =
  | "stats"
  | "overdue-tasks"
  | "today-tasks"
  | "recent-notes"
  | "task-progress"
  | "quick-actions";

export type DashboardBreakpoint =
  | "lg"
  | "md"
  | "sm"
  | "xs"
  | "xxs";

export type DashboardWidgetLayout = {
  id: DashboardWidgetId;
  x: number;
  y: number;
  w: number;
  h: number;
  removable?: boolean;
};

export type DashboardGridItem = {
  i: DashboardWidgetId;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
};

export type ResponsiveDashboardLayouts = Record<
  DashboardBreakpoint,
  DashboardWidgetLayout[]
>;

export type DashboardGridLayouts = Record<
  DashboardBreakpoint,
  DashboardGridItem[]
>;

export type DashboardTheme = "light" | "dark" | "system";

export type DashboardPreferences = {
  version: 1;
  theme: DashboardTheme;
  layouts: DashboardGridLayouts;
  hiddenWidgets: DashboardWidgetId[];
};
