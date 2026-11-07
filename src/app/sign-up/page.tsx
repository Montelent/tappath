import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a TapPath account to confirm guides and join discussions.",
  alternates: { canonical: "/sign-up" },
};

export default async function SignUpPage() {
  const s = await getSiteSettings();

  if (!s.allow_signups) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight">Sign-ups closed</h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            New accounts are not being accepted right now.
          </p>
          <Link
            href="/sign-in"
            className="mt-6 inline-block text-sm font-medium text-brand-600 hover:underline"
          >
            {s.nav_sign_in}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <Link href="/" className="text-xl font-bold tracking-tight text-brand-600 dark:text-brand-400">
            {s.site_name}
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Create account</h1>
          <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">
            Free account — confirm guides and help others.
          </p>
        </div>

        <AuthForm mode="sign-up" />

        <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            {s.nav_sign_in}
          </Link>
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
        By creating an account you agree to our{" "}
        <Link href="/pages/terms" className="underline hover:text-[var(--foreground)]">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/pages/privacy" className="underline hover:text-[var(--foreground)]">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
