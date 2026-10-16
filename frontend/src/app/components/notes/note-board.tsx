"use client";

import {
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { formatNoteDate, stickyColors } from "@/app/components/notes/note-colors";

import type { Note } from "@/types/note";

/** Fixed canvas size in CSS pixels. Must stay within the API's BOARD_MAX. */
export const BOARD_WIDTH = 2400;
export const BOARD_HEIGHT = 1600;

const NOTE_WIDTH = 232;
const NOTE_HEIGHT = 208;
const GAP = 26;
const PADDING = 44;
/** Pointer travel (px) before a press becomes a drag instead of a click. */
const DRAG_THRESHOLD = 4;

const PIN_COLORS = ["#d9372b", "#2f6fb5", "#2f8f4e", "#e0a31a"];

export interface NoteMovePatch {
  pos_x: number;
  pos_y: number;
  rotation: number;
  z_index: number;
}

export interface NoteBoardHandle {
  /** A free-ish spot inside the part of the board the user is looking at. */
  getFreeSpot: () => NoteMovePatch;
}

interface NoteBoardProps {
  notes: Note[];
  loading: boolean;
  ref?: React.Ref<NoteBoardHandle>;
  onOpen: (note: Note) => void;
  onMove: (note: Note, patch: NoteMovePatch) => void;
}

interface Placement {
  x: number;
  y: number;
  rotation: number;
  z: number;
}

interface DragState {
  id: string;
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  /** Latest clamped position, kept here so a fast release never reads stale state. */
  x: number;
  y: number;
  moved: boolean;
}

function hash(value: string): number {
  let result = 0;

  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) | 0;
  }

  return Math.abs(result);
}

/** Stable small tilt (-4..4 degrees) so notes look hand-placed. */
function tiltFor(id: string): number {
  return (hash(id) % 9) - 4;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function gridSlot(index: number): { x: number; y: number } {
  const columns = Math.max(
    1,
    Math.floor((BOARD_WIDTH - PADDING * 2 + GAP) / (NOTE_WIDTH + GAP)),
  );

  return {
    x: PADDING + (index % columns) * (NOTE_WIDTH + GAP),
    y: PADDING + Math.floor(index / columns) * (NOTE_HEIGHT + GAP),
  };
}

/** Grid layout for every note, used by "Tidy up". */
export function tidyPatches(notes: Note[]): { note: Note; patch: NoteMovePatch }[] {
  return notes.map((note, index) => {
    const slot = gridSlot(index);

    return {
      note,
      patch: {
        pos_x: slot.x,
        pos_y: slot.y,
        rotation: tiltFor(note.id),
        z_index: index + 1,
      },
    };
  });
}

export function NoteBoard({
  notes,
  loading,
  ref,
  onOpen,
  onMove,
}: NoteBoardProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [dragging, setDragging] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);

  const maxZ = useMemo(
    () => notes.reduce((max, note) => Math.max(max, note.z_index), 0),
    [notes],
  );

  const placements = useMemo(() => {
    const map = new Map<string, Placement>();
    let unplaced = 0;

    for (const note of notes) {
      if (note.pos_x === null || note.pos_y === null) {
        // Notes that were never placed (e.g. created before the board
        // existed) are laid out in a grid until the user moves them.
        const slot = gridSlot(unplaced);
        unplaced += 1;

        map.set(note.id, {
          x: slot.x,
          y: slot.y,
          rotation: tiltFor(note.id),
          z: note.z_index,
        });
      } else {
        map.set(note.id, {
          x: note.pos_x,
          y: note.pos_y,
          rotation: note.rotation,
          z: note.z_index,
        });
      }
    }

    return map;
  }, [notes]);

  const placementsRef = useRef(placements);
  const maxZRef = useRef(maxZ);

  useEffect(() => {
    placementsRef.current = placements;
    maxZRef.current = maxZ;
  }, [placements, maxZ]);

  useImperativeHandle(ref, () => ({
    getFreeSpot() {
      const viewport = viewportRef.current;
      const left = viewport?.scrollLeft ?? 0;
      const top = viewport?.scrollTop ?? 0;
      const width = viewport?.clientWidth ?? 900;
      const height = viewport?.clientHeight ?? 600;

      const existing = [...placementsRef.current.values()];
      const stepX = NOTE_WIDTH + GAP;
      const stepY = NOTE_HEIGHT + GAP;

      for (let y = top + 36; y + NOTE_HEIGHT < top + height; y += stepY) {
        for (let x = left + 36; x + NOTE_WIDTH < left + width; x += stepX) {
          const overlaps = existing.some(
            (other) =>
              Math.abs(other.x - x) < NOTE_WIDTH * 0.75 &&
              Math.abs(other.y - y) < NOTE_HEIGHT * 0.75,
          );

          if (!overlaps) {
            return {
              pos_x: clamp(Math.round(x), 0, BOARD_WIDTH - NOTE_WIDTH),
              pos_y: clamp(Math.round(y), 0, BOARD_HEIGHT - NOTE_HEIGHT),
              rotation: (Math.round(Math.random() * 8) - 4),
              z_index: maxZRef.current + 1,
            };
          }
        }
      }

      // Visible area is full: stack slightly offset near its top-left.
      const offset = (existing.length % 8) * 22;

      return {
        pos_x: clamp(left + 36 + offset, 0, BOARD_WIDTH - NOTE_WIDTH),
        pos_y: clamp(top + 36 + offset, 0, BOARD_HEIGHT - NOTE_HEIGHT),
        rotation: Math.round(Math.random() * 8) - 4,
        z_index: maxZRef.current + 1,
      };
    },
  }));

  function handlePointerDown(
    event: React.PointerEvent<HTMLElement>,
    note: Note,
    placement: Placement,
  ) {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    event.currentTarget.setPointerCapture(event.pointerId);

    dragRef.current = {
      id: note.id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: placement.x,
      originY: placement.y,
      x: placement.x,
      y: placement.y,
      moved: false,
    };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

    drag.moved = true;
    drag.x = clamp(drag.originX + dx, 0, BOARD_WIDTH - NOTE_WIDTH);
    drag.y = clamp(drag.originY + dy, 0, BOARD_HEIGHT - NOTE_HEIGHT);

    setDragging({ id: drag.id, x: drag.x, y: drag.y });
  }

  function finishPointer(
    event: React.PointerEvent<HTMLElement>,
    note: Note,
    placement: Placement,
    cancelled: boolean,
  ) {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) return;

    dragRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setDragging(null);

    if (cancelled) return;

    if (!drag.moved) {
      onOpen(note);
      return;
    }

    onMove(note, {
      pos_x: Math.round(drag.x),
      pos_y: Math.round(drag.y),
      rotation: placement.rotation,
      z_index: maxZRef.current + 1,
    });
  }

  return (
    <div
      className={`notice-board-frame transition-opacity duration-200 ${
        loading ? "opacity-70" : "opacity-100"
      }`}
    >
      <div
        ref={viewportRef}
        className="notice-board-viewport"
        aria-label="Notice board"
      >
        <div
          className="notice-board-cork relative"
          style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }}
        >
          {notes.map((note) => {
            const placement = placements.get(note.id);

            if (!placement) return null;

            const isDragging = dragging?.id === note.id;
            const x = isDragging ? dragging.x : placement.x;
            const y = isDragging ? dragging.y : placement.y;
            const pin = PIN_COLORS[hash(note.id) % PIN_COLORS.length];

            return (
              <article
                key={note.id}
                role="button"
                tabIndex={0}
                aria-label={`Open note: ${note.title}`}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpen(note);
                  }
                }}
                onPointerDown={(event) =>
                  handlePointerDown(event, note, placement)
                }
                onPointerMove={handlePointerMove}
                onPointerUp={(event) =>
                  finishPointer(event, note, placement, false)
                }
                onPointerCancel={(event) =>
                  finishPointer(event, note, placement, true)
                }
                className={`sticky-note ${isDragging ? "is-dragging" : ""}`}
                style={{
                  width: NOTE_WIDTH,
                  height: NOTE_HEIGHT,
                  left: x,
                  top: y,
                  zIndex: isDragging ? maxZ + 2 : placement.z + 1,
                  backgroundColor: stickyColors[note.color],
                  transform: `rotate(${isDragging ? 0 : placement.rotation}deg)${
                    isDragging ? " scale(1.04)" : ""
                  }`,
                }}
              >
                <span
                  className="sticky-pin"
                  aria-hidden="true"
                  style={{ backgroundColor: pin }}
                />

                <h2 className="comic-title line-clamp-2 text-[17px] font-black uppercase leading-tight">
                  {note.title}
                </h2>

                <p className="mt-2 line-clamp-5 whitespace-pre-wrap break-words text-[13px] leading-5">
                  {note.content}
                </p>

                <p className="sticky-date">
                  {formatNoteDate(note.updated_at)}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
