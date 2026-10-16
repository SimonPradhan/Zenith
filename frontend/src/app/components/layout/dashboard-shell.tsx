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
  Settings,
  X,
} from "lucide-react";
import { useUser } from "@/app/context/user-context";
import GlobalSearch from "./global-search";
import ThemeToggle from "./theme-toggle";
import { useToast } from "@/app/components/ui/toast-provider";


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
  const toast = useToast();

  const {
    user,
    loading,
    logout,
  } = useUser();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  function handleLogout() {
    toast.success("You have been signed out.");
    logout();
  }

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
          comic-sidebar text-[#f4ecd8]
          transition-all duration-300
          ${sidebarWidth}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b-2 border-[#f4d64f]/60 px-5">
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center gap-3"
            onClick={() => setMobileOpen(false)}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-[#f4d64f] bg-[#1c1a16] text-sm font-bold text-[#f4d64f] shadow-[2px_2px_0_#f4d64f]">
              Z
            </div>

            {!collapsed && (
              <span className="comic-title text-xl uppercase tracking-wide">
                Zenith
              </span>
            )}
          </Link>

          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto rounded-lg p-2 text-[#bfb59c] hover:bg-white/10 hover:text-white lg:hidden"
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
              tracking-wider text-[#f4d64f]/80
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
                    group flex items-center gap-3 rounded-sm px-3 py-2.5
                    text-sm font-medium transition
                    ${
                      active
                        ? "border-2 border-[#1c1a16] bg-[#f4d64f] font-black text-[#1c1a16] shadow-[2px_2px_0_rgb(0_0_0/60%)]"
                        : "border-2 border-transparent text-[#e6dcc4] hover:bg-white/10 hover:text-white"
                    }
                    ${collapsed ? "justify-center" : ""}
                  `}
                >
                  <Icon
                    size={18}
                    className={
                      active
                        ? "text-[#1c1a16]"
                        : "text-[#bfb59c] group-hover:text-white"
                    }
                  />

                  {!collapsed && (
                    <span>{item.label}</span>
                  )}

                  {active && !collapsed && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#1c1a16]" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="my-6 h-0.5 bg-white/15" />

          <p
            className={`
              mb-2 px-3 text-[11px] font-semibold uppercase
              tracking-wider text-[#f4d64f]/80
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
                    group flex items-center gap-3 rounded-sm px-3 py-2.5
                    text-sm font-medium transition
                    ${
                      active
                        ? "border-2 border-[#1c1a16] bg-[#f4d64f] font-black text-[#1c1a16] shadow-[2px_2px_0_rgb(0_0_0/60%)]"
                        : "border-2 border-transparent text-[#e6dcc4] hover:bg-white/10 hover:text-white"
                    }
                    ${collapsed ? "justify-center" : ""}
                  `}
                >
                  <Icon
                    size={18}
                    className={
                      active
                        ? "text-[#1c1a16]"
                        : "text-[#bfb59c] group-hover:text-white"
                    }
                  />

                  {!collapsed && (
                    <span>{item.label}</span>
                  )}

                  {active && !collapsed && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#1c1a16]" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User */}
        <div className="comic-sidebar-account border-t-2 border-[#f4d64f]/50 p-3">
          <div
            className={`comic-sidebar-user flex items-center gap-3 border-2 border-transparent p-2 transition-colors ${collapsed ? "justify-center" : ""}`}
          >
            <div className="comic-sidebar-avatar flex h-9 w-9 shrink-0 items-center justify-center border-2 border-[#f4d64f] bg-[#f4d64f]/15 text-sm font-black text-[#f4d64f] shadow-[2px_2px_0_#f4d64f]">
              {user?.name?.charAt(0).toUpperCase() ?? "Z"}
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#f4ecd8]">
                  {loading
                    ? "Loading..."
                    : user?.name ?? "User"}
                </p>

                <p className="truncate text-xs text-[#bfb59c]">
                  {user?.email ?? ""}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
              className="comic-sidebar-logout shrink-0 border-2 border-transparent p-2 text-[#bfb59c] transition hover:-translate-y-px hover:border-[#ef8f7e] hover:bg-[#ef8f7e]/10 hover:text-[#ef8f7e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4d64f]"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Collapse */}
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="absolute -right-3 top-[72px] hidden h-6 w-6 items-center justify-center rounded-full border-2 border-[#1c1a16] bg-[#f4d64f] text-[#1c1a16] shadow-[2px_2px_0_rgb(0_0_0/50%)] lg:flex"
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
          min-h-screen
          ${collapsed ? "lg:pl-[76px]" : "lg:pl-[250px]"}
        `}
      >
        {/* Topbar */}
        <header className="dashboard-shell-topbar sticky top-0 z-30 flex h-16 items-center border-b-2 border-[var(--comic-ink)] px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="shell-icon-button mr-3 border-2 border-transparent p-2 text-text-secondary hover:-translate-y-px lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <div className="hidden max-w-md flex-1 sm:block">
            <div className="relative">
              <GlobalSearch />

              <kbd className="shell-shortcut absolute right-2 top-1/2 hidden -translate-y-1/2 border border-border px-1.5 py-0.5 text-[10px] md:block">
                ⌘ K
              </kbd>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
             <ThemeToggle />
            <button
              type="button"
              className="shell-icon-button relative border-2 border-transparent p-2 text-text-secondary transition hover:-translate-y-px"
              aria-label="Notifications"
            >
              <Bell size={19} />

              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
            </button>

            <div className="ml-1 h-6 w-px bg-border" />

            <div className="shell-user-chip ml-1 flex items-center gap-2 border-l-2 border-border pl-3">
              <div className="shell-user-avatar flex h-8 w-8 items-center justify-center border-2 border-[var(--comic-ink)] text-xs font-black shadow-[2px_2px_0_var(--comic-ink)]">
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
