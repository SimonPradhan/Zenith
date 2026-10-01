import { Suspense } from "react";
import VerifyEmailForm from "../components/auth/verify-email-form";

function VerifyEmailLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />

        <p className="mt-4 text-sm text-muted-foreground">
          Verifying your email...
        </p>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailForm />
    </Suspense>
  );
}
