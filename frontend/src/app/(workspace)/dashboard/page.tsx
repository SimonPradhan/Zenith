"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardHeader from "@/app/components/dashboard/dashboard-header";
import DashboardStats from "@/app/components/dashboard/dashboard-stats";
import TaskProgressCard from "@/app/components/dashboard/task-progress-card";
import QuickActions from "@/app/components/dashboard/quick-actions";
import RecentTasks from "@/app/components/dashboard/recent-tasks";
import RecentNotes from "@/app/components/dashboard/recent-notes";
import DashboardSkeleton from "@/app/components/dashboard/dashboard-skeleton";

import { getTasks } from "@/lib/api/tasks";
import { getNotes } from "@/lib/api/notes";

import type { Task } from "@/types/task";
import type { Note } from "@/types/note";
import { getToken } from "@/lib/auth";
import { useUser } from "@/app/context/user-context";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  const [totalTasks, setTotalTasks] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalNotes, setTotalNotes] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading || !user) {
      return;
    }

    async function loadDashboard() {
      const token = getToken();

      if (!token) {
        return;
      }

      try {
        const [allTasks, pendingTasks, completedTasks, recentNotes] =
          await Promise.all([
            getTasks(token, {
              limit: 5,
              offset: 0,
            }),
            getTasks(token, {
              limit: 1,
              offset: 0,
              status: "pending",
            }),
            getTasks(token, {
              limit: 1,
              offset: 0,
              status: "completed",
            }),
            getNotes(token, {
              limit: 5,
              offset: 0,
            }),
          ]);

        setTasks(allTasks.items);
        setNotes(recentNotes.items);

        setTotalTasks(allTasks.total);
        setPendingCount(pendingTasks.total);
        setCompletedCount(completedTasks.total);
        setTotalNotes(recentNotes.total);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user, userLoading]);

  if (userLoading || loading) {
    return <DashboardSkeleton />;
  }

  const completionRate =
    totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);

  function handleCreateTask() {
    router.push("/tasks?create=true");
  }

  function handleCreateNote() {
    router.push("/notes?create=true");
  }

  function handleViewTasks() {
    router.push("/tasks");
  }

  function handleViewNotes() {
    router.push("/notes");
  }

  return (
    <div className="space-y-6">
      <DashboardHeader user={user} onCreateTask={handleCreateTask} />

      <DashboardStats
        totalTasks={totalTasks}
        pendingCount={pendingCount}
        completedCount={completedCount}
        totalNotes={totalNotes}
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <TaskProgressCard
          totalTasks={totalTasks}
          pendingCount={pendingCount}
          completedCount={completedCount}
          completionRate={completionRate}
          onViewTasks={handleViewTasks}
        />

        <QuickActions
          onCreateTask={handleCreateTask}
          onCreateNote={handleCreateNote}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentTasks
          tasks={tasks}
          onViewAll={handleViewTasks}
        />

        <RecentNotes
          notes={notes}
          onViewAll={handleViewNotes}
          onCreateNote={handleCreateNote}
        />
      </div>
    </div>
  );
}
