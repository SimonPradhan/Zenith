import { getToken, removeToken, setToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

type RequestOptions = RequestInit & {
  token?: string;
};

type TokenResponse = {
  access_token: string;
  token_type: string;
};

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          removeToken();
          return null;
        }

        const result = (await response.json()) as TokenResponse;
        setToken(result.access_token);
        return result.access_token;
      } catch {
        // Keep network failures distinct from a confirmed invalid session.
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
  }

  return refreshInFlight;
}

function shouldAttemptRefresh(endpoint: string): boolean {
  return ![
    "/auth/login",
    "/auth/register",
    "/auth/refresh",
    "/auth/logout",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-email",
  ].some((path) => endpoint.startsWith(path));
}

async function sendRequest(
  endpoint: string,
  fetchOptions: RequestInit,
  token?: string,
): Promise<Response> {
  const headers = new Headers(fetchOptions.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });
}

async function errorFromResponse(response: Response): Promise<Error> {
  let message = "Something went wrong";

  try {
    const error = await response.json();
    message = error.detail ?? message;
  } catch {
    // Ignore JSON parsing errors.
  }

  return new Error(message);
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token: suppliedToken, ...fetchOptions } = options;
  const initialToken = suppliedToken ?? getToken() ?? undefined;

  let response = await sendRequest(endpoint, fetchOptions, initialToken);

  if (
    response.status === 401
    && shouldAttemptRefresh(endpoint)
    && typeof window !== "undefined"
  ) {
    const freshToken = await refreshAccessToken();

    if (freshToken) {
      response = await sendRequest(endpoint, fetchOptions, freshToken);
    }
  }

  if (!response.ok) {
    throw await errorFromResponse(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
