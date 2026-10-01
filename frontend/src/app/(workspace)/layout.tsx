import { DashboardShell } from "@/app/components/layout/dashboard-shell";
import { UserProvider } from "../context/user-context";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <DashboardShell>
        {children}
      </DashboardShell>
    </UserProvider>
  );
}
