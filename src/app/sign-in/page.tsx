import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to TapPath to confirm guides, save progress, and join discussions.",
};

export default function SignInPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <Link href="/" className="text-xl font-bold tracking-tight text-brand-600 dark:text-brand-400">
            TapPath
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Sign in</h1>
          <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">
            Confirm guides, track progress, and join the community.
          </p>
        </div>

        <AuthForm mode="sign-in" />

        <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            Sign up
          </Link>
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
        By continuing you agree to our{" "}
        <Link href="/terms" className="underline hover:text-[var(--foreground)]">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline hover:text-[var(--foreground)]">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
