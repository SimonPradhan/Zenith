import { Plus } from "lucide-react";
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
    <section>
      <p className="text-sm font-medium text-primary">
        Overview
      </p>

      <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            {getGreeting()},{" "}
            {user?.name?.split(" ")[0] ?? "there"}.
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            Here&apos;s a quick look at your workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateTask}
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/10 transition hover:bg-primary-hover"
        >
          <Plus size={16} />
          New task
        </button>
      </div>
    </section>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}
