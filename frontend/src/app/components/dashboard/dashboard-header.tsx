import { Plus, Sparkles, Star } from "lucide-react";
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
    <section className="retro-hero comic-hero relative isolate overflow-hidden rounded-md border-2 border-text-primary px-5 py-6 shadow-[5px_5px_0_var(--paper-shadow)] sm:px-8 sm:py-8 lg:px-10 lg:py-9">
      <div className="pointer-events-none absolute inset-0 -z-10 comic-hero-paper" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-3 -top-5 hidden rotate-12 text-8xl font-black text-[#df5f55] sm:block lg:right-10 lg:top-1 lg:text-9xl" aria-hidden="true">✳</div>
      <div className="pointer-events-none absolute bottom-4 right-8 hidden rotate-[-12deg] rounded-sm border-2 border-[#28251f] bg-[#f4d64f] px-3 py-2 text-center text-xs font-black uppercase leading-tight text-[#28251f] shadow-[3px_3px_0_#28251f] md:block lg:right-36">
        Better<br />ideas<br />ahead!
      </div>
      <div className="relative max-w-4xl">
        <p className="mb-4 inline-flex items-center gap-2 border-2 border-text-primary bg-[#d9e8d4] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#28251f] shadow-[2px_2px_0_#28251f] sm:text-xs">
          <Sparkles size={14} />
          Your personal workspace · 01
        </p>
        <h1 className="max-w-3xl text-4xl font-black uppercase leading-[0.94] tracking-[-0.055em] text-text-primary sm:text-5xl lg:text-7xl">
          {getGreeting()},<br />
          <span className="relative inline-block">
            {user?.name?.split(" ")[0] ?? "there"}!
            <span className="absolute -bottom-1 left-0 h-2 w-full -rotate-1 bg-[#f4d64f] -z-10" />
          </span>
        </h1>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-lg text-sm font-medium leading-6 text-text-secondary sm:text-base">
            Small steps today. Big dreams tomorrow. Let’s make room for what matters.
          </p>
          <button
            type="button"
            onClick={onCreateTask}
            className="comic-action inline-flex w-fit shrink-0 items-center gap-2 border-2 border-[#28251f] bg-[#f4d64f] px-4 py-3 text-sm font-black text-[#28251f] shadow-[4px_4px_0_#28251f] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#28251f] active:translate-y-0 active:shadow-[2px_2px_0_#28251f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            <Plus size={17} strokeWidth={3} />
            New task
            <Star size={15} />
          </button>
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-3 right-4 hidden -rotate-12 text-4xl text-text-primary sm:block lg:bottom-5 lg:right-7 lg:text-5xl" aria-hidden="true">☺</div>
    </section>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
