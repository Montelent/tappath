"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Shield } from "lucide-react";
import AdminShell from "./AdminShell";

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <Shield className="h-12 w-12 text-amber-600" />
        <h1 className="mt-4 text-xl font-bold">Admin access required</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Sign in with an admin account to manage content and control the frontend.
        </p>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Demo: <code>admin@tappath.com</code> / <code>admin1234</code>
        </p>
        <Link
          href="/sign-in"
          className="mt-6 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
