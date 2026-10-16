import {
  ArrowUpRight,
  CheckCircle2,
  Circle,
  FileText,
  ListTodo,
  Sparkles,
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
      <StatCard label="Total tasks" value={totalTasks} icon={ListTodo} description="Things in motion" tone="yellow" stamp="MAKE IT HAPPEN" />
      <StatCard label="In progress" value={pendingCount} icon={Circle} description={pendingCount === 1 ? "One step at a time" : "One step at a time"} tone="blue" stamp="KEEP GOING" />
      <StatCard label="Completed" value={completedCount} icon={CheckCircle2} description={completedCount === 1 ? "A win worth celebrating" : "Wins worth celebrating"} tone="mint" stamp="LOOK AT YOU" />
      <StatCard label="Notes collected" value={totalNotes} icon={FileText} description="Ideas worth keeping" tone="pink" stamp="THOUGHT BANK" />
    </section>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  description,
  tone,
  stamp,
}: {
  label: string;
  value: number;
  icon: ElementType;
  description: string;
  tone: "yellow" | "blue" | "mint" | "pink";
  stamp: string;
}) {
  return (
    <article className={`comic-stat-card comic-stat-${tone} group relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden border-2 border-[#28251f] p-4 transition duration-200 sm:p-5`}>
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-[#28251f] bg-[#fbf5e9]/70 text-[#28251f] shadow-[2px_2px_0_#28251f]">
          <Icon size={20} strokeWidth={2.4} />
        </div>
        <span className="max-w-[105px] rotate-2 border border-[#28251f]/60 bg-[#fbf5e9]/60 px-2 py-1 text-right text-[8px] font-black uppercase leading-tight tracking-[0.12em] text-[#28251f]/80 sm:text-[9px]">
          {stamp}
        </span>
      </div>
      <div className="relative mt-4 min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#28251f]/75 sm:text-sm">{label}</p>
        <p className="mt-1 text-4xl font-black leading-none tracking-[-0.06em] text-[#28251f] sm:text-5xl">{value.toLocaleString()}</p>
        <p className="mt-2 text-xs font-semibold text-[#28251f]/75 sm:text-sm">{description}</p>
      </div>
      <ArrowUpRight className="absolute bottom-3 right-3 text-[#28251f]/70 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" size={19} />
      <Sparkles className="pointer-events-none absolute bottom-3 left-3 text-[#28251f]/25" size={15} />
    </article>
  );
}
