"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { login } from "@/lib/api/auth";
import { setToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await login({
        email,
        password,
      });

      setToken(response.access_token);

      router.push("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to log in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-2xl">
        <h1 className="mb-2 text-3xl font-bold text-text-primary">
          Welcome back
        </h1>
        <p className="mb-8 text-text-secondary">
          Sign in to your Zenith account
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-error/20 bg-error/10 p-3 text-sm text-error">
            {" "}
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border border-border bg-surface-elevated px-4 py-3 text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-border bg-surface-elevated px-4 py-3 text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-3 font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
