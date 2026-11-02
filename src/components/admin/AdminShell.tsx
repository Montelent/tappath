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
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import "@/app/admin-wp.css";

const NAV_GROUPS: { label?: string; items: { href: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] }[] = [
  {
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/guides", label: "Guides", icon: BookOpen },
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
            <div className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#8c8f94]">
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
                    className={cn(
                      "flex items-center gap-2.5 rounded-sm px-3 py-2 text-[13px] font-medium transition",
                      active
                        ? "bg-[#2271b1] text-white"
                        : "text-[#c3c4c7] hover:bg-[#2c3338] hover:text-white"
                    )}
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
    <div className="admin-wp min-h-screen bg-[#f0f0f1] text-[#1d2327]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[160px] shrink-0 flex-col bg-[#1d2327] text-[#f0f0f1] lg:flex xl:w-[180px]">
          <div className="flex h-12 items-center gap-2 border-b border-[#2c3338] px-3">
            <Shield className="h-4 w-4 text-[#72aee6]" />
            <span className="text-sm font-semibold tracking-tight">TapPath</span>
          </div>
          <nav className="flex-1 overflow-y-auto px-2 py-3">
            <NavLinks />
          </nav>
          <div className="border-t border-[#2c3338] p-3 text-[12px]">
            <div className="mb-2 truncate text-[#8c8f94]">{user?.email}</div>
            <Link
              href="/"
              className="mb-1 flex items-center gap-2 rounded-sm px-2 py-1.5 text-[#c3c4c7] hover:bg-[#2c3338] hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View site
            </Link>
            <button
              type="button"
              onClick={() => signOut()}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-[#c3c4c7] hover:bg-[#2c3338] hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-[#c3c4c7] bg-white px-3 shadow-sm sm:px-4">
            <button
              type="button"
              className="rounded border border-[#c3c4c7] p-1.5 text-[#50575e] lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1 text-[13px] text-[#646970]">
              <Link href="/admin" className="hover:text-[#2271b1]">
                Admin
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-semibold text-[#1d2327]">{current}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Link
                href="/"
                className="hidden rounded border border-[#c3c4c7] bg-white px-2.5 py-1 text-[12px] font-medium text-[#2271b1] hover:border-[#2271b1] sm:inline-flex"
              >
                View site
              </Link>
            </div>
          </header>

          {mobileOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
              <aside className="absolute left-0 top-0 flex h-full w-[220px] flex-col bg-[#1d2327] text-[#f0f0f1] shadow-xl">
                <div className="flex h-12 items-center justify-between border-b border-[#2c3338] px-3">
                  <span className="text-sm font-semibold">TapPath</span>
                  <button type="button" onClick={() => setMobileOpen(false)} className="p-1 text-[#c3c4c7]">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <nav className="flex-1 overflow-y-auto px-2 py-3">
                  <NavLinks onNavigate={() => setMobileOpen(false)} />
                </nav>
              </aside>
            </div>
          )}

          <main className="flex-1 p-4 sm:p-5 lg:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
