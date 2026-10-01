"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

import { register, resendVerification } from "@/lib/api/auth";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");

  async function handleResendVerification() {
    setResending(true);
    setResendMessage("");
    setResendError("");

    try {
      const data = await resendVerification(email.trim());

      setResendMessage(data.message);
    } catch (error) {
      setResendError(
        error instanceof Error
          ? error.message
          : "Unable to resend the verification email.",
      );
    } finally {
      setResending(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      setRegistered(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create your account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* =========================================================
            BRAND PANEL
        ========================================================= */}
        <section className="relative hidden overflow-hidden border-r border-border bg-surface lg:flex lg:flex-col lg:justify-between">
          {/* Decorative background */}
          <div className="pointer-events-none absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

          {/* Grid texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Logo */}
          <div className="relative z-10 p-10 xl:p-14">
            <Link
              href="/login"
              className="group inline-flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white shadow-lg shadow-primary/20 transition-transform duration-200 group-hover:scale-105">
                Z
              </div>

              <span className="text-lg font-semibold tracking-tight text-text-primary">
                Zenith
              </span>
            </Link>
          </div>

          {/* Main brand message */}
          <div className="relative z-10 max-w-2xl px-10 pb-20 xl:px-14">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-2 text-xs font-medium text-primary">
              <Sparkles size={14} />
              Your workspace starts here
            </div>

            <h1 className="max-w-xl text-4xl font-semibold leading-[1.1] tracking-tight text-text-primary xl:text-6xl">
              Bring your work into one clear space.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-text-secondary">
              Organize your tasks, capture your ideas, and keep
              everything that matters close at hand.
            </p>

            {/* Feature list */}
            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CheckCircle2 size={16} />
                </div>

                <span>Keep tasks and notes organized</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck size={16} />
                </div>

                <span>Your account is protected with secure authentication</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles size={16} />
                </div>

                <span>A focused workspace built around you</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 px-10 pb-8 text-xs text-text-muted xl:px-14">
            © {new Date().getFullYear()} Zenith
          </div>
        </section>

        {/* =========================================================
            REGISTER PANEL
        ========================================================= */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="mb-12 flex items-center justify-between lg:hidden">
              <Link href="/login" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white shadow-lg shadow-primary/20">
                  Z
                </div>

                <span className="text-lg font-semibold tracking-tight text-text-primary">
                  Zenith
                </span>
              </Link>

              <Link
                href="/login"
                className="text-sm font-medium text-text-secondary transition hover:text-primary"
              >
                Sign in
              </Link>
            </div>

            {/* =====================================================
                SUCCESS / CHECK EMAIL
            ===================================================== */}
            {registered ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Mail size={28} strokeWidth={1.8} />
                </div>

                <p className="mb-2 text-sm font-medium text-primary">
                  Almost there
                </p>

                <h2 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
                  Check your email
                </h2>

                <p className="mt-4 text-sm leading-6 text-text-secondary">
                  We&apos;ve sent a verification link to:
                </p>

                <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-surface p-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Mail size={17} />
                  </div>

                  <span className="min-w-0 truncate text-sm font-medium text-text-primary">
                    {email}
                  </span>
                </div>

                <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ShieldCheck size={16} />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        Verify your email to continue
                      </p>

                      <p className="mt-1.5 text-xs leading-5 text-text-secondary">
                        Open the email from Zenith and click the
                        verification link. The link will remain valid
                        for 24 hours.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  {/* Resend feedback */}
                  {resendMessage && (
                    <div
                      role="status"
                      className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary"
                    >
                      {resendMessage}
                    </div>
                  )}

                  {resendError && (
                    <div
                      role="alert"
                      className="rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error"
                    >
                      {resendError}
                    </div>
                  )}

                  {/* Resend */}
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-text-secondary transition hover:bg-surface hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RefreshCw
                      size={15}
                      className={resending ? "animate-spin" : ""}
                    />

                    {resending ? "Sending verification email..." : "Resend verification email"}
                  </button>

                  {/* Login */}
                  <Link
                    href="/login"
                    className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/10 transition hover:bg-primary-hover hover:shadow-primary/20"
                  >
                    Continue to sign in

                    <ArrowRight
                      size={17}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </Link>

                  {/* Create another account */}
                  <button
                    type="button"
                    onClick={() => {
                      setRegistered(false);
                      setError("");
                      setResendMessage("");
                      setResendError("");
                    }}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-text-secondary transition hover:bg-surface hover:text-text-primary"
                  >
                    <RefreshCw size={15} />
                    Create another account
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="mb-8">
                  <p className="mb-2 text-sm font-medium text-primary">
                    Get started
                  </p>

                  <h2 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
                    Create your account
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-text-secondary">
                    Set up your Zenith workspace and start keeping
                    your work organized.
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div
                    role="alert"
                    className="mb-6 flex items-start gap-3 rounded-xl border border-error/20 bg-error/10 px-4 py-3.5 text-sm text-error"
                  >
                    <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-error" />

                    <span>{error}</span>
                  </div>
                )}

                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium text-text-primary"
                    >
                      Full name
                    </label>

                    <div className="relative">
                      <User
                        size={17}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                      />

                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(event) =>
                          setName(event.target.value)
                        }
                        placeholder="Enter your full name"
                        autoComplete="name"
                        required
                        minLength={1}
                        maxLength={100}
                        className="h-12 w-full rounded-xl border border-border bg-surface-elevated pl-10 pr-4 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted hover:border-text-muted focus:border-primary focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                  </div>

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
                        required
                        className="h-12 w-full rounded-xl border border-border bg-surface-elevated pl-10 pr-4 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted hover:border-text-muted focus:border-primary focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-text-primary"
                      >
                        Password
                      </label>

                      <span className="text-xs text-text-muted">
                        8–128 characters
                      </span>
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
                        placeholder="Create a secure password"
                        autoComplete="new-password"
                        required
                        minLength={8}
                        maxLength={128}
                        className="h-12 w-full rounded-xl border border-border bg-surface-elevated pl-10 pr-11 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted hover:border-text-muted focus:border-primary focus:ring-4 focus:ring-primary/10"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((value) => !value)
                        }
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-text-muted transition hover:bg-surface hover:text-text-primary"
                      >
                        {showPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Terms */}
                  <p className="text-xs leading-5 text-text-muted">
                    By creating an account, you agree to use Zenith
                    responsibly and keep your account credentials secure.
                  </p>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/10 transition-all hover:bg-primary-hover hover:shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create account

                        <ArrowRight
                          size={17}
                          className="transition-transform duration-200 group-hover:translate-x-0.5"
                        />
                      </>
                    )}
                  </button>
                </form>

                {/* Login link */}
                <div className="mt-8 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />

                  <span className="text-xs text-text-muted">
                    Already have an account?
                  </span>

                  <div className="h-px flex-1 bg-border" />
                </div>

                <Link
                  href="/login"
                  className="mt-5 flex h-11 w-full items-center justify-center rounded-xl border border-border text-sm font-medium text-text-primary transition-all hover:bg-surface hover:border-text-muted"
                >
                  Sign in to Zenith
                </Link>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
