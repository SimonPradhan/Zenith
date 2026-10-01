"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Mail,
  Sparkles,
  AlertCircle,
} from "lucide-react";

import { forgotPassword } from "@/lib/api/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const data = await forgotPassword(email);
      setMessage(data.message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send the reset link. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
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

          {/* Brand content */}
          <div className="relative z-10 flex flex-1 items-center px-10 xl:px-16">
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                <Sparkles size={13} />
                Account recovery
              </div>

              <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-text-primary xl:text-6xl">
                Get back to your workspace.
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-text-secondary">
                We&apos;ll help you securely regain access to your
                Zenith account and get back to the work that matters.
              </p>

              <div className="mt-10 max-w-md">
                <div className="rounded-2xl border border-border bg-background/40 p-5 backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <KeyRound size={19} />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        Secure password recovery
                      </p>

                      <p className="mt-1 text-xs leading-5 text-text-muted">
                        A secure reset link will be sent to the email
                        address associated with your account.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 px-10 pb-8 text-xs text-text-muted xl:px-12">
            © {new Date().getFullYear()} Zenith
          </div>
        </section>

        {/* ==================== RECOVERY PANEL ==================== */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[420px]">
            {/* Mobile logo */}
            <div className="mb-12 lg:hidden">
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
            </div>

            {/* Header */}
            <div className="mb-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <KeyRound size={22} />
              </div>

              <p className="mb-3 text-sm font-medium text-primary">
                Password recovery
              </p>

              <h2 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-[34px]">
                Forgot your password?
              </h2>

              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Enter the email address associated with your account
                and we&apos;ll send you a secure password reset link.
              </p>
            </div>

            {/* Success */}
            {message && (
              <div
                role="status"
                className="mb-5 flex items-start gap-3 rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm leading-5 text-success"
              >
                <CheckCircle2
                  size={17}
                  className="mt-0.5 shrink-0"
                />

                <span>{message}</span>
              </div>
            )}

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
                    required
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-border bg-surface px-10 text-sm text-text-primary outline-none transition placeholder:text-text-muted hover:border-text-muted/40 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/10 transition hover:bg-primary-hover hover:shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Sending reset link...
                  </>
                ) : (
                  <>
                    Send reset link

                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Back to login */}
            <Link
              href="/login"
              className="mt-7 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface text-sm font-medium text-text-primary transition hover:border-primary/40 hover:bg-surface-elevated hover:text-primary"
            >
              <ArrowLeft size={16} />
              Back to login
            </Link>

            <p className="mt-8 text-center text-xs leading-5 text-text-muted">
              For your security, password reset links are temporary
              and can only be used once.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
