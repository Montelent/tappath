export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { listTopicsForIndex } from "@/lib/topics/resolve";
import CollectionJsonLd from "@/components/seo/CollectionJsonLd";

export const metadata: Metadata = {
  title: "Topics — Settings guides by category",
  description:
    "Cross-brand guides grouped by topic: battery, display, network, security and more.",
};

export default async function TopicsIndexPage() {
  const topics = await listTopicsForIndex();
  const withGuides = topics.filter((t) => t.guideCount > 0);
  const empty = topics.filter((t) => t.guideCount === 0);

  const items = topics.map((tp) => ({
    name: tp.name,
    url: `/topics/${tp.slug}`,
    description: tp.description || undefined,
  }));

  return (
    <div className="page-pad">
      <CollectionJsonLd
        name="Topics"
        description="Cross-brand guides grouped by topic: battery, display, network, security and more."
        path="/topics"
        items={items}
      />
      <nav
        className="max-wide mb-8 flex items-center gap-2 text-sm text-[var(--muted-foreground)]"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="link-quiet hover:text-[var(--foreground)]">
          Home
        </Link>
        <span aria-hidden>/</span>
        <span className="text-[var(--foreground)]">Topics</span>
      </nav>

      <header className="max-wide mb-10 max-w-2xl">
        <p className="label-caps mb-2">Index</p>
        <h1 className="font-display text-3xl sm:text-4xl">Topics</h1>
        <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed">
          Guides grouped by what you are trying to change — battery, display,
          network, security and the rest.
        </p>
      </header>

      <section className="max-wide pb-16">
        {withGuides.length > 0 ? (
          <ul className="border-t border-[var(--border)]">
            {withGuides.map((t) => (
              <li key={t.slug} className="border-b border-[var(--border)]">
                <Link
                  href={`/topics/${t.slug}`}
                  className="group flex items-baseline justify-between gap-4 py-3.5 link-quiet"
                >
                  <span className="min-w-0">
                    <span className="font-display text-lg group-hover:text-[var(--accent)] transition-colors duration-fast">
                      {t.name}
                    </span>
                    {t.description && (
                      <span className="mt-1 block text-sm text-[var(--muted-foreground)] line-clamp-2">
                        {t.description}
                      </span>
                    )}
                  </span>
                  <span className="font-path text-sm text-[var(--muted-foreground)] tabular-nums shrink-0">
                    {t.guideCount} {t.guideCount === 1 ? "guide" : "guides"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">
            No topics with published guides yet.
          </p>
        )}

        {empty.length > 0 && (
          <p className="mt-8 text-sm text-[var(--muted-foreground)]">
            Coming soon: {empty.map((t) => t.name).join(", ")}.
          </p>
        )}
      </section>
    </div>
  );
}
