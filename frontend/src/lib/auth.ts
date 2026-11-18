let accessToken: string | null = null;

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return accessToken;
}

export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    accessToken = token;
  }
}

export function removeToken(): void {
  if (typeof window !== "undefined") {
    accessToken = null;
  }
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}
