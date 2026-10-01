import {
  ArrowRight,
  CheckCircle2,
  Circle,
  FileText,
  ListTodo,
} from "lucide-react";

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
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
  icon: React.ElementType;
  accent?: "primary" | "success";
  description: string;
}) {
  const isSuccess = accent === "success";

  return (
    <div className="group rounded-2xl border border-border bg-surface p-5 transition duration-200 hover:border-primary/30 hover:bg-surface-elevated">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            isSuccess
              ? "bg-success/10 text-success"
              : "bg-primary/10 text-primary"
          }`}
        >
          <Icon size={19} />
        </div>

        <ArrowRight
          size={15}
          className="text-text-muted opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
        />
      </div>

      <div className="mt-5">
        <p className="text-sm text-text-muted">
          {label}
        </p>

        <p className="mt-1 text-2xl font-semibold tracking-tight text-text-primary">
          {value}
        </p>

        <p className="mt-1 text-xs text-text-muted">
          {description}
        </p>
      </div>
    </div>
  );
}
