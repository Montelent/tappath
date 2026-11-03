"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Shield } from "lucide-react";
import AdminShell from "./AdminShell";
import "@/app/admin-wp.css";

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const [adminDark, setAdminDark] = useState(false);

  useEffect(() => {
    try {
      setAdminDark(localStorage.getItem("admin-theme") === "dark");
    } catch {
      /* ignore */
    }
  }, []);

  const wrap = (node: React.ReactNode) => (
    <div className={"admin-wp min-h-screen " + (adminDark ? "admin-dark" : "")}>{node}</div>
  );

  if (loading) {
    return wrap(
      <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--a-bg)", color: "var(--a-fg)" }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--a-accent)" }} />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return wrap(
      <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "var(--a-bg)", color: "var(--a-fg)" }}>
        <div
          className="w-full max-w-md overflow-hidden rounded border shadow-sm"
          style={{ background: "var(--a-card)", borderColor: "var(--a-border)" }}
        >
          <div
            className="border-b px-5 py-3 text-[14px] font-semibold"
            style={{ background: "var(--a-panel-head)", borderColor: "var(--a-border)", color: "var(--a-fg)" }}
          >
            Admin login required
          </div>
          <div className="space-y-4 p-6 text-center">
            <Shield className="mx-auto h-10 w-10" style={{ color: "var(--a-warn-border)" }} />
            <p className="text-[13px]" style={{ color: "var(--a-muted)" }}>
              Sign in with an admin account to manage content, SEO, menus, and site settings.
            </p>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center rounded border px-5 py-2 text-[13px] font-medium"
              style={{
                background: "var(--a-accent)",
                borderColor: "var(--a-accent)",
                color: "var(--a-accent-text)",
              }}
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
