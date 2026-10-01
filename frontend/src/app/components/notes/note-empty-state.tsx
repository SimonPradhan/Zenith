import { FileText } from "lucide-react";

interface NoteEmptyStateProps {
  search: string;
}

export function NoteEmptyState({
  search,
}: NoteEmptyStateProps) {
  const filtered = Boolean(search);

  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-border bg-surface px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <FileText size={25} className="text-primary" />
      </div>

      <h3 className="font-medium text-text-primary">
        {filtered ? "No matching notes" : "No notes yet"}
      </h3>

      <p className="mt-2 max-w-sm text-sm text-text-muted">
        {filtered
          ? "Try changing your search."
          : "Create your first note to start capturing your ideas."}
      </p>
    </div>
  );
}
