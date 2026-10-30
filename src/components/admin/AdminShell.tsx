"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Tag,
  LayoutGrid,
  Smartphone,
  BookMarked,
  MessageSquare,
  Settings,
  Users,
  MessageCircleHeart,
  ExternalLink,
  LogOut,
  Shield,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/guides", label: "Guides", icon: BookOpen },
  { href: "/admin/brands", label: "Brands", icon: Tag },
  { href: "/admin/topics", label: "Topics", icon: LayoutGrid },
  { href: "/admin/devices", label: "Devices", icon: Smartphone },
  { href: "/admin/glossary", label: "Glossary", icon: BookMarked },
  { href: "/admin/forum", label: "Forum", icon: MessageSquare },
  { href: "/admin/feedback", label: "Feedback", icon: MessageCircleHeart },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Site settings", icon: Settings, soon: true },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const current = NAV.find((n) => isActive(n.href, n.exact))?.label ?? "Admin";

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="flex min-h-screen">
        <aside className="hidden w-60 shrink-0 border-r border-[var(--border)] bg-[var(--card)] lg:flex lg:flex-col">
          <div className="flex h-14 items-center gap-2 border-b border-[var(--border)] px-4">
            <Shield className="h-5 w-5 text-brand-600" />
            <span className="font-bold tracking-tight">TapPath Admin</span>
          </div>
          <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exact);
              if (item.soon) {
                return (
                  <div
                    key={item.href}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--muted-foreground)] opacity-60"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                    <span className="rounded bg-[var(--muted)] px-1.5 text-[10px] font-medium uppercase">Soon</span>
                  </div>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-[var(--border)] p-3">
            <div className="mb-2 truncate px-2 text-xs text-[var(--muted-foreground)]">{user?.email}</div>
            <Link href="/" className="mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)]">
              <ExternalLink className="h-4 w-4" /> View site
            </Link>
            <button type="button" onClick={() => logout()} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)]">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-[var(--border)] bg-[var(--card)]/90 px-4 backdrop-blur sm:px-6">
            <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] lg:hidden">
              <Shield className="h-4 w-4 text-brand-600" />
              <span className="font-semibold text-[var(--foreground)]">Admin</span>
            </div>
            <div className="hidden items-center gap-1 text-sm text-[var(--muted-foreground)] lg:flex">
              <Link href="/admin" className="hover:text-[var(--foreground)]">Admin</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-medium text-[var(--foreground)]">{current}</span>
            </div>
            <div className="ml-auto flex items-center gap-2 lg:hidden">
              <Link href="/" className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium">Site</Link>
            </div>
          </header>

          <div className="flex gap-1 overflow-x-auto border-b border-[var(--border)] px-2 py-2 lg:hidden">
            {NAV.filter((n) => !n.soon).map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium",
                    active ? "bg-brand-600 text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
