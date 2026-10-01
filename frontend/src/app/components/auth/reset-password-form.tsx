"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { resetPassword } from "@/lib/api/auth";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!token) {
      setError("This password reset link is invalid or missing.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, password);

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reset your password.",
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ==============================
   * SUCCESS STATE
   * ==============================
   */
  if (success) {
    return (
      <main className="min-h-screen bg-background">
        <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
          {/* Brand panel */}
          <section className="relative hidden overflow-hidden border-r border-border bg-surface lg:flex lg:flex-col">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />

              <div className="absolute -bottom-40 -right-20 h-[450px] w-[450px] rounded-full bg-primary/5 blur-[120px]" />

              <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:48px_48px]" />
            </div>

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

            <div className="relative z-10 flex flex-1 items-center px-10 xl:px-16">
              <div className="max-w-xl">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                  <Sparkles size={13} />
                  Account secured
                </div>

                <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-text-primary xl:text-6xl">
                  You&apos;re ready to get back to work.
                </h1>

                <p className="mt-6 max-w-lg text-base leading-7 text-text-secondary">
                  Your password has been updated successfully.
                  Your Zenith workspace is ready whenever you are.
                </p>

                <div className="mt-10 max-w-md rounded-2xl border border-border bg-background/40 p-5 backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <ShieldCheck size={19} />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        Password updated
                      </p>

                      <p className="mt-1 text-xs leading-5 text-text-muted">
                        Your previous password can no longer be used
                        to sign in.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 px-10 pb-8 text-xs text-text-muted xl:px-12">
              © {new Date().getFullYear()} Zenith
            </div>
          </section>

          {/* Success panel */}
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

              <div className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <CheckCircle2 size={30} />
                </div>

                <p className="mb-3 text-sm font-medium text-primary">
                  All set
                </p>

                <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-[34px]">
                  Password reset successfully
                </h1>

                <p className="mt-4 text-sm leading-6 text-text-secondary">
                  Your password has been changed successfully. You
                  can now sign in to your Zenith account using your
                  new password.
                </p>

                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="group mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/10 transition hover:bg-primary-hover hover:shadow-primary/20"
                >
                  Continue to login

                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </button>

                <p className="mt-6 text-xs leading-5 text-text-muted">
                  For security, your reset link can no longer be
                  used.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  /*
   * ==============================
   * RESET FORM
   * ==============================
   */
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
                Secure account recovery
              </div>

              <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-text-primary xl:text-6xl">
                Create a new password.
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-text-secondary">
                Choose a secure password that you&apos;ll remember.
                Once updated, you&apos;ll be able to sign in and
                continue using your workspace.
              </p>

              <div className="mt-10 max-w-md rounded-2xl border border-border bg-background/40 p-5 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ShieldCheck size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      Keep your account secure
                    </p>

                    <p className="mt-1 text-xs leading-5 text-text-muted">
                      Use at least 8 characters and avoid reusing
                      passwords from other accounts.
                    </p>
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

        {/* ==================== RESET PANEL ==================== */}
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
                Reset your password
              </h2>

              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Enter a new password below to secure your account.
              </p>
            </div>

            {/* Invalid token */}
            {!token && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm leading-5 text-error"
              >
                <AlertCircle
                  size={17}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  This password reset link is invalid or missing.
                </span>
              </div>
            )}

            {/* API / validation error */}
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
              {/* New password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  New password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your new password"
                    disabled={loading || !token}
                    className="h-12 w-full rounded-xl border border-border bg-surface px-10 pr-12 text-sm text-text-primary outline-none transition placeholder:text-text-muted hover:border-text-muted/40 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((value) => !value)
                    }
                    disabled={loading || !token}
                    aria-label={
                      showPassword
                        ? "Hide new password"
                        : "Show new password"
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

                <p className="mt-2 text-xs text-text-muted">
                  Must be at least 8 characters.
                </p>
              </div>

              {/* Confirm password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  Confirm new password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                  />

                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Confirm your new password"
                    disabled={loading || !token}
                    className="h-12 w-full rounded-xl border border-border bg-surface px-10 pr-12 text-sm text-text-primary outline-none transition placeholder:text-text-muted hover:border-text-muted/40 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((value) => !value)
                    }
                    disabled={loading || !token}
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirmed password"
                        : "Show confirmed password"
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-muted transition hover:bg-surface-elevated hover:text-text-primary disabled:pointer-events-none disabled:opacity-50"
                  >
                    {showConfirmPassword ? (
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
                disabled={loading || !token}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/10 transition hover:bg-primary-hover hover:shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Resetting password...
                  </>
                ) : (
                  <>
                    Reset password

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
              Your reset link is temporary and can only be used
              once.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
