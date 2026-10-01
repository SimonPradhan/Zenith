"use client";

import { useEffect, useState } from "react";
import {
  Check,
  LogOut,
  Mail,
  Moon,
  User as UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { getMe } from "@/lib/api/auth";
import { getToken, removeToken } from "@/lib/auth";
import type { User } from "@/types/auth";

export default function SettingsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      const token = getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const currentUser = await getMe(token);

        if (!cancelled) {
          setUser(currentUser);
        }
      } catch {
        if (!cancelled) {
          removeToken();
          router.replace("/login");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [router]);

  function handleLogout() {
    removeToken();
    router.replace("/login");
  }

  if (loading) {
    return <SettingsSkeleton />;
  }

  if (!user) {
    return null;
  }

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-[1000px] space-y-8">
      {/* Header */}
      <section>
        <p className="text-sm font-medium text-primary">
          Workspace
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
          Settings
        </h1>

        <p className="mt-2 text-sm text-text-secondary">
          Manage your account and workspace preferences.
        </p>
      </section>

      {/* Profile */}
      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <SectionHeader
          title="Profile"
          description="Your personal account information."
        />

        <div className="p-5 sm:p-6">
          {/* Avatar */}
          <div className="flex items-center gap-4 border-b border-border pb-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg font-semibold text-primary">
              {initials}
            </div>

            <div className="min-w-0">
              <h2 className="truncate font-medium text-text-primary">
                {user.name}
              </h2>

              <p className="mt-1 truncate text-sm text-text-muted">
                {user.email}
              </p>
            </div>
          </div>

          {/* Fields */}
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <InfoField
              label="Full name"
              value={user.name}
              icon={UserIcon}
            />

            <InfoField
              label="Email address"
              value={user.email}
              icon={Mail}
            />
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <SectionHeader
          title="Appearance"
          description="Customize how Zenith looks on your device."
        />

        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface-elevated p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Moon size={18} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary">
                  Dark theme
                </p>

                <p className="mt-1 text-xs text-text-muted">
                  Zenith currently uses the dark workspace theme.
                </p>
              </div>
            </div>

            <div className="flex h-6 w-11 shrink-0 items-center justify-end rounded-full bg-primary px-1">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-white">
                <Check
                  size={10}
                  className="text-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Account */}
      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <SectionHeader
          title="Account"
          description="Manage your Zenith account."
        />

        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">
                Sign out
              </p>

              <p className="mt-1 text-xs text-text-muted">
                Sign out of your Zenith account on this device.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-text-secondary transition hover:border-error/30 hover:bg-error/5 hover:text-error"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </section>

      {/* Account metadata */}
      <p className="text-center text-xs text-text-muted">
        Account created{" "}
        {new Date(user.created_at).toLocaleDateString(undefined, {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </p>
    </div>
  );
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-border px-5 py-4 sm:px-6">
      <h2 className="text-sm font-semibold text-text-primary">
        {title}
      </h2>

      <p className="mt-1 text-xs text-text-muted">
        {description}
      </p>
    </div>
  );
}

function InfoField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-text-muted">
        {label}
      </label>

      <div className="flex h-11 items-center gap-3 rounded-xl border border-border bg-surface-elevated px-3.5">
        <Icon
          size={16}
          className="shrink-0 text-text-muted"
        />

        <span className="truncate text-sm text-text-primary">
          {value}
        </span>
      </div>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="mx-auto max-w-[1000px] space-y-8">
      <section>
        <div className="h-4 w-20 animate-pulse rounded bg-surface-elevated" />

        <div className="mt-3 h-9 w-40 animate-pulse rounded-lg bg-surface-elevated" />

        <div className="mt-3 h-4 w-80 animate-pulse rounded bg-surface-elevated" />
      </section>

      <div className="h-64 animate-pulse rounded-2xl border border-border bg-surface" />

      <div className="h-32 animate-pulse rounded-2xl border border-border bg-surface" />

      <div className="h-32 animate-pulse rounded-2xl border border-border bg-surface" />
    </div>
  );
}
