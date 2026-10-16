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
  /** Position on the notice board; null until the note has been placed. */
  pos_x: number | null;
  pos_y: number | null;
  rotation: number;
  z_index: number;
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
  pos_x?: number;
  pos_y?: number;
  rotation?: number;
  z_index?: number;
}

export interface NoteUpdate {
  title?: string;
  content?: string;
  color?: NoteColor;
  pos_x?: number;
  pos_y?: number;
  rotation?: number;
  z_index?: number;
}
