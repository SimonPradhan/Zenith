import { apiClient } from "./client";
import type { DashboardPreferences } from "@/types/dashboard";

type DashboardPreferencesResponse = {
  preferences: Partial<DashboardPreferences>;
};

export function getDashboardPreferences(token: string) {
  return apiClient<DashboardPreferencesResponse>(
    "/dashboard/preferences/",
    { token },
  );
}

export function saveDashboardPreferences(
  token: string,
  preferences: DashboardPreferences,
) {
  return apiClient<DashboardPreferencesResponse>(
    "/dashboard/preferences/",
    {
      method: "PUT",
      token,
      body: JSON.stringify({ preferences }),
    },
  );
}
