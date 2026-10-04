export type TaskStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";

export type TaskPriority =
  | "low"
  | "medium"
  | "high"
  | "urgent";

export interface Task {
  id: string;
  user_id: string;

  title: string;
  description: string | null;

  status: TaskStatus;
  priority: TaskPriority;

  start_date: string | null;
  due_date: string | null;

  estimated_minutes: number | null;

  created_at: string;
  updated_at: string;
}

export interface TaskListResponse {
  items: Task[];
  total: number;
  limit: number;
  offset: number;
}

export interface TaskCreate {
  title: string;
  description?: string;

  status?: TaskStatus;
  priority?: TaskPriority;

  start_date?: string;
  due_date?: string;

  estimated_minutes?: number;
}

export interface TaskUpdate {
  title?: string;
  description?: string;

  status?: TaskStatus;
  priority?: TaskPriority;

  start_date?: string;
  due_date?: string;

  estimated_minutes?: number;
}
