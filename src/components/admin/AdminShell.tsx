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
  User,
  MessageCircleHeart,
  ExternalLink,
  LogOut,
  Shield,
  ChevronRight,
  Search,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import "@/app/admin-wp.css";

const NAV_GROUPS: {
  label?: string;
  items: { href: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[];
}[] = [
  { items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }] },
  {
    label: "Content",
    items: [
      { href: "/admin/guides", label: "Guides", icon: BookOpen },
      { href: "/admin/pages", label: "Pages", icon: BookMarked },
      { href: "/admin/brands", label: "Brands", icon: Tag },
      { href: "/admin/topics", label: "Topics", icon: LayoutGrid },
      { href: "/admin/devices", label: "Devices", icon: Smartphone },
      { href: "/admin/glossary", label: "Glossary", icon: BookMarked },
    ],
  },
  {
    label: "Community",
    items: [
      { href: "/admin/forum", label: "Forum", icon: MessageSquare },
      { href: "/admin/feedback", label: "Feedback", icon: MessageCircleHeart },
      { href: "/admin/users", label: "Users", icon: Users },
    ],
  },
  {
    label: "SEO & Settings",
    items: [
      { href: "/admin/media", label: "Media", icon: LayoutGrid },
      { href: "/admin/export", label: "Export", icon: ExternalLink },
      { href: "/admin/seo", label: "Titles & Meta", icon: Search },
      { href: "/admin/menus", label: "Menus", icon: Menu },
      { href: "/admin/author", label: "Author", icon: User },
      { href: "/admin/settings", label: "Site Settings", icon: Settings },
      { href: "/admin/copilot", label: "Copilot", icon: MessageCircleHeart },
    ],
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminDark, setAdminDark] = useState(false);

  useEffect(() => {
    try {
      setAdminDark(localStorage.getItem("admin-theme") === "dark");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleAdminTheme = () => {
    const next = !adminDark;
    setAdminDark(next);
    try {
      localStorage.setItem("admin-theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const flat = NAV_GROUPS.flatMap((g) => g.items);
  const current = flat.find((n) => isActive(n.href, n.exact))?.label ?? "Admin";

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {NAV_GROUPS.map((group, gi) => (
        <div key={gi} className={gi > 0 ? "mt-4" : ""}>
          {group.label && (
            <div
              className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--a-sidebar-muted)" }}
            >
              {group.label}
            </div>
          )}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exact);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className="flex items-center gap-2.5 rounded-sm border-l-4 px-3 py-2 text-[13px] font-medium transition"
                    style={{
                      borderColor: active ? "var(--a-sidebar-active-border)" : "transparent",
                      background: active ? "var(--a-sidebar-active)" : "transparent",
                      color: active ? "#fff" : "var(--a-sidebar-muted)",
                    }}
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-90" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );

  return (
    <div className={cn("admin-wp min-h-screen", adminDark && "admin-dark")}>
      <div className="flex min-h-screen">
        <aside
          className="a-sidebar hidden w-[160px] shrink-0 flex-col lg:flex xl:w-[180px]"
          style={{ background: "var(--a-sidebar)", color: "var(--a-sidebar-fg)" }}
        >
          <div
            className="flex h-12 items-center gap-2 border-b px-3"
            style={{ borderColor: "var(--a-sidebar-hover)" }}
          >
            <Shield className="h-4 w-4" style={{ color: "var(--a-sidebar-active-border)" }} />
            <span className="text-sm font-semibold tracking-tight">TapPath</span>
          </div>
          <nav className="flex-1 overflow-y-auto px-2 py-3">
            <NavLinks />
          </nav>
          <div className="border-t p-3 text-[12px]" style={{ borderColor: "var(--a-sidebar-hover)" }}>
            <div className="mb-2 truncate" style={{ color: "var(--a-sidebar-muted)" }}>
              {user?.email}
            </div>
            <Link
              href="/"
              className="mb-1 flex items-center gap-2 rounded-sm px-2 py-1.5"
              style={{ color: "var(--a-sidebar-muted)" }}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View site
            </Link>
            <button
              type="button"
              onClick={() => signOut()}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5"
              style={{ color: "var(--a-sidebar-muted)" }}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header
            className="a-header sticky top-0 z-30 flex h-12 items-center gap-3 border-b px-3 shadow-sm sm:px-4"
            style={{
              background: "var(--a-header-bg)",
              borderColor: "var(--a-border)",
              color: "var(--a-fg)",
            }}
          >
            <button
              type="button"
              className="rounded border p-1.5 lg:hidden"
              style={{ borderColor: "var(--a-border)", color: "var(--a-muted)" }}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1 text-[13px]" style={{ color: "var(--a-muted)" }}>
              <Link href="/admin" style={{ color: "var(--a-link)" }}>
                Admin
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-semibold" style={{ color: "var(--a-fg)" }}>
                {current}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={toggleAdminTheme}
                className="rounded border p-1.5"
                style={{
                  borderColor: "var(--a-border)",
                  color: "var(--a-muted)",
                  background: "var(--a-card)",
                }}
                aria-label={adminDark ? "Switch to light mode" : "Switch to dark mode"}
                title={adminDark ? "Light mode" : "Dark mode"}
              >
                {adminDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <Link
                href="/"
                className="hidden rounded border px-2.5 py-1 text-[12px] font-medium sm:inline-flex"
                style={{
                  borderColor: "var(--a-border)",
                  color: "var(--a-link)",
                  background: "var(--a-card)",
                }}
              >
                View site
              </Link>
            </div>
          </header>

          {mobileOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
              <aside
                className="absolute left-0 top-0 flex h-full w-[220px] flex-col shadow-xl"
                style={{ background: "var(--a-sidebar)", color: "var(--a-sidebar-fg)" }}
              >
                <div
                  className="flex h-12 items-center justify-between border-b px-3"
                  style={{ borderColor: "var(--a-sidebar-hover)" }}
                >
                  <span className="text-sm font-semibold">TapPath</span>
                  <button type="button" onClick={() => setMobileOpen(false)} className="p-1">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <nav className="flex-1 overflow-y-auto px-2 py-3">
                  <NavLinks onNavigate={() => setMobileOpen(false)} />
                </nav>
              </aside>
            </div>
          )}

          <main
            className="flex-1 p-4 sm:p-5 lg:p-6"
            style={{ background: "var(--a-bg)", color: "var(--a-fg)" }}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
