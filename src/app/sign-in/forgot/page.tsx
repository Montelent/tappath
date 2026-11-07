import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Account recovery options for TapPath.",
  alternates: { canonical: "/sign-in/forgot" },
};

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <Link href="/" className="text-xl font-bold tracking-tight text-brand-600 dark:text-brand-400">
            TapPath
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Forgot password</h1>
          <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">
            Use the notice below for current account recovery options.
          </p>
        </div>

        <p className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          Password reset is not configured yet. Please contact the site administrator for help accessing your account.
        </p>

        <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
          <Link
            href="/sign-in"
            className="font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
