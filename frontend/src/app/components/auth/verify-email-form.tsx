"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
  MailCheck,
} from "lucide-react";

type Status = "loading" | "success" | "error";

export default function VerifyEmailForm() {
  const verificationStarted = useRef(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token || verificationStarted.current) {
      return;
    }

    verificationStarted.current = true;

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email?token=${encodeURIComponent(token)}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to verify your email address.",
          );
        }

        setStatus("success");
        setMessage(
          data.message || "Your email has been verified successfully.",
        );
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Something went wrong while verifying your email.",
        );
      }
    };

    verifyEmail();
  }, [token]);

  const displayStatus = !token ? "error" : status;

  const displayMessage = !token
    ? "Verification token is missing."
    : message;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link href="/login" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white shadow-lg shadow-primary/20 transition-transform duration-200 group-hover:scale-105">
              Z
            </div>

            <span className="text-lg font-semibold tracking-tight text-text-primary">
              Zenith
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-7 shadow-xl shadow-black/5 sm:p-9">
          {displayStatus === "loading" && (
            <div className="text-center">
              <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <LoaderCircle
                  size={30}
                  strokeWidth={1.8}
                  className="animate-spin"
                />
              </div>

              <p className="mb-2 text-sm font-medium text-primary">
                Almost there
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
                Verifying your email
              </h1>

              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Please wait while we verify your email address.
              </p>

              <div className="mt-7 h-1 overflow-hidden rounded-full bg-primary/10">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
              </div>
            </div>
          )}

          {displayStatus === "success" && (
            <div className="text-center">
              <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MailCheck size={30} strokeWidth={1.8} />
              </div>

              <p className="mb-2 text-sm font-medium text-primary">
                All set
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
                Email verified
              </h1>

              <p className="mt-3 text-sm leading-6 text-text-secondary">
                {displayMessage}
              </p>

              <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-surface p-4 text-left">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-primary"
                />

                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Your account is ready
                  </p>

                  <p className="mt-1 text-xs leading-5 text-text-secondary">
                    You can now sign in and start using your Zenith
                    workspace.
                  </p>
                </div>
              </div>

              <Link
                href="/login"
                className="group mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/10 transition-all hover:bg-primary-hover hover:shadow-primary/20"
              >
                Continue to login
                <ArrowRight
                  size={17}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          )}

          {displayStatus === "error" && (
            <div className="text-center">
              <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-error/10 text-error">
                <CircleAlert size={30} strokeWidth={1.8} />
              </div>

              <p className="mb-2 text-sm font-medium text-error">
                Verification issue
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
                Verification failed
              </h1>

              <p className="mt-3 text-sm leading-6 text-text-secondary">
                {displayMessage}
              </p>

              <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-left">
                <p className="text-sm font-medium text-text-primary">
                  What can you do?
                </p>

                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  If this link has already been used, your email may
                  already be verified. Otherwise, return to login and
                  try again with a fresh verification email.
                </p>
              </div>

              <Link
                href="/login"
                className="mt-7 flex h-11 w-full items-center justify-center rounded-xl border border-border text-sm font-medium text-text-primary transition-all hover:border-text-muted hover:bg-surface"
              >
                Back to login
              </Link>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-text-muted">
          © {new Date().getFullYear()} Zenith
        </p>
      </div>
    </main>
  );
}
