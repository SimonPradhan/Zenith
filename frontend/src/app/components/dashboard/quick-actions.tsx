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
    <div className="comic-paper-widget comic-list-panel h-full min-h-0 rounded-sm border-2 border-[#28251f] bg-[#fffaf0] p-4 sm:p-5">
      <div className="comic-widget-header -mx-4 -mt-4 mb-4 border-b-2 border-[#28251f]/80 bg-[#f4d64f]/70 px-4 py-4 sm:-mx-5 sm:-mt-5 sm:px-5">
        <h3 className="comic-heading truncate text-xl text-[#28251f]">
          Quick actions
        </h3>

        <p className="mt-1 text-xs text-text-muted">
          Jump into the things you use most.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-5">
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
      className="group flex min-w-0 items-center gap-3 border-2 border-[#28251f]/60 bg-[#e9e0cf]/45 p-3 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#28251f] hover:bg-[#f4d64f]/25 hover:shadow-[3px_3px_0_#28251f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28251f] focus-visible:ring-offset-2 sm:p-4"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-[#28251f]/70 bg-[#f4d64f]/65 text-[#28251f] shadow-[2px_2px_0_#28251f] transition group-hover:bg-[#efaaa7]/60">
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-[#28251f]">
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
