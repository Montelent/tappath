import Link from "next/link";
import {
  listBrands,
  listGuides,
  listTopics,
  isDatabaseConfigured,
} from "@/lib/db/content";
import { guideHref } from "@/lib/guides/resolve";
import { getSiteSettings } from "@/lib/site-settings";
import { brandColorCss, brandColorTint } from "@/lib/brand-color";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [brands, guides, topics, settings] = await Promise.all([
    listBrands(),
    listGuides(),
    listTopics(),
    getSiteSettings(),
  ]);

  const live = isDatabaseConfigured();
  const brandsWithGuides = brands
    .map((b) => ({
      name: b.name,
      slug: b.slug,
      color: (b as { color?: string }).color || "",
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
      color: (b as { color?: string }).color || "",
      count:
        typeof b.guides_count === "number"
          ? b.guides_count
          : guides.filter((g) => g.brand_slug === b.slug).length,
    }))
    .filter((b) => b.count === 0);

  const featured = guides.slice(0, 12).map((g, i) => {
    const brandRow = brands.find((b) => b.slug === g.brand_slug);
    return {
      n: i + 1,
      brand: g.brand,
      brandSlug: g.brand_slug,
      color: (brandRow as { color?: string } | undefined)?.color || "",
      title: g.title,
      category: g.category || "",
      href: guideHref(g),
    };
  });

  return (
    <div className="page-pad">
      <section className="max-wide section-y relative">
        <div
          className="pointer-events-none absolute -top-8 right-0 h-48 w-48 rounded-full opacity-40 blur-3xl sm:h-64 sm:w-64"
          style={{ background: "var(--accent-muted)" }}
          aria-hidden
        />
        {settings.homepage_eyebrow && (
          <p className="label-caps mb-3 relative">{settings.homepage_eyebrow}</p>
        )}
        <h1 className="font-display text-3xl sm:text-4xl md:text-[2.85rem] max-w-2xl relative">
          {settings.homepage_hero_title}
        </h1>
        <p className="mt-4 max-w-xl text-[var(--muted-foreground)] text-base sm:text-lg leading-relaxed relative">
          {settings.homepage_hero_subtitle}
        </p>
        <form action="/search" method="get" className="relative mt-8 max-w-xl">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3-3" />
            </svg>
          </span>
          <label htmlFor="home-search" className="sr-only">Search guides</label>
          <input id="home-search" name="q" type="search" className="search-field" placeholder={settings.homepage_search_placeholder} autoComplete="off" />
        </form>
      </section>

      <section className="max-wide border-t border-[var(--border)] section-y" aria-labelledby="home-brands">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 id="home-brands" className="font-display text-xl sm:text-2xl">{settings.homepage_brands_heading}</h2>
        </div>
        {brandsWithGuides.length > 0 ? (
          <ul className="grid-cards grid-cards-4">
            {brandsWithGuides.map((b) => {
              const color = brandColorCss(b.color);
              const tint = brandColorTint(b.color, 0.1);
              return (
                <li key={b.slug}>
                  <Link
                    href={`/${b.slug}`}
                    className="surface-card group flex h-full flex-col gap-3 p-4 sm:p-5 link-quiet"
                    style={{ borderTopWidth: 3, borderTopColor: color }}
                  >
                    <span className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm" style={{ backgroundColor: color }} aria-hidden>
                        {b.name.slice(0, 1)}
                      </span>
                      <span className="min-w-0 flex-1 font-medium group-hover:text-[var(--accent)] transition-colors">{b.name}</span>
                    </span>
                    <span className="mt-auto inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums" style={{ backgroundColor: tint, color }}>
                      {b.count} {b.count === 1 ? "guide" : "guides"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">{settings.homepage_no_brands_text}</p>
        )}
        {brandsComingSoon.length > 0 && (
          <div className="mt-8">
            <p className="label-caps mb-3">{settings.homepage_coming_soon_label}</p>
            <ul className="flex flex-wrap gap-2">
              {brandsComingSoon.map((b) => (
                <li key={b.slug} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1 text-sm text-[var(--muted-foreground)]">
                  <span className="brand-swatch" style={{ backgroundColor: brandColorCss(b.color) }} aria-hidden />
                  {b.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {featured.length > 0 && (
        <section className="max-wide border-t border-[var(--border)] section-y" aria-labelledby="home-guides">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <h2 id="home-guides" className="font-display text-xl sm:text-2xl">{settings.homepage_guides_heading}</h2>
            {live && <span className="label-caps">{guides.length} published</span>}
          </div>
          <ol className="grid-guides list-none">
            {featured.map((g) => {
              const color = brandColorCss(g.color);
              return (
                <li key={g.href}>
                  <Link href={g.href} className="surface-card group flex h-full gap-3 p-4 link-quiet sm:gap-4">
                    <span className="font-path text-sm tabular-nums shrink-0 pt-0.5 w-7 text-center rounded-md" style={{ color, backgroundColor: brandColorTint(g.color, 0.12) }}>
                      {String(g.n).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium leading-snug group-hover:text-[var(--accent)] transition-colors">{g.title}</span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--muted-foreground)]">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="brand-swatch" style={{ backgroundColor: color }} aria-hidden />
                          {g.brand}
                        </span>
                        {g.category && (<><span aria-hidden>·</span><span>{g.category}</span></>)}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {topics.length > 0 && (
        <section className="max-wide border-t border-[var(--border)] section-y" aria-labelledby="home-topics">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <h2 id="home-topics" className="font-display text-xl sm:text-2xl">{settings.homepage_topics_heading}</h2>
            <Link href="/topics" className="text-sm text-[var(--muted-foreground)] link-quiet hover:text-[var(--foreground)]">{settings.homepage_all_topics_label}</Link>
          </div>
          <ul className="grid-cards">
            {topics.slice(0, 12).map((t) => (
              <li key={t.slug || t.id}>
                <Link href={`/topics/${t.slug}`} className="surface-card block h-full px-4 py-3.5 text-sm font-medium link-quiet">{t.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
