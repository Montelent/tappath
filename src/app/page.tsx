import Link from "next/link";
import { BookOpen, Layers, Smartphone, Users, ArrowRight, Search } from "lucide-react";
import {
  listBrands,
  listGuides,
  listTopics,
  listDevices,
  isDatabaseConfigured,
} from "@/lib/db/content";
import { guideHref } from "@/lib/guides/resolve";

export const dynamic = "force-dynamic";

const FALLBACK_BRAND_COLORS: Record<string, string> = {
  samsung: "bg-blue-500",
  xiaomi: "bg-orange-500",
  huawei: "bg-red-500",
  oneplus: "bg-red-600",
  oppo: "bg-green-500",
  realme: "bg-yellow-500",
  android: "bg-emerald-500",
  google: "bg-blue-600",
};

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")}k+`;
  return String(n);
}

export default async function HomePage() {
  const [brands, guides, topics, devices] = await Promise.all([
    listBrands(),
    listGuides(),
    listTopics(),
    listDevices(),
  ]);

  const live = isDatabaseConfigured();
  const guideCount = guides.length;
  const brandCount = brands.length || 0;
  const topicCount = topics.length;
  const deviceCount = devices.length;

  const brandCards = brands.map((b) => ({
    name: b.name,
    slug: b.slug,
    href: `/${b.slug}`,
    color: b.color || FALLBACK_BRAND_COLORS[b.slug] || "bg-slate-500",
    guides:
      typeof b.guides_count === "number" && b.guides_count > 0
        ? b.guides_count
        : guides.filter((g) => g.brand_slug === b.slug).length,
  }));

  const stats = [
    { label: "Guides", value: formatCount(guideCount), icon: BookOpen },
    { label: "Topic Hubs", value: formatCount(topicCount), icon: Layers },
    { label: "Brands", value: formatCount(brandCount), icon: Smartphone },
    { label: "Devices", value: formatCount(deviceCount), icon: Users },
  ];

  // Only published Neon guides — href always matches resolveGuide paths
  const featured = guides.slice(0, 8).map((g) => ({
    brand: g.brand,
    title: g.title,
    href: guideHref(g),
  }));

  return (
    <>
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-gradient-to-b from-brand-50/80 to-transparent dark:from-brand-950/30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div className="animate-fade-in">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              TapPath · Live guides
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Tech help{" "}
              <span className="bg-gradient-to-r from-brand-600 to-cyan-500 bg-clip-text text-transparent">
                you can see
              </span>
              .
            </h1>

            <p className="mt-5 max-w-xl text-lg text-[var(--muted-foreground)]">
              {guideCount > 0
                ? `${formatCount(guideCount)} interactive guides across ${brandCount} brands — step by step, visual, accurate.`
                : "Interactive smartphone settings guides with a live simulator — step by step, visual, accurate."}
            </p>

            <form action="/search" method="get" className="mt-8 flex max-w-md gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  name="q"
                  placeholder="Search brands or devices…"
                  className="w-full rounded-full border border-[var(--border)] bg-[var(--background)] py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <button
                type="submit"
                className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
              >
                Search
              </button>
            </form>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#brands"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
              >
                Browse brands <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/topics"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium hover:bg-[var(--muted)]"
              >
                Topic hubs
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm"
                >
                  <Icon className="h-5 w-5 text-brand-600" />
                  <div className="mt-3 text-2xl font-bold tracking-tight">{s.value}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="brands" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Brands</h2>
            <p className="mt-1 text-[var(--muted-foreground)]">
              {brandCount} brand{brandCount === 1 ? "" : "s"}
              {live ? " · live from database" : ""}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {brandCards.map((b) => (
            <Link
              key={b.slug}
              href={b.href}
              className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:border-brand-300 hover:shadow-md"
            >
              <div className={`mb-3 h-2 w-10 rounded-full ${b.color}`} />
              <h3 className="font-semibold group-hover:text-brand-600">{b.name}</h3>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {b.guides} guide{b.guides === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
          {brandCards.length === 0 && (
            <p className="col-span-full text-sm text-[var(--muted-foreground)]">
              No brands published yet. Add brands in Admin.
            </p>
          )}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="border-t border-[var(--border)] bg-[var(--muted)]/30">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight">Latest guides</h2>
            <p className="mt-1 text-[var(--muted-foreground)]">Recently published from the database</p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {featured.map((g) => (
                <li key={g.href}>
                  <Link
                    href={g.href}
                    className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm hover:border-brand-300"
                  >
                    <span>
                      <span className="text-[var(--muted-foreground)]">{g.brand}: </span>
                      {g.title}
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
