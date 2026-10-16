"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardHeader from "@/app/components/dashboard/dashboard-header";
import DashboardSkeleton from "@/app/components/dashboard/dashboard-skeleton";

import { createTask, getTasks } from "@/lib/api/tasks";
import { getNotes } from "@/lib/api/notes";

import type { Task, TaskCreate } from "@/types/task";
import type { Note } from "@/types/note";
import { getToken } from "@/lib/auth";
import { useUser } from "@/app/context/user-context";
import CustomizableDashboard from "@/app/components/dashboard/customizable-dashboard";
import { TaskModal } from "@/app/components/tasks/task-modal";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [accessToken, setAccessToken] = useState<string>("");
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  const [totalTasks, setTotalTasks] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalNotes, setTotalNotes] = useState(0);

  const [loading, setLoading] = useState(true);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);

  useEffect(() => {
    if (userLoading || !user) {
      return;
    }

    async function loadDashboard() {
      const token = getToken();

      if (!token) {
        setLoading(false);
        return;
      }

      setAccessToken(token);

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
  }, [user, userLoading, dashboardRefreshKey]);

  if (userLoading || loading) {
    return <DashboardSkeleton />;
  }

  const completionRate =
    totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);

  function handleCreateTask() {
    setTaskModalOpen(true);
  }

  async function handleSubmitNewTask(taskData: TaskCreate) {
    const token = getToken();

    if (!token) {
      router.replace("/login");
      throw new Error("Your session has expired. Please sign in again.");
    }

    setCreatingTask(true);

    try {
      await createTask(token, taskData);
      setTaskModalOpen(false);
      setDashboardRefreshKey((current) => current + 1);
    } finally {
      setCreatingTask(false);
    }
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

  function handleNoteClick(note: Note) {
    router.push(`/notes?note=${encodeURIComponent(note.id)}`);
  }

  return (
    <div className="space-y-6">
      <DashboardHeader user={user} onCreateTask={handleCreateTask} />
      <TaskModal
        open={taskModalOpen}
        loading={creatingTask}
        onClose={() => {
          if (!creatingTask) setTaskModalOpen(false);
        }}
        onSubmit={handleSubmitNewTask}
      />
      <CustomizableDashboard
        token={accessToken}
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
        onNoteClick={handleNoteClick}
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
