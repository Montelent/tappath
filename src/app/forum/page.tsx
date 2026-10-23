import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, MessageSquare, CheckCircle2 } from "lucide-react";
import { forumCategories, forumTopics } from "@/data/forum";

export const metadata: Metadata = {
  title: "Community Forum",
  description: "Discuss smartphone settings, report paths, and help others — by brand.",
};

export default function ForumPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <Link href="/" className="hover:text-[var(--foreground)]">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-[var(--foreground)]">Forum</span>
      </nav>
      <header className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Community Forum</h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          Ask questions, confirm guide paths, and share fixes. Organized by brand.
        </p>
      </header>
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {forumCategories.map((c) => (
          <Link
            key={c.slug}
            href={c.slug === "general" || c.slug === "guides" ? "/forum" : `/forum/${c.slug}`}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:border-brand-300 dark:hover:border-brand-700"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h2 className="mt-3 font-semibold">{c.name}</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{c.description}</p>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">{c.topicCount} topics</p>
          </Link>
        ))}
      </div>
      <h2 className="mb-4 text-xl font-bold tracking-tight">Recent topics</h2>
      <ul className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        {forumTopics.map((t) => (
          <li key={t.id}>
            <div className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {t.solved && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" /> Solved
                    </span>
                  )}
                  <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                    {t.brand} · {t.category}
                  </span>
                </div>
                <h3 className="mt-1 font-semibold">{t.title}</h3>
                <p className="mt-0.5 text-sm text-[var(--muted-foreground)] line-clamp-1">{t.excerpt}</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  by {t.author} · {t.replies} replies · {t.views} views · {t.lastActivity}
                </p>
              </div>
              <Link href={`/forum/${t.brandSlug}`} className="shrink-0 text-sm font-medium text-brand-600 dark:text-brand-400">
                View board →
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
