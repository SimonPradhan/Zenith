import { apiClient } from "./client";
import type {
  Task,
  TaskCreate,
  TaskListResponse,
  TaskStatus,
  TaskUpdate,
} from "@/types/task";

export function getTasks(
  token: string | undefined,
  params?: {
    limit?: number;
    offset?: number;
    status?: TaskStatus;
    search?: string;
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

  if (params?.search) {
    searchParams.set("search", params.search);
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
