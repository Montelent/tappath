import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  Smartphone,
  BookMarked,
  LayoutGrid,
  MessageSquare,
  Tag,
  Database,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { getAdminStats } from "@/lib/db/content";
import { isNeonConfigured } from "@/lib/db/neon";

export const metadata: Metadata = {
  title: "Admin · Dashboard",
  robots: { index: false, follow: false },
};

const cards = [
  { href: "/admin/guides", label: "Guides", icon: BookOpen, key: "guides" as const, desc: "Step-by-step how-tos" },
  { href: "/admin/brands", label: "Brands", icon: Tag, key: "brands" as const, desc: "Samsung, Xiaomi, …" },
  { href: "/admin/topics", label: "Topics", icon: LayoutGrid, key: "topics" as const, desc: "Category hubs" },
  { href: "/admin/devices", label: "Devices", icon: Smartphone, key: "devices" as const, desc: "Phone directory" },
  { href: "/admin/glossary", label: "Glossary", icon: BookMarked, key: "glossary" as const, desc: "Tech terms" },
  { href: "/admin/forum", label: "Forum", icon: MessageSquare, key: "forumTopics" as const, desc: "Community threads" },
];

export default async function AdminPage() {
  const stats = await getAdminStats();
  const live = isNeonConfigured() || stats.usingSupabase;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Control what appears on the public site. Edits publish when rows are marked published.
        </p>
      </div>

      <div
        className={
          live
            ? "flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40"
            : "flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40"
        }
      >
        {live ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        ) : (
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        )}
        <div className="text-sm">
          <p className="font-semibold text-[var(--foreground)]">
            {live ? "Neon database connected" : "Running on mock files"}
          </p>
          <p className="mt-1 text-[var(--muted-foreground)]">
            {live
              ? "Creates, edits, and deletes persist. Use Seed on any content page to import starter data."
              : "Set DATABASE_URL on Vercel to your Neon pooled connection string, redeploy, then Seed."}
          </p>
        </div>
        <Database className="ml-auto h-5 w-5 shrink-0 opacity-40" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          const value = stats[c.key];
          return (
            <Link
              key={c.href}
              href={c.href}
              className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:border-brand-300 hover:shadow-sm dark:hover:border-brand-700"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-brand-50 p-2 dark:bg-brand-950">
                  <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                </div>
                <span className="text-2xl font-bold tabular-nums">{value}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{c.label}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">{c.desc}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] opacity-0 transition group-hover:opacity-100" />
              </div>
            </Link>
          );
        })}
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="font-bold">Quick actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href="/admin/guides"
            className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm hover:bg-[var(--muted)]"
          >
            <span className="font-medium">Edit guides</span>
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
              Titles, steps, FAQs, publish state
            </p>
          </Link>
          <Link
            href="/admin/brands"
            className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm hover:bg-[var(--muted)]"
          >
            <span className="font-medium">Manage brands</span>
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
              Homepage brand grid & SEO blurbs
            </p>
          </Link>
          <Link
            href="/admin/forum"
            className="rounded-xl border border-[var(--border)] px-4 py-3 text-sm hover:bg-[var(--muted)]"
          >
            <span className="font-medium">Moderate forum</span>
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
              Threads, solved status, delete spam
            </p>
          </Link>
          <div className="rounded-xl border border-dashed border-[var(--border)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
            <span className="font-medium text-[var(--foreground)]">Coming next</span>
            <p className="mt-0.5 text-xs">Users, feedback inbox, site settings</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-[var(--muted-foreground)]">
          Feedback votes stored: {stats.feedback}. Demo admin: admin@tappath.com / admin1234
        </p>
      </section>
    </div>
  );
}
