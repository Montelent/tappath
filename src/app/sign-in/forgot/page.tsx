import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your TapPath password.",
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
            Enter your email and we&apos;ll send a reset link when auth is connected.
          </p>
        </div>

        <form className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <button
            type="button"
            className="flex w-full items-center justify-center rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
          >
            Send reset link
          </button>
        </form>

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
