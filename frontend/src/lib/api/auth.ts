import { apiClient } from "./client";
import type {
  LoginRequest,
  LoginResponse,
  User,
} from "@/types/auth";

export function login(data: LoginRequest) {
  return apiClient<LoginResponse>("/auth/login", {
    method: "POST",
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

export function getMe(token: string) {
  return apiClient<User>("/auth/me", {
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
