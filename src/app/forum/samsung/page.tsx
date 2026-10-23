import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { getTopicsByBrand } from "@/data/forum";

export const metadata: Metadata = {
  title: "Samsung Forum",
  description: "Samsung Galaxy and One UI community discussions.",
};

export default function SamsungForumPage() {
  const topics = getTopicsByBrand("samsung");
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <Link href="/" className="hover:text-[var(--foreground)]">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/forum" className="hover:text-[var(--foreground)]">Forum</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-[var(--foreground)]">Samsung</span>
      </nav>
      <h1 className="text-3xl font-bold tracking-tight">Samsung board</h1>
      <p className="mt-2 text-[var(--muted-foreground)]">Galaxy, One UI, Knox — community threads.</p>
      <ul className="mt-8 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        {topics.map((t) => (
          <li key={t.id} className="px-4 py-4">
            <div className="flex flex-wrap items-center gap-2">
              {t.solved && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> Solved
                </span>
              )}
              <span className="text-xs text-[var(--muted-foreground)]">{t.category}</span>
            </div>
            <h2 className="mt-1 font-semibold">{t.title}</h2>
            <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">{t.excerpt}</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {t.author} · {t.replies} replies · {t.lastActivity}
            </p>
          </li>
        ))}
      </ul>
      <Link href="/forum" className="mt-6 inline-block text-sm font-medium text-brand-600 dark:text-brand-400">
        ← All forums
      </Link>
    </div>
  );
}
