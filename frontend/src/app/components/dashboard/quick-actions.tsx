import {
  ArrowRight,
  FilePlus2,
  ListTodo,
} from "lucide-react";

type QuickActionsProps = {
  onCreateTask: () => void;
  onCreateNote: () => void;
};

export default function QuickActions({
  onCreateTask,
  onCreateNote,
}: QuickActionsProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div>
        <h2 className="font-semibold text-text-primary">
          Quick actions
        </h2>

        <p className="mt-1 text-xs text-text-muted">
          Jump into the things you use most.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <QuickAction
          icon={ListTodo}
          title="Create a task"
          description="Add something to your task list."
          onClick={onCreateTask}
        />

        <QuickAction
          icon={FilePlus2}
          title="Create a note"
          description="Capture an idea or important detail."
          onClick={onCreateNote}
        />
      </div>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl border border-border bg-background/40 p-4 text-left transition duration-200 hover:border-primary/30 hover:bg-surface-elevated"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary/15">
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-primary">
          {title}
        </p>

        <p className="mt-1 text-xs text-text-muted">
          {description}
        </p>
      </div>

      <ArrowRight
        size={15}
        className="shrink-0 text-text-muted transition group-hover:translate-x-0.5 group-hover:text-primary"
      />
    </button>
  );
}
