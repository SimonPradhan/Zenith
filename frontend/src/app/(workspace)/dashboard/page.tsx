"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardHeader from "@/app/components/dashboard/dashboard-header";
import DashboardStats from "@/app/components/dashboard/dashboard-stats";
import TaskProgressCard from "@/app/components/dashboard/task-progress-card";
import QuickActions from "@/app/components/dashboard/quick-actions";
import RecentNotes from "@/app/components/dashboard/recent-notes";
import TodayTasks from "@/app/components/dashboard/today-tasks";
import OverdueTasks from "@/app/components/dashboard/overdue-tasks";
import DashboardSkeleton from "@/app/components/dashboard/dashboard-skeleton";

import { getTasks } from "@/lib/api/tasks";
import { getNotes } from "@/lib/api/notes";

import type { Task } from "@/types/task";
import type { Note } from "@/types/note";
import { getToken } from "@/lib/auth";
import { useUser } from "@/app/context/user-context";
import CustomizableDashboard from "@/app/components/dashboard/customizable-dashboard";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
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
        const [
          allTasks,
          pendingTasks,
          completedTasks,
          recentNotes,
          todaysTasks,
          overdueTasks,
        ] = await Promise.all([
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

          // Today and future tasks.
          getTasks(token, {
            limit: 10,
            offset: 0,
            due_from: getStartOfToday(),
            order_by_due_date: true,
          }),

          // Pending tasks that were due before today.
          getTasks(token, {
            limit: 10,
            offset: 0,
            due_to: getEndOfYesterday(),
            status: "pending",
            order_by_due_date: true,
          }),
        ]);

        setTodayTasks(todaysTasks.items);
        setOverdueTasks(overdueTasks.items);
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
    totalTasks === 0
      ? 0
      : Math.round((completedCount / totalTasks) * 100);

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

  function handleTaskClick(task: Task) {
    router.push(`/tasks?task=${encodeURIComponent(task.id)}`);
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        user={user}
        onCreateTask={handleCreateTask}
      />

      <CustomizableDashboard
        todayTasks={todayTasks}
        overdueTasks={overdueTasks}
        notes={notes}
        totalTasks={totalTasks}
        pendingCount={pendingCount}
        completedCount={completedCount}
        totalNotes={totalNotes}
        completionRate={completionRate}
        onCreateTask={handleCreateTask}
        onCreateNote={handleCreateNote}
        onViewTasks={handleViewTasks}
        onViewNotes={handleViewNotes}
        onTaskClick={handleTaskClick}
      />
    </div>
  );
}

function getStartOfToday(): string {
  const date = new Date();

  date.setHours(0, 0, 0, 0);

  return date.toISOString();
}

function getEndOfYesterday(): string {
  const date = new Date();

  date.setHours(0, 0, 0, 0);
  date.setMilliseconds(date.getMilliseconds() - 1);

  return date.toISOString();
}
