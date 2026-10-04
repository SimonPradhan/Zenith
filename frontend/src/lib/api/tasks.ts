import { apiClient } from "./client";
import type {
  Task,
  TaskCreate,
  TaskListResponse,
  TaskPriority,
  TaskStatus,
  TaskUpdate,
} from "@/types/task";

export function getTasks(
  token: string | undefined,
  params?: {
    limit?: number;
    offset?: number;
    status?: TaskStatus;
    priority?: TaskPriority;
    search?: string;
    due_from?: string;
    due_to?: string;
    order_by_due_date?: boolean;
  },
) {
  const searchParams = new URLSearchParams();

  if (params?.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  if (params?.offset !== undefined) {
    searchParams.set("offset", String(params.offset));
  }

  if (params?.status) {
    searchParams.set("status", params.status);
  }

  if (params?.priority) {
    searchParams.set("priority", params.priority);
  }

  if (params?.search) {
    searchParams.set("search", params.search);
  }

  if (params?.due_from) {
    searchParams.set("due_from", params.due_from);
  }

  if (params?.due_to) {
    searchParams.set("due_to", params.due_to);
  }

  if (params?.order_by_due_date !== undefined) {
    searchParams.set(
      "order_by_due_date",
      String(params.order_by_due_date),
    );
  }

  const query = searchParams.toString();

  return apiClient<TaskListResponse>(
    `/tasks/${query ? `?${query}` : ""}`,
    { token },
  );
}

export function getTask(token: string, id: string) {
  return apiClient<Task>(`/tasks/${id}`, { token });
}

export function createTask(token: string, data: TaskCreate) {
  return apiClient<Task>("/tasks/", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export function updateTask(
  token: string,
  id: string,
  data: TaskUpdate,
) {
  return apiClient<Task>(`/tasks/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(data),
  });
}

export function deleteTask(token: string, id: string) {
  return apiClient<void>(`/tasks/${id}`, {
    method: "DELETE",
    token,
  });
}
