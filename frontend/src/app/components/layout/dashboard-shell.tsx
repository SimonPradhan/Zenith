"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Bell,
  CheckSquare,
  ChevronLeft,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  X,
} from "lucide-react";
import { useUser } from "@/app/context/user-context";


const navigation = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    label: "Notes",
    href: "/notes",
    icon: FileText,
  },
];

const workspaceNavigation = [
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const {
    user,
    loading,
    logout,
  } = useUser();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const sidebarWidth = collapsed
    ? "w-[76px]"
    : "w-[250px]";

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          border-r border-border bg-surface
          transition-all duration-300
          ${sidebarWidth}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border px-5">
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center gap-3"
            onClick={() => setMobileOpen(false)}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white shadow-lg shadow-primary/20">
              Z
            </div>

            {!collapsed && (
              <span className="text-lg font-semibold tracking-tight">
                Zenith
              </span>
            )}
          </Link>

          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto rounded-lg p-2 text-text-muted hover:bg-surface-elevated hover:text-text-primary lg:hidden"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p
            className={`
              mb-2 px-3 text-[11px] font-semibold uppercase
              tracking-wider text-text-muted
              ${collapsed ? "hidden" : ""}
            `}
          >
            Workspace
          </p>

          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={`
                    group flex items-center gap-3 rounded-xl px-3 py-2.5
                    text-sm font-medium transition
                    ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
                    }
                    ${collapsed ? "justify-center" : ""}
                  `}
                >
                  <Icon
                    size={18}
                    className={
                      active
                        ? "text-primary"
                        : "text-text-muted group-hover:text-text-primary"
                    }
                  />

                  {!collapsed && (
                    <span>{item.label}</span>
                  )}

                  {active && !collapsed && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="my-6 h-px bg-border" />

          <p
            className={`
              mb-2 px-3 text-[11px] font-semibold uppercase
              tracking-wider text-text-muted
              ${collapsed ? "hidden" : ""}
            `}
          >
            Account
          </p>

          <div className="space-y-1">
            {workspaceNavigation.map((item) => {
              const Icon = item.icon;

              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={`
                    group flex items-center gap-3 rounded-xl px-3 py-2.5
                    text-sm font-medium transition
                    ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
                    }
                    ${collapsed ? "justify-center" : ""}
                  `}
                >
                  <Icon
                    size={18}
                    className={
                      active
                        ? "text-primary"
                        : "text-text-muted group-hover:text-text-primary"
                    }
                  />

                  {!collapsed && (
                    <span>{item.label}</span>
                  )}

                  {active && !collapsed && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User */}
        <div className="border-t border-border p-3">
          <div
            className={`
              flex items-center gap-3 rounded-xl p-2
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {user?.name?.charAt(0).toUpperCase() ?? "Z"}
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">
                  {loading
                    ? "Loading..."
                    : user?.name ?? "User"}
                </p>

                <p className="truncate text-xs text-text-muted">
                  {user?.email ?? ""}
                </p>
              </div>
            )}

            {!collapsed && (
              <button
                type="button"
                onClick={logout}
                title="Logout"
                className="rounded-lg p-2 text-text-muted transition hover:bg-error/10 hover:text-error"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Collapse */}
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="absolute -right-3 top-[72px] hidden h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-text-muted shadow-lg hover:text-text-primary lg:flex"
          aria-label={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          <ChevronLeft
            size={14}
            className={
              collapsed ? "rotate-180" : ""
            }
          />
        </button>
      </aside>

      {/* Main */}
      <div
        className={`
          min-h-screen transition-[padding] duration-300
          ${
            collapsed
              ? "lg:pl-[76px]"
              : "lg:pl-[250px]"
          }
        `}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="mr-3 rounded-lg p-2 text-text-secondary hover:bg-surface-elevated hover:text-text-primary lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <div className="hidden max-w-md flex-1 sm:block">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />

              <input
                type="search"
                placeholder="Search..."
                className="h-9 w-full rounded-lg border border-border bg-surface pl-10 pr-4 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
              />

              <kbd className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-surface-elevated px-1.5 py-0.5 text-[10px] text-text-muted md:block">
                ⌘ K
              </kbd>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="relative rounded-lg p-2 text-text-secondary transition hover:bg-surface-elevated hover:text-text-primary"
              aria-label="Notifications"
            >
              <Bell size={19} />

              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
            </button>

            <div className="ml-1 h-6 w-px bg-border" />

            <div className="flex items-center gap-2 pl-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {user?.name?.charAt(0).toUpperCase() ?? "Z"}
              </div>

              <span className="hidden max-w-[120px] truncate text-sm font-medium sm:block">
                {loading
                  ? "Loading..."
                  : user?.name ?? "User"}
              </span>
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
