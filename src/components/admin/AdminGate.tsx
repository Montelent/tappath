"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Shield } from "lucide-react";
import AdminShell from "./AdminShell";

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="admin-wp flex min-h-screen items-center justify-center bg-[#f0f0f1] text-[#1d2327]">
        <Loader2 className="h-8 w-8 animate-spin text-[#2271b1]" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="admin-wp flex min-h-screen items-center justify-center bg-[#f0f0f1] px-4 text-[#1d2327]">
        <div className="w-full max-w-md overflow-hidden rounded border border-[#c3c4c7] bg-white shadow-sm">
          <div className="border-b border-[#c3c4c7] bg-[#f6f7f7] px-5 py-3 text-[14px] font-semibold text-[#1d2327]">
            Admin login required
          </div>
          <div className="space-y-4 p-6 text-center">
            <Shield className="mx-auto h-10 w-10 text-[#dba617]" />
            <p className="text-[13px] text-[#646970]">
              Sign in with an admin account to manage content, SEO, menus, and site settings.
            </p>
            <p className="rounded border border-[#c3c4c7] bg-[#f6f7f7] px-3 py-2 text-[12px] text-[#50575e]">
              Demo account: <code className="font-semibold">admin@tappath.com</code> /{" "}
              <code className="font-semibold">admin1234</code>
            </p>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center rounded border border-[#2271b1] bg-[#2271b1] px-5 py-2 text-[13px] font-medium text-white hover:bg-[#135e96]"
            >
              Sign in to admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
