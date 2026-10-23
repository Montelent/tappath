"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Topic } from "@/data/topics";
import { cn } from "@/lib/utils";

type Props = {
  topic: Topic;
};

export default function TopicHub({ topic }: Props) {
  const brands = topic.guidesByBrand.map((g) => g.brand);
  const [filter, setFilter] = useState<string>("all");

  const visible =
    filter === "all"
      ? topic.guidesByBrand
      : topic.guidesByBrand.filter((g) => g.brand === filter);

  const totalGuides = topic.guidesByBrand.reduce((n, b) => n + b.guides.length, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <Link href="/" className="hover:text-[var(--foreground)]">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/topics" className="hover:text-[var(--foreground)]">
          Topics
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-[var(--foreground)]">{topic.name}</span>
      </nav>

      <header className="mb-10 max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{topic.name}</h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">{topic.description}</p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {topic.guideCount} guides across brands · {totalGuides} listed here
        </p>
      </header>

      {brands.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition",
              filter === "all"
                ? "bg-brand-600 text-white"
                : "border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)]"
            )}
          >
            All brands
          </button>
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => setFilter(b)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition",
                filter === b
                  ? "bg-brand-600 text-white"
                  : "border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)]"
              )}
            >
              {b}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-12 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          {visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center text-[var(--muted-foreground)]">
              No guides listed for this filter yet. More coming soon.
            </div>
          ) : (
            visible.map((group) => (
              <section key={group.brand}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-bold tracking-tight">
                    <Link
                      href={`/${group.brandSlug}`}
                      className="hover:text-brand-600 dark:hover:text-brand-400"
                    >
                      {group.brand}
                    </Link>
                  </h2>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {group.guides.length} guides
                  </span>
                </div>
                <ul className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--card)]">
                  {group.guides.map((g) => (
                    <li key={g.href}>
                      <Link
                        href={g.href}
                        className="flex items-center justify-between gap-4 px-4 py-3.5 transition hover:bg-[var(--muted)]/50"
                      >
                        <div className="min-w-0">
                          <div className="font-medium truncate">{g.title}</div>
                          {(g.steps || g.readTime) && (
                            <div className="text-xs text-[var(--muted-foreground)]">
                              {[g.readTime, g.steps ? `${g.steps} steps` : null]
                                .filter(Boolean)
                                .join(" · ")}
                            </div>
                          )}
                        </div>
                        <span className="shrink-0 text-sm font-medium text-brand-600 dark:text-brand-400">
                          Open →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>

        <aside className="space-y-8">
          {topic.faqs.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold tracking-tight">FAQ</h2>
              <div className="space-y-3">
                {topic.faqs.map((f, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
                  >
                    <h3 className="text-sm font-semibold">{f.q}</h3>
                    <p className="mt-1.5 text-sm text-[var(--muted-foreground)] leading-relaxed">
                      {f.a}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            <h3 className="text-sm font-semibold">Other topics</h3>
            <ul className="mt-3 space-y-1.5 text-sm">
              {[
                { name: "Network & Connectivity", href: "/topics/network" },
                { name: "Display & Home Screen", href: "/topics/display" },
                { name: "Battery & Power", href: "/topics/battery" },
                { name: "Security & Privacy", href: "/topics/security" },
                { name: "System & Settings", href: "/topics/system" },
                { name: "All topics", href: "/topics" },
              ]
                .filter((t) => !t.href.endsWith(`/${topic.slug}`))
                .map((t) => (
                  <li key={t.href}>
                    <Link
                      href={t.href}
                      className="text-[var(--muted-foreground)] transition hover:text-brand-600 dark:hover:text-brand-400"
                    >
                      {t.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
