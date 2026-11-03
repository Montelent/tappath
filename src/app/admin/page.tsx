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
  const live = isNeonConfigured();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-[23px] font-normal leading-tight text-[#1d2327]">Dashboard</h1>
        <p className="mt-1 text-[13px] text-[#646970]">
          Control what appears on the public site. Edits publish when rows are marked published.
        </p>
      </div>

      <div
        className={
          live
            ? "flex items-start gap-3 rounded border border-[#00a32a]/40 bg-[#edfaef] p-4"
            : "flex items-start gap-3 rounded border border-[#dba617]/50 bg-[#fcf9e8] p-4"
        }
      >
        {live ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        ) : (
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        )}
        <div className="text-sm">
          <p className="font-semibold text-[#1d2327]">
            {live ? "Neon database connected" : "Database not connected"}
          </p>
          <p className="mt-1 text-[#646970]">
            {live
              ? "Creates, edits, and deletes are saved to your database."
              : "Set DATABASE_URL (Neon) in your host environment, then redeploy."}
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
              className="group rounded border border-[#c3c4c7] bg-white p-5 transition hover:border-[#2271b1] hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="rounded bg-[#f0f6fc] p-2">
                  <Icon className="h-5 w-5 text-[#2271b1]" />
                </div>
                <span className="text-2xl font-bold tabular-nums text-[#1d2327]">{value}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#1d2327]">{c.label}</div>
                  <div className="text-xs text-[#646970]">{c.desc}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#646970] opacity-0 transition group-hover:opacity-100" />
              </div>
            </Link>
          );
        })}
      </div>

      <section className="rounded border border-[#c3c4c7] bg-white p-6">
        <h2 className="font-semibold text-[#1d2327]">Quick actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href="/admin/guides"
            className="rounded border border-[#c3c4c7] px-4 py-3 text-sm hover:bg-[#f6f7f7]"
          >
            <span className="font-medium text-[#1d2327]">Edit guides</span>
            <p className="mt-0.5 text-xs text-[#646970]">Titles, steps, FAQs, publish state</p>
          </Link>
          <Link
            href="/admin/brands"
            className="rounded border border-[#c3c4c7] px-4 py-3 text-sm hover:bg-[#f6f7f7]"
          >
            <span className="font-medium text-[#1d2327]">Manage brands</span>
            <p className="mt-0.5 text-xs text-[#646970]">Homepage brand grid and SEO blurbs</p>
          </Link>
          <Link
            href="/admin/forum"
            className="rounded border border-[#c3c4c7] px-4 py-3 text-sm hover:bg-[#f6f7f7]"
          >
            <span className="font-medium text-[#1d2327]">Moderate forum</span>
            <p className="mt-0.5 text-xs text-[#646970]">Threads, solved status, delete spam</p>
          </Link>
          <Link
            href="/admin/settings"
            className="rounded border border-[#c3c4c7] px-4 py-3 text-sm hover:bg-[#f6f7f7]"
          >
            <span className="font-medium text-[#1d2327]">Site settings</span>
            <p className="mt-0.5 text-xs text-[#646970]">Logo, homepage text, verification codes</p>
          </Link>
        </div>
        <p className="mt-4 text-xs text-[#646970]">Feedback votes stored: {stats.feedback}.</p>
      </section>
    </div>
  );
}
