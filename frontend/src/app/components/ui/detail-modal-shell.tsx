"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

interface DetailModalShellProps {
  /** Used for aria-labelledby; pass the id of the heading inside children. */
  labelledBy: string;
  onClose: () => void;
  children: React.ReactNode;
  /** Tailwind max-width class, e.g. "max-w-2xl". */
  widthClassName?: string;
}

/**
 * Shared comic-style modal frame for read-only detail views.
 * Handles Escape, backdrop click, scroll lock and initial focus.
 */
export function DetailModalShell({
  labelledBy,
  onClose,
  children,
  widthClassName = "max-w-2xl",
}: DetailModalShellProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/65 p-0 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`detail-modal relative max-h-[92vh] w-full ${widthClassName} overflow-y-auto border-2 border-[var(--comic-ink)] outline-none sm:rounded-sm`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center border-2 border-[var(--comic-ink)] bg-[#f4d64f] text-[#1c1a16] shadow-[2px_2px_0_var(--comic-ink)] transition hover:-translate-y-0.5"
        >
          <X size={18} />
        </button>

        {children}
      </div>
    </div>
  );
}
