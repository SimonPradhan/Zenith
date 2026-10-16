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
    <section className="dashboard-comic-hero comic-hero relative isolate min-h-[270px] overflow-hidden rounded-md border-2 px-5 pb-24 pt-6 shadow-[5px_5px_0_var(--paper-shadow)] sm:min-h-[290px] sm:px-8 sm:pb-24 sm:pt-8 lg:px-10 lg:pt-9">
      <div
        className="pointer-events-none absolute inset-0 -z-10 comic-hero-paper"
        aria-hidden="true"
      />

      <div
        className="dashboard-hero-burst pointer-events-none absolute -right-3 -top-5 hidden rotate-12 text-8xl font-black sm:block lg:right-10 lg:top-1 lg:text-9xl"
        aria-hidden="true"
      >
        ✳
      </div>

      <div className="dashboard-hero-sticker pointer-events-none absolute right-5 top-5 hidden rotate-[-8deg] border-2 px-3 py-2 text-center text-[10px] font-black uppercase leading-tight shadow-[3px_3px_0_var(--comic-ink)] md:block lg:right-24 lg:top-7">
        Better<br />ideas<br />ahead!
      </div>

      <div className="relative z-10 max-w-4xl">
        <p className="dashboard-hero-eyebrow mb-4 inline-flex items-center gap-2 border-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] shadow-[2px_2px_0_var(--comic-ink)] sm:text-xs">
          <Sparkles size={14} aria-hidden="true" />
          Your personal workspace · 01
        </p>

        <h1 className="comic-heading max-w-3xl text-4xl uppercase leading-[0.94] tracking-normal text-text-primary sm:text-5xl lg:text-7xl">
          {getGreeting()},<br />
          <span className="relative inline-block">
            {user?.name?.split(" ")[0] ?? "there"}!
            <span
              className="dashboard-hero-highlight absolute -bottom-1 left-0 -z-10 h-2 w-full -rotate-1"
              aria-hidden="true"
            />
          </span>
        </h1>

        <p className="mt-5 max-w-xl pr-2 text-sm font-medium leading-6 text-text-secondary sm:text-base">
          Small steps today. Big dreams tomorrow. Let’s make room for what matters.
        </p>
      </div>

      <button
        type="button"
        onClick={onCreateTask}
        className="dashboard-header-action comic-action absolute bottom-5 right-5 z-20 inline-flex items-center gap-2 border-2 px-4 py-3 text-sm font-black shadow-[4px_4px_0_var(--comic-ink)] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--comic-ink)] active:translate-y-0 active:shadow-[2px_2px_0_var(--comic-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:bottom-6 sm:right-7 lg:bottom-7 lg:right-9"
      >
        <Plus size={17} strokeWidth={3} aria-hidden="true" />
        New task
        <Star size={15} aria-hidden="true" />
      </button>

      <div
        className="pointer-events-none absolute bottom-7 left-5 hidden -rotate-12 text-3xl text-text-primary/70 sm:block lg:left-8 lg:text-4xl"
        aria-hidden="true"
      >
        ✦
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
