import { apiClient } from "./client";

import type {
  Note,
  NoteCreate,
  NoteListResponse,
  NoteUpdate,
} from "@/types/note";

export function getNotes(
  token: string,
  params?: {
    limit?: number;
    offset?: number;
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

  if (params?.search) {
    searchParams.set("search", params.search);
  }

  const query = searchParams.toString();

  return apiClient<NoteListResponse>(
    `/notes/${query ? `?${query}` : ""}`,
    { token },
  );
}

export function getNote(token: string, id: string) {
  return apiClient<Note>(`/notes/${id}`, {
    token,
  });
}

export function createNote(
  token: string,
  data: NoteCreate,
) {
  return apiClient<Note>("/notes/", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export function updateNote(
  token: string,
  id: string,
  data: NoteUpdate,
) {
  return apiClient<Note>(`/notes/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(data),
  });
}

export function deleteNote(
  token: string,
  id: string,
) {
  return apiClient<void>(`/notes/${id}`, {
    method: "DELETE",
    token,
  });
}
