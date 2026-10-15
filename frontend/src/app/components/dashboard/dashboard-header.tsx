import { Plus, Sparkles } from "lucide-react";
import type { User } from "@/types/auth";

type DashboardHeaderProps = {
  user: User | null;
  onCreateTask: () => void;
};

export default function DashboardHeader({
  user,
  onCreateTask,
}: DashboardHeaderProps) {
  return (
    <section className="retro-hero relative overflow-hidden rounded-sm border-y border-border/80 py-5 sm:py-8">
      <div className="pointer-events-none absolute right-5 top-4 hidden select-none font-serif text-8xl leading-none text-primary/10 md:block" aria-hidden="true">
        ✳
      </div>
      <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">
        <Sparkles size={13} />
        Your personal workspace / 01
      </p>
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <h1 className="max-w-3xl text-4xl font-black leading-[0.98] tracking-[-0.06em] text-text-primary sm:text-6xl lg:text-7xl">
            Make room for
            <br />
            what matters<span className="text-primary">.</span>
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-text-secondary sm:text-base">
            {getGreeting()}, {user?.name?.split(" ")[0] ?? "there"}. Small steps today, big results tomorrow.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateTask}
          className="inline-flex w-fit shrink-0 items-center gap-2 rounded-sm border border-primary bg-primary px-4 py-3 text-sm font-semibold text-[#fbf5e9] shadow-[3px_3px_0_#c7b99e] transition hover:-translate-y-0.5 hover:shadow-[4px_5px_0_#c7b99e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Plus size={16} />
          Add a task
        </button>
      </div>
    </section>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
