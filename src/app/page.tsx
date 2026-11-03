import Link from "next/link";
import type { Metadata } from "next";
import {
  listBrands,
  listGuides,
  listTopics,
  isDatabaseConfigured,
} from "@/lib/db/content";
import { guideHref } from "@/lib/guides/resolve";
import { getSiteSettings } from "@/lib/site-settings";
import { applySeoTemplate } from "@/lib/seo/templates";
import { brandColorCss, brandColorTint } from "@/lib/brand-color";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const vars = {
    sitename: s.site_name,
    sep: s.seo_title_separator || "·",
    title: s.site_name,
    excerpt: s.meta_description || s.homepage_hero_subtitle || "",
    description: s.meta_description || s.homepage_hero_subtitle || "",
  };
  const title =
    applySeoTemplate(s.seo_tpl_homepage_title, vars, s.meta_title || s.site_name) ||
    s.meta_title ||
    s.site_name;
  const description =
    applySeoTemplate(s.seo_tpl_homepage_description, vars, s.meta_description) ||
    s.meta_description;
  return {
    title: { absolute: title },
    description,
    keywords: s.meta_keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    robots: {
      index: s.seo_robots_index !== false,
      follow: s.seo_robots_follow !== false,
    },
    openGraph: {
      title,
      description,
      type: "website",
      images: s.og_image_url ? [{ url: s.og_image_url }] : undefined,
    },
  };
}

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

  const guideCount = guides.length;
  const brandCount = brandsWithGuides.length;
  const topicCount = topics.length;

  return (
    <div>
      <section className="hero-grid border-b border-[var(--border)]">
        <div className="page-pad max-wide section-y">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              {settings.homepage_eyebrow && (
                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden />
                  {settings.homepage_eyebrow}
                </span>
              )}
              <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-[3.25rem] max-w-xl">
                {settings.homepage_hero_title}
              </h1>
              <p className="mt-4 max-w-lg text-[var(--muted-foreground)] text-base sm:text-lg leading-relaxed">
                {settings.homepage_hero_subtitle}
              </p>
              <form action="/search" method="get" className="relative mt-8 max-w-lg">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" aria-hidden>
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
                  placeholder={settings.homepage_search_placeholder}
                  autoComplete="off"
                />
              </form>
              <div className="mt-6 flex flex-wrap gap-2">
                <a href="#home-brands" className="btn-accent">Choose a brand</a>
                <Link href="/topics" className="btn-ghost">Popular topics</Link>
                <Link href="/devices" className="btn-ghost">Find a product</Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="surface-elevated mx-auto max-w-sm overflow-hidden p-5">
                <div className="mb-3 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                  <span className="font-semibold text-[var(--foreground)]">Settings path</span>
                  <span className="rounded-full bg-[var(--accent-muted)] px-2 py-0.5 text-[10px] font-semibold text-[var(--accent)]">
                    Path verified
                  </span>
                </div>
                <ul className="space-y-2 text-sm">
                  {["Connections", "Mobile networks", "SIM manager", "Mobile data"].map((row, i) => (
                    <li
                      key={row}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${
                        i === 2
                          ? "border-[var(--accent)] bg-[var(--accent-subtle)] font-medium"
                          : "border-[var(--border)] bg-[var(--card)]"
                      }`}
                    >
                      {row}
                      <span className={`h-5 w-9 rounded-full ${i < 3 ? "bg-[var(--accent)]" : "bg-[var(--muted)]"}`} aria-hidden />
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-[var(--muted-foreground)]">Step-by-step menu paths — no guessing.</p>
              </div>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { n: guideCount > 0 ? `${guideCount}+` : "—", l: "Guides" },
              { n: topicCount > 0 ? String(topicCount) : "—", l: "Topics" },
              { n: brandCount > 0 ? String(brandCount) : "—", l: "Brands" },
              { n: "Live", l: "Paths" },
            ].map((stat) => (
              <div key={stat.l} className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 px-4 py-3 text-center shadow-sm backdrop-blur">
                <div className="text-2xl font-bold tabular-nums tracking-tight text-[var(--accent)]">{stat.n}</div>
                <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{stat.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="page-pad">
        <section className="max-wide section-y" aria-labelledby="home-brands">
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
                    <Link href={`/${b.slug}`} className="surface-card group flex h-full flex-col gap-3 p-4 sm:p-5 link-quiet" style={{ borderTopWidth: 3, borderTopColor: color }}>
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
              <Link href="/topics" className="text-sm text-[var(--muted-foreground)] link-quiet hover:text-[var(--foreground)]">
                {settings.homepage_all_topics_label}
              </Link>
            </div>
            <ul className="grid-cards">
              {topics.slice(0, 12).map((t) => (
                <li key={t.slug || t.id}>
                  <Link href={`/topics/${t.slug}`} className="surface-card block h-full px-4 py-3.5 text-sm font-medium link-quiet">
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
