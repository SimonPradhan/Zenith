import {
  ArrowRight,
  CheckCircle2,
  Circle,
  FileText,
  ListTodo,
} from "lucide-react";

import type { ElementType } from "react";

type DashboardStatsProps = {
  totalTasks: number;
  pendingCount: number;
  completedCount: number;
  totalNotes: number;
};

export default function DashboardStats({
  totalTasks,
  pendingCount,
  completedCount,
  totalNotes,
}: DashboardStatsProps) {
  return (
    <section className="grid h-full min-h-0 min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total tasks"
        value={totalTasks}
        icon={ListTodo}
        description="All tasks"
      />

      <StatCard
        label="Pending"
        value={pendingCount}
        icon={Circle}
        description={
          pendingCount === 1
            ? "1 task remaining"
            : `${pendingCount} tasks remaining`
        }
      />

      <StatCard
        label="Completed"
        value={completedCount}
        icon={CheckCircle2}
        accent="success"
        description={
          completedCount === 1
            ? "1 task completed"
            : `${completedCount} tasks completed`
        }
      />

      <StatCard
        label="Notes"
        value={totalNotes}
        icon={FileText}
        description={
          totalNotes === 1
            ? "1 note saved"
            : `${totalNotes} notes saved`
        }
      />
    </section>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent = "primary",
  description,
}: {
  label: string;
  value: number;
  icon: ElementType;
  accent?: "primary" | "success";
  description: string;
}) {
  const isSuccess = accent === "success";

  return (
    <article className="group flex h-full min-h-0 min-w-0 flex-col rounded-2xl border border-border bg-surface p-3 transition duration-200 hover:border-primary/30 hover:bg-surface-elevated sm:p-4 lg:p-5">
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            isSuccess
              ? "bg-success/10 text-success"
              : "bg-primary/10 text-primary"
          }`}
        >
          <Icon size={18} />
        </div>

        <ArrowRight
          size={15}
          className="shrink-0 text-text-muted opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
        />
      </div>

      <div className="mt-3 min-w-0 flex-1 sm:mt-4">
        <p className="break-words text-xs text-text-muted sm:text-sm">
          {label}
        </p>

        <p className="mt-1 break-words text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
          {value.toLocaleString()}
        </p>

        <p className="mt-1 break-words text-xs leading-5 text-text-muted">
          {description}
        </p>
      </div>
    </article>
  );
}
