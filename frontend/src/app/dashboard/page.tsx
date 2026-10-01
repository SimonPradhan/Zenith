"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getToken, removeToken } from "@/lib/auth";
import { apiClient } from "@/lib/api/client";
import type { User } from "@/types/auth";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const currentUser = await apiClient<User>("/auth/me", {
          token,
        });

        setUser(currentUser);
      } catch {
        removeToken();
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [router]);

  function handleLogout() {
    removeToken();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Welcome back
            </p>

            <h1 className="text-3xl font-bold text-gray-900">
              {user?.name}
            </h1>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Logout
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Notes
            </p>

            <p className="mt-2 text-3xl font-bold">
              —
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Tasks
            </p>

            <p className="mt-2 text-3xl font-bold">
              —
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Account
            </p>

            <p className="mt-2 truncate font-medium">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
