import Link from "next/link";
import { ChevronRight, Clock, Calendar } from "lucide-react";
import type { Guide } from "@/data/guides";
import LiveSimulator from "./LiveSimulator";
import GuideFeedback from "./GuideFeedback";
import GuideFAQ from "./GuideFAQ";

type Props = {
  guide: Guide;
};

export default function GuidePage({ guide }: Props) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <Link href="/" className="hover:text-[var(--foreground)]">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/${guide.brandSlug}`} className="hover:text-[var(--foreground)]">
          {guide.brand}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-[var(--foreground)] line-clamp-1">{guide.title}</span>
      </nav>

      <header className="mb-8 max-w-3xl">
        <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
          {guide.brand} · {guide.category}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {guide.brand}: {guide.title}
        </h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">{guide.shortDescription}</p>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[var(--muted-foreground)]">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            Updated: {guide.updated}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {guide.readTime} · {guide.versions[0]?.steps.length ?? 0} steps
          </span>
        </div>
      </header>

      <section className="mb-10">
        <LiveSimulator versions={guide.versions} brandName={guide.brand} />
      </section>

      <section className="mb-10 max-w-xl">
        <GuideFeedback
          guideSlug={guide.slug}
          initialConfirmations={guide.confirmations}
          forumVerified={guide.forumVerified}
        />
      </section>

      <div className="grid gap-12 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <section>
            <h2 className="text-xl font-bold tracking-tight">
              {guide.title} on {guide.brand}
            </h2>
            <div className="mt-4 space-y-4 text-[var(--muted-foreground)] leading-relaxed">
              {guide.article.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-bold tracking-tight">Frequently asked questions</h2>
            <GuideFAQ faqs={guide.faqs} />
          </section>

          <section>
            <h2 className="mb-4 text-xl font-bold tracking-tight">
              More guides for {guide.brand}
            </h2>
            <ul className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              {guide.related.map((r) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    className="flex items-center justify-between gap-4 px-4 py-3.5 transition hover:bg-[var(--muted)]/50"
                  >
                    <div>
                      <div className="font-medium">{r.title}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">{r.category}</div>
                    </div>
                    <span className="text-sm font-medium text-brand-600 dark:text-brand-400">
                      Open →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          {guide.compatibleDevices.length > 0 && (
            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Compatible devices
              </h3>
              <ul className="space-y-2">
                {guide.compatibleDevices.map((d) => (
                  <li key={d.href}>
                    <Link
                      href={d.href}
                      className="block rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 transition hover:border-brand-300 dark:hover:border-brand-700"
                    >
                      <div className="text-sm font-medium">{d.name}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">{d.os}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            <h3 className="text-sm font-semibold">Explore topics</h3>
            <ul className="mt-3 space-y-1.5 text-sm">
              {[
                { name: "Display & Home Screen", href: "/topics/display" },
                { name: "Network & Connectivity", href: "/topics/network" },
                { name: "Battery & Power", href: "/topics/battery" },
                { name: "Security & Privacy", href: "/topics/security" },
                { name: "All topics", href: "/topics" },
              ].map((t) => (
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
