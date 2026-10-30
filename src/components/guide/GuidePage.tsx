import Link from "next/link";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import type { Guide } from "@/data/guides";
import LiveSimulator from "./LiveSimulator";
import GuideFeedback from "./GuideFeedback";

export default function GuidePage({ guide }: { guide: Guide }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <Link href="/" className="hover:text-[var(--foreground)]">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/${guide.brandSlug}`} className="hover:text-[var(--foreground)]">
          {guide.brand}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="line-clamp-1 text-[var(--foreground)]">{guide.title}</span>
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
        <LiveSimulator
          versions={guide.versions}
          brandName={guide.brand}
          deviceModel="Galaxy S23+"
        />
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
            <div className="mt-4 space-y-4 leading-relaxed text-[var(--muted-foreground)]">
              {guide.article.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-bold tracking-tight">Frequently asked questions</h2>
            <div className="space-y-4">
              {guide.faqs.map((f, i) => (
                <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
                  <h3 className="font-semibold">{f.q}</h3>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          {guide.compatibleDevices?.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Compatible devices
              </h2>
              <ul className="mt-3 space-y-2">
                {guide.compatibleDevices.map((d) => (
                  <li key={d.href}>
                    <Link href={d.href} className="text-sm text-brand-600 hover:underline dark:text-brand-400">
                      {d.name}
                    </Link>
                    <span className="text-xs text-[var(--muted-foreground)]"> · {d.os}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {guide.related?.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Related guides
              </h2>
              <ul className="mt-3 space-y-2">
                {guide.related.map((r) => (
                  <li key={r.href}>
                    <Link href={r.href} className="text-sm font-medium hover:text-brand-600">
                      {r.title}
                    </Link>
                    <div className="text-xs text-[var(--muted-foreground)]">{r.category}</div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
