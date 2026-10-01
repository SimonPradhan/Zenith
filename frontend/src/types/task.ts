export type TaskStatus = "pending" | "completed";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
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
  due_date?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: TaskStatus;
  due_date?: string;
}
