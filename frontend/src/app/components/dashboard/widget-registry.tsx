
import type {
  DashboardWidgetId,
  DashboardWidgetLayout,
} from "@/types/dashboard";

export type DashboardWidgetDefinition = {
  id: DashboardWidgetId;
  title: string;
  description: string;
  defaultLayout: DashboardWidgetLayout;
  minW: number;
  minH: number;
  maxW?: number;
  maxH?: number;
  removable: boolean;
};

export const DASHBOARD_COLUMNS = 12;

export const DASHBOARD_WIDGETS: DashboardWidgetDefinition[] = [
  {
    id: "stats",
    title: "Statistics",
    description: "Overview of tasks, completion, and notes.",
    defaultLayout: {
      id: "stats",
      x: 0,
      y: 0,
      w: 12,
      h: 2,
      removable: true,
    },
    minW: 4,
    minH: 2,
    maxW: 12,
    removable: true,
  },
  {
    id: "overdue-tasks",
    title: "Overdue tasks",
    description: "Tasks that still need attention.",
    defaultLayout: {
      id: "overdue-tasks",
      x: 0,
      y: 2,
      w: 12,
      h: 3,
      removable: true,
    },
    minW: 4,
    minH: 2,
    maxW: 12,
    removable: true,
  },
  {
    id: "today-tasks",
    title: "Today & upcoming",
    description: "Your scheduled tasks.",
    defaultLayout: {
      id: "today-tasks",
      x: 0,
      y: 5,
      w: 7,
      h: 4,
      removable: true,
    },
    minW: 4,
    minH: 2,
    maxW: 12,
    removable: true,
  },
  {
    id: "recent-notes",
    title: "Recent notes",
    description: "Your latest saved notes.",
    defaultLayout: {
      id: "recent-notes",
      x: 7,
      y: 5,
      w: 5,
      h: 3,
      removable: true,
    },
    minW: 3,
    minH: 2,
    maxW: 12,
    removable: true,
  },
  {
    id: "task-progress",
    title: "Task progress",
    description: "Track overall task completion.",
    defaultLayout: {
      id: "task-progress",
      x: 0,
      y: 10,
      w: 8,
      h: 4,
      removable: true,
    },
    minW: 4,
    minH: 3,
    maxW: 12,
    removable: true,
  },
  {
    id: "calendar",
    title: "Calendar",
    description: "Switch between English and Nepali Bikram Sambat dates.",
    defaultLayout: {
      id: "calendar",
      x: 8,
      y: 14,
      w: 4,
      h: 5,
      removable: true,
    },
    minW: 3,
    minH: 4,
    maxW: 8,
    removable: true,
  },
  {
    id: "quick-actions",
    title: "Quick actions",
    description: "Shortcuts for creating tasks and notes.",
    defaultLayout: {
      id: "quick-actions",
      x: 8,
      y: 10,
      w: 4,
      h: 4,
      removable: true,
    },
    minW: 3,
    minH: 2,
    maxW: 12,
    removable: true,
  },
];

export function getDashboardWidget(
  id: DashboardWidgetId,
): DashboardWidgetDefinition | undefined {
  return DASHBOARD_WIDGETS.find((widget) => widget.id === id);
}

export function getDefaultDashboardLayout(): DashboardWidgetLayout[] {
  return DASHBOARD_WIDGETS.map((widget) => ({
    ...widget.defaultLayout,
  }));
}
