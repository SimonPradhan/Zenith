"use client";

import { useEffect, useState } from "react";
import {
  Copy,
  Link2,
  LogOut,
  Mail,
  Smartphone,
  User as UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { createWidgetLinkCode, getMe } from "@/lib/api/auth";
import { getToken, removeToken } from "@/lib/auth";
import ThemeToggle from "@/app/components/layout/theme-toggle";
import type { User } from "@/types/auth";

export default function SettingsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [widgetLinkCode, setWidgetLinkCode] = useState("");
  const [widgetLinkMessage, setWidgetLinkMessage] = useState("");
  const [widgetLinkError, setWidgetLinkError] = useState(false);

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

  async function handleConnectWidget() {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setLinking(true);
    setWidgetLinkError(false);
    setWidgetLinkMessage("Creating a secure, one-time connection…");
    setWidgetLinkCode("");

    try {
      const result = await createWidgetLinkCode(token);
      setWidgetLinkCode(result.code);
      setWidgetLinkMessage(
        "Opening Zenith Widget… If Android doesn't open it, copy the code into the widget app within 2 minutes.",
      );

      // The native app redeems this short-lived, single-use code.
      window.location.href = result.open_url;
    } catch (error) {
      setWidgetLinkError(true);
      setWidgetLinkMessage(
        error instanceof Error
          ? error.message
          : "Couldn't create a widget connection. Please try again.",
      );
    } finally {
      setLinking(false);
    }
  }

  async function handleCopyWidgetCode() {
    try {
      await navigator.clipboard.writeText(widgetLinkCode);
      setWidgetLinkMessage("Code copied. Open Zenith Widgets and use the link-code option.");
    } catch {
      setWidgetLinkError(true);
      setWidgetLinkMessage("Couldn't copy automatically. Select and copy the code shown below.");
    }
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
    <div className="settings-comic-page mx-auto max-w-[1000px] space-y-7 sm:space-y-8">
      <section className="settings-page-heading">
        <p className="settings-eyebrow mb-3 inline-flex items-center border-2 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] shadow-[2px_2px_0_var(--comic-ink)]">Workspace / Preferences</p>
        <h1 className="comic-heading mt-1 text-4xl uppercase leading-none tracking-wide text-text-primary sm:text-5xl">
          Settings
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Manage your account and workspace preferences.
        </p>
      </section>

      <section className="settings-comic-card overflow-hidden rounded-md border-2 border-[var(--comic-ink)] bg-surface">
        <SectionHeader title="Profile" description="Your personal account information." />
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-4 border-b border-border pb-6">
            <div className="settings-avatar flex h-14 w-14 shrink-0 items-center justify-center border-2 border-[var(--comic-ink)] text-lg font-black shadow-[3px_3px_0_var(--comic-ink)]">
              {initials}
            </div>
            <div className="min-w-0">
              <h2 className="truncate font-medium text-text-primary">{user.name}</h2>
              <p className="mt-1 truncate text-sm text-text-muted">{user.email}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <InfoField label="Full name" value={user.name} icon={UserIcon} />
            <InfoField label="Email address" value={user.email} icon={Mail} />
          </div>
        </div>
      </section>

      <section className="settings-comic-card overflow-hidden rounded-md border-2 border-[var(--comic-ink)] bg-surface">
        <SectionHeader
          title="Android home-screen widget"
          description="Connect your home-screen widget to the account you're already signed in to."
        />
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="settings-icon-tile flex h-11 w-11 shrink-0 items-center justify-center border-2 border-[var(--comic-ink)] shadow-[2px_2px_0_var(--comic-ink)]">
              <Smartphone size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary">Use Zenith without signing in twice</p>
              <p className="mt-1 text-sm text-text-secondary">
                Generate a short-lived connection code here. Android will exchange it securely, then the widget can load your tasks and save quick notes.
              </p>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleConnectWidget}
              disabled={linking}
              className="settings-comic-button inline-flex min-h-11 items-center justify-center gap-2 border-2 px-4 py-2.5 text-sm font-black transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Link2 size={16} />
              {linking ? "Connecting…" : "Connect Android widget"}
            </button>
          </div>

          {widgetLinkMessage && (
            <p
              role="status"
              className={`text-sm ${widgetLinkError ? "text-error" : "text-text-secondary"}`}
            >
              {widgetLinkMessage}
            </p>
          )}

          {widgetLinkCode && (
            <div className="settings-comic-inset rounded-md border-2 border-dashed border-border bg-surface-elevated p-4">
              <p className="text-xs font-medium text-text-muted">One-time code · expires in 2 minutes</p>
              <p className="mt-2 break-all font-mono text-sm text-text-primary">{widgetLinkCode}</p>
              <button
                type="button"
                onClick={handleCopyWidgetCode}
                className="settings-comic-secondary mt-3 inline-flex items-center gap-2 border-2 border-[var(--comic-ink)] px-3 py-2 text-sm font-bold text-text-primary transition hover:-translate-y-px"
              >
                <Copy size={15} />
                Copy code
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="settings-comic-card overflow-hidden rounded-md border-2 border-[var(--comic-ink)] bg-surface">
        <SectionHeader title="Appearance" description="Choose the paper tone that suits your workspace." />
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="min-w-0">
            <p className="text-sm font-bold text-text-primary">Workspace theme</p>
            <p className="mt-1 text-sm text-text-secondary">Switch between warm light paper, dark ink, or your system preference.</p>
          </div>
          <div className="settings-theme-control shrink-0 border-2 border-[var(--comic-ink)] bg-surface-elevated p-1 shadow-[3px_3px_0_var(--comic-ink)]">
            <ThemeToggle />
          </div>
        </div>
      </section>

      <section className="settings-comic-card overflow-hidden rounded-md border-2 border-[var(--comic-ink)] bg-surface">
        <SectionHeader title="Account" description="Manage your Zenith account." />
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">Sign out</p>
              <p className="mt-1 text-xs text-text-muted">Sign out of your Zenith account on this device.</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="settings-comic-secondary inline-flex h-10 items-center justify-center gap-2 border-2 border-[var(--comic-ink)] px-4 text-sm font-bold text-text-primary transition hover:-translate-y-px hover:bg-[#efaaa7]/30"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </section>

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
    <div className="settings-comic-section-heading border-b-2 border-dashed border-border px-5 py-4 sm:px-6">
      <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      <p className="mt-1 text-xs text-text-muted">{description}</p>
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
      <label className="mb-2 block text-xs font-medium text-text-muted">{label}</label>
      <div className="flex h-11 items-center gap-3 rounded-xl border border-border bg-surface-elevated px-3.5">
        <Icon size={16} className="shrink-0 text-text-muted" />
        <span className="truncate text-sm text-text-primary">{value}</span>
      </div>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="settings-comic-page mx-auto max-w-[1000px] space-y-7 sm:space-y-8">
      <section>
        <div className="h-4 w-20 animate-pulse rounded bg-surface-elevated" />
        <div className="mt-3 h-9 w-40 animate-pulse rounded-lg bg-surface-elevated" />
        <div className="mt-3 h-4 w-80 animate-pulse rounded bg-surface-elevated" />
      </section>
      <div className="h-64 animate-pulse border-2 border-[var(--comic-ink)] bg-surface" />
      <div className="h-32 animate-pulse border-2 border-[var(--comic-ink)] bg-surface" />
      <div className="h-32 animate-pulse border-2 border-[var(--comic-ink)] bg-surface" />
    </div>
  );
}
