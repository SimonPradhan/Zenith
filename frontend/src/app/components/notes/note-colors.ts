import type { NoteColor } from "@/types/note";

/**
 * Sticky-note paper colours. These stay bright in both themes because the
 * notes are physical paper pinned to the board; text on them is always dark.
 */
export const stickyColors: Record<NoteColor, string> = {
  yellow: "#f4d64f",
  pink: "#efaaa7",
  blue: "#a9c9e8",
  green: "#b8d9b7",
  purple: "#cdb6ea",
};

export const stickyColorLabels: Record<NoteColor, string> = {
  yellow: "Yellow",
  pink: "Pink",
  blue: "Blue",
  green: "Green",
  purple: "Lavender",
};

export function formatNoteDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
