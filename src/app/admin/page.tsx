import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  Smartphone,
  BookMarked,
  LayoutGrid,
  ExternalLink,
  FilePlus2,
  Shield,
} from "lucide-react";
import { getContentStats, listAllContent, seedNotes } from "@/data/seed";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  const stats = getContentStats();
  const items = listAllContent();

  const cards = [
    {
      label: "Guides",
      value: stats.guides,
      href: "/admin/guides",
      icon: BookOpen,
    },
    {
      label: "Devices",
      value: stats.devices,
      href: "/admin/devices",
      icon: Smartphone,
    },
    {
      label: "Glossary",
      value: stats.glossaryTerms,
      href: "/admin/glossary",
      icon: BookMarked,
    },
    {
      label: "Topics",
      value: stats.topics,
      href: "/topics",
      icon: LayoutGrid,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <Shield className="h-3.5 w-3.5" />
            Admin · not indexed
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Content dashboard</h1>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Seed overview and quick links. Content lives in{" "}
            <code className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-sm">src/data/</code>.
            Last seeded: {stats.lastSeeded}
          </p>
        </div>
        <Link
          href="/"
          className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium transition hover:bg-[var(--muted)]"
        >
          ← Back to site
        </Link>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              href={c.href}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:border-brand-300 dark:hover:border-brand-700"
            >
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                <span className="text-2xl font-bold">{c.value}</span>
              </div>
              <div className="mt-2 text-sm font-medium text-[var(--muted-foreground)]">
                {c.label}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold tracking-tight">All content</h2>
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--border)] bg-[var(--muted)]/40 text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Meta</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {items.map((item) => (
                  <tr key={`${item.type}-${item.id}`} className="hover:bg-[var(--muted)]/30">
                    <td className="px-4 py-2.5">
                      <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-medium capitalize">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-medium">{item.title}</td>
                    <td className="px-4 py-2.5 text-[var(--muted-foreground)]">
                      {item.meta ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Link
                        href={item.href}
                        className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400"
                        target="_blank"
                      >
                        View
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="flex items-center gap-2 font-bold tracking-tight">
              <FilePlus2 className="h-4 w-4" />
              How to seed
            </h2>
            <ul className="mt-4 space-y-4 text-sm text-[var(--muted-foreground)]">
              <li>
                <strong className="text-[var(--foreground)]">Guide</strong>
                <p className="mt-1">{seedNotes.howToAddGuide}</p>
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Device</strong>
                <p className="mt-1">{seedNotes.howToAddDevice}</p>
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Glossary term</strong>
                <p className="mt-1">{seedNotes.howToAddTerm}</p>
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Topic</strong>
                <p className="mt-1">{seedNotes.howToAddTopic}</p>
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-dashed border-[var(--border)] p-5 text-sm text-[var(--muted-foreground)]">
            <p className="font-medium text-[var(--foreground)]">CMS hooks (future)</p>
            <p className="mt-2">
              Wire this dashboard to Sanity, Payload, or a simple Markdown folder. Data modules under{" "}
              <code className="text-xs">src/data/</code> are the current CMS.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
