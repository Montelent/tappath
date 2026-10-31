import Link from "next/link";
import {
  listBrands,
  listGuides,
  listTopics,
  isDatabaseConfigured,
} from "@/lib/db/content";
import { guideHref } from "@/lib/guides/resolve";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [brands, guides, topics] = await Promise.all([
    listBrands(),
    listGuides(),
    listTopics(),
  ]);

  const live = isDatabaseConfigured();
  const brandsWithGuides = brands
    .map((b) => ({
      name: b.name,
      slug: b.slug,
      count:
        typeof b.guides_count === "number" && b.guides_count > 0
          ? b.guides_count
          : guides.filter((g) => g.brand_slug === b.slug).length,
    }))
    .filter((b) => b.count > 0);

  const brandsComingSoon = brands
    .map((b) => ({
      name: b.name,
      slug: b.slug,
      count:
        typeof b.guides_count === "number"
          ? b.guides_count
          : guides.filter((g) => g.brand_slug === b.slug).length,
    }))
    .filter((b) => b.count === 0);

  const featured = guides.slice(0, 12).map((g, i) => ({
    n: i + 1,
    brand: g.brand,
    title: g.title,
    category: g.category || "",
    href: guideHref(g),
  }));

  return (
    <div className="page-pad">
      <section className="max-wide border-b border-[var(--border)] py-12 sm:py-16 md:py-20">
        <p className="label-caps mb-3">Phone settings</p>
        <h1 className="font-display text-3xl sm:text-4xl md:text-[2.75rem] max-w-2xl text-balance">
          Find the exact path in Settings.
        </h1>
        <p className="mt-4 max-w-xl text-[var(--muted-foreground)] text-base sm:text-lg leading-relaxed">
          Step-by-step menu routes for Samsung, Xiaomi, Huawei, OnePlus, Oppo,
          Realme, Android and Google — with screenshots when you need them.
        </p>

        <form action="/search" method="get" className="relative mt-8 max-w-lg">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3-3" />
            </svg>
          </span>
          <label htmlFor="home-search" className="sr-only">Search guides</label>
          <input
            id="home-search"
            name="q"
            type="search"
            className="search-field"
            placeholder="Try “fingerprint”, “battery %”, “private DNS”…"
            autoComplete="off"
          />
        </form>
      </section>

      {featured.length > 0 && (
        <section className="max-wide py-12 sm:py-16">
          <div className="flex items-baseline justify-between gap-4 mb-6">
            <h2 className="font-display text-xl sm:text-2xl">Latest guides</h2>
            {live && (
              <span className="label-caps">{guides.length} published</span>
            )}
          </div>
          <ol className="border-t border-[var(--border)]">
            {featured.map((g) => (
              <li key={g.href} className="border-b border-[var(--border)]">
                <Link
                  href={g.href}
                  className="group flex gap-4 sm:gap-6 py-4 link-quiet items-start"
                >
                  <span className="font-path text-sm text-[var(--muted-foreground)] w-6 shrink-0 pt-0.5 tabular-nums">
                    {String(g.n).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium group-hover:text-[var(--accent)] transition-colors duration-fast">
                      {g.title}
                    </span>
                    <span className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 label-caps">
                      <span>{g.brand}</span>
                      {g.category && (
                        <>
                          <span aria-hidden>·</span>
                          <span>{g.category}</span>
                        </>
                      )}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="max-wide border-t border-[var(--border)] py-12 sm:py-16">
        <h2 className="font-display text-xl sm:text-2xl mb-6">Brands</h2>
        {brandsWithGuides.length > 0 ? (
          <ul className="border-t border-[var(--border)]">
            {brandsWithGuides.map((b) => (
              <li key={b.slug} className="border-b border-[var(--border)]">
                <Link
                  href={`/${b.slug}`}
                  className="group flex items-baseline justify-between gap-4 py-3.5 link-quiet"
                >
                  <span className="font-display text-lg group-hover:text-[var(--accent)] transition-colors duration-fast">
                    {b.name}
                  </span>
                  <span className="font-path text-sm text-[var(--muted-foreground)] tabular-nums shrink-0">
                    {b.count} {b.count === 1 ? "guide" : "guides"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[var(--muted-foreground)] text-sm">
            No brand guides published yet.
          </p>
        )}
        {brandsComingSoon.length > 0 && (
          <p className="mt-6 text-sm text-[var(--muted-foreground)]">
            Coming soon: {brandsComingSoon.map((b) => b.name).join(", ")}.
          </p>
        )}
      </section>

      {topics.length > 0 && (
        <section className="max-wide border-t border-[var(--border)] py-12 sm:py-16">
          <h2 className="font-display text-xl sm:text-2xl mb-6">Topics</h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {topics.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/topics/${t.slug}`}
                  className="text-sm link-quiet border-b border-transparent hover:border-[var(--accent)]"
                >
                  {t.name}
                  {Number(t.guide_count) > 0 && (
                    <span className="ml-1.5 font-path text-xs text-[var(--muted-foreground)]">
                      {t.guide_count}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
