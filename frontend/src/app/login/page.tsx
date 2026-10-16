"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { login } from "@/lib/api/auth";
import { setToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
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
      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-comic-page min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* ==================== BRAND PANEL ==================== */}
        <section className="relative hidden overflow-hidden border-r border-border bg-surface lg:flex lg:flex-col">
          {/* Background decoration */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />

            <div className="absolute -bottom-40 -right-20 h-[450px] w-[450px] rounded-full bg-primary/5 blur-[120px]" />

            <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:48px_48px]" />
          </div>

          {/* Logo */}
          <div className="relative z-10 p-10 xl:p-12">
            <Link
              href="/login"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white shadow-lg shadow-primary/20">
                Z
              </div>

              <span className="text-lg font-semibold tracking-tight text-text-primary">
                Zenith
              </span>
            </Link>
          </div>

          {/* Main copy */}
          <div className="relative z-10 flex flex-1 items-center px-10 xl:px-16">
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                <Sparkles size={13} />
                Your workspace, simplified
              </div>

              <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-text-primary xl:text-6xl">
                Focus on the work that matters.
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-text-secondary">
                Keep your tasks organized, capture important ideas,
                and manage your everyday work from one focused
                workspace.
              </p>

              <div className="mt-10 grid max-w-md grid-cols-2 gap-3">
                <FeatureCard
                  title="Tasks"
                  description="Stay on top of your work"
                />

                <FeatureCard
                  title="Notes"
                  description="Keep ideas in one place"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 px-10 pb-8 text-xs text-text-muted xl:px-12">
            © {new Date().getFullYear()} Zenith
          </div>
        </section>

        {/* ==================== LOGIN PANEL ==================== */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[420px]">
            {/* Mobile logo */}
            <div className="mb-12 flex items-center justify-between lg:hidden">
              <Link
                href="/login"
                className="inline-flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white">
                  Z
                </div>

                <span className="text-lg font-semibold tracking-tight text-text-primary">
                  Zenith
                </span>
              </Link>

              <Link
                href="/register"
                className="text-sm font-medium text-primary transition hover:text-primary-hover"
              >
                Sign up
              </Link>
            </div>

            {/* Header */}
            <div className="mb-8">
              <p className="mb-3 text-sm font-medium text-primary">
                Welcome back
              </p>

              <h2 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-[34px]">
                Sign in to your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Enter your credentials to continue to your
                workspace.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm leading-5 text-error"
              >
                <AlertCircle
                  size={17}
                  className="mt-0.5 shrink-0"
                />

                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              aria-busy={loading}
              className="space-y-5"
            >
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    autoFocus
                    required
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-border bg-surface px-10 text-sm text-text-primary outline-none transition placeholder:text-text-muted hover:border-text-muted/40 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-text-primary"
                  >
                    Password
                  </label>

                  <Link
                    href="/forget-password"
                    className="text-xs font-medium text-primary transition hover:text-primary-hover"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-border bg-surface px-10 pr-12 text-sm text-text-primary outline-none transition placeholder:text-text-muted hover:border-text-muted/40 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((value) => !value)
                    }
                    disabled={loading}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-muted transition hover:bg-surface-elevated hover:text-text-primary disabled:pointer-events-none disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/10 transition hover:bg-primary-hover hover:shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in

                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Signup */}
            <div className="mt-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />

              <span className="text-xs text-text-muted">
                New to Zenith?
              </span>

              <div className="h-px flex-1 bg-border" />
            </div>

            <Link
              href="/register"
              className="mt-4 flex h-11 w-full items-center justify-center rounded-xl border border-border bg-surface text-sm font-medium text-text-primary transition hover:border-primary/40 hover:bg-surface-elevated hover:text-primary"
            >
              Create an account
            </Link>

            <p className="mt-8 text-center text-xs leading-5 text-text-muted">
              By continuing, you agree to use Zenith responsibly
              and keep your account credentials secure.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/40 p-4 backdrop-blur-sm">
      <p className="text-sm font-medium text-text-primary">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-text-muted">
        {description}
      </p>
    </div>
  );
}
