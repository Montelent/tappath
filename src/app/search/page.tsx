import Link from "next/link";
import type { Metadata } from "next";
import { listGuides } from "@/lib/db/content";
import { guideHref } from "@/lib/guides/resolve";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search smartphone settings guides",
  description: "Search TapPath's published smartphone settings guides.",
  robots: { index: false, follow: true },
};

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const query = q.trim().slice(0, 120);
  const normalized = query.toLowerCase();
  const guides = query ? await listGuides() : [];
  const results = guides.filter((guide) => {
    const haystack = [
      guide.title,
      guide.short_description,
      guide.brand,
      guide.product_line,
      guide.category,
      guide.slug,
    ].filter(Boolean).join(" ").toLowerCase();
    return haystack.includes(normalized);
  }).slice(0, 50);

  return (
    <main className="page-pad">
      <div className="max-wide py-10 sm:py-14">
        <header className="mb-8 max-w-2xl">
          <p className="label-caps mb-2">TapPath search</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">Search guides</h1>
          <form action="/search" method="get" className="mt-5 flex gap-2">
            <label htmlFor="guide-search" className="sr-only">Search published guides</label>
            <input
              id="guide-search"
              name="q"
              type="search"
              defaultValue={query}
              maxLength={120}
              placeholder="Try fingerprint, battery, Private DNS…"
              className="search-field min-w-0 flex-1"
            />
            <button type="submit" className="btn-accent shrink-0">Search</button>
          </form>
        </header>

        {!query ? (
          <p className="text-sm text-[var(--muted-foreground)]">Enter a setting or device feature to find a guide.</p>
        ) : results.length ? (
          <>
            <p className="mb-4 text-sm text-[var(--muted-foreground)]">{results.length} matching {results.length === 1 ? "guide" : "guides"}</p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {results.map((guide) => (
                <li key={guideHref(guide)}>
                  <Link href={guideHref(guide)} className="surface-card block h-full p-4 link-quiet hover:border-[var(--accent)]">
                    <span className="block font-medium">{guide.title}</span>
                    <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                      {guide.brand}{guide.product_line ? ` · ${guide.product_line}` : ""}{guide.category ? ` · ${guide.category}` : ""}
                    </span>
                    {guide.short_description ? <span className="mt-2 block text-sm text-[var(--muted-foreground)]">{guide.short_description.replace(/<[^>]*>/g, " ").slice(0, 180)}</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">No published guides matched “{query}”. Try a shorter or different search.</p>
        )}
      </div>
    </main>
  );
}
