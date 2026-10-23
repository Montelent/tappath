import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, MessageSquare } from "lucide-react";
import ForumBoard from "@/components/forum/ForumBoard";
import { forumCategories } from "@/data/forum";

export const metadata: Metadata = {
  title: "Community Forum",
  description: "Discuss smartphone settings, report paths, and help others — by brand.",
};

export default function ForumPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <Link href="/" className="hover:text-[var(--foreground)]">
          Home
        </Link>
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
            href={
              c.slug === "general" || c.slug === "guides" ? "/forum" : `/forum/${c.slug}`
            }
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:border-brand-300 dark:hover:border-brand-700"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h2 className="mt-3 font-semibold">{c.name}</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{c.description}</p>
          </Link>
        ))}
      </div>

      <ForumBoard />
    </div>
  );
}
