export type NoteColor =
  | "yellow"
  | "purple"
  | "blue"
  | "green"
  | "pink";

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  color: NoteColor;
  created_at: string;
  updated_at: string;
}

export interface NoteListResponse {
  items: Note[];
  total: number;
  limit: number;
  offset: number;
}

export interface NoteCreate {
  title: string;
  content: string;
  color?: NoteColor;
}

export interface NoteUpdate {
  title?: string;
  content?: string;
  color?: NoteColor;
}
