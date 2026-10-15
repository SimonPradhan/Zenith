import { DashboardShell } from "@/app/components/layout/dashboard-shell";
import { UserProvider } from "../context/user-context";
import { ThemeProvider } from "../context/theme-context";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <ThemeProvider>
        <DashboardShell>
          {children}
        </DashboardShell>
      </ThemeProvider>
    </UserProvider>
  );
}
