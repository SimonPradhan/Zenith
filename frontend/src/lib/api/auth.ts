import { ApiError, apiClient, refreshAccessToken } from "./client";
import type {
  LoginRequest,
  LoginResponse,
  User,
} from "@/types/auth";

export function login(data: LoginRequest) {
  return apiClient<LoginResponse>("/auth/login", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(data),
  });
}

export function register(data: {
  email: string;
  name: string;
  password: string;
}) {
  return apiClient<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Restore a session using the same shared refresh request used by API retries.
 * This prevents concurrent refreshes from rotating the same cookie twice.
 */
export async function refreshSession(): Promise<LoginResponse> {
  const access_token = await refreshAccessToken();

  if (!access_token) {
    throw new ApiError("Session expired. Please sign in again.", 401);
  }

  return {
    access_token,
    token_type: "bearer",
  };
}

export function logoutSession() {
  return apiClient<void>("/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

export function getMe(token?: string) {
  return apiClient<User>("/auth/me", { token });
}

export function createWidgetLinkCode(token: string) {
  return apiClient<{
    code: string;
    expires_in: number;
    open_url: string;
  }>("/auth/widget-link-code", {
    method: "POST",
    token,
  });
}

export function resendVerification(email: string) {
  return apiClient<{ message: string }>(
    "/auth/resend-verification",
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
  );
}

export function forgotPassword(email: string) {
  return apiClient<{ message: string }>(
    "/auth/forgot-password",
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
  );
}

export function resetPassword(
  token: string,
  newPassword: string,
) {
  return apiClient<{ message: string }>(
    "/auth/reset-password",
    {
      method: "POST",
      body: JSON.stringify({
        token,
        new_password: newPassword,
      }),
    },
  );
}
