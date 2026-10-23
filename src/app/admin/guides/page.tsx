import type { Metadata } from "next";
import Link from "next/link";
import { guides } from "@/data/guides";

export const metadata: Metadata = {
  title: "Admin · Guides",
  robots: { index: false, follow: false },
};

export default function AdminGuidesPage() {
  const list = Object.values(guides);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-[var(--muted-foreground)]">
        <Link href="/admin" className="hover:text-[var(--foreground)]">
          Admin
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--foreground)]">Guides</span>
      </nav>

      <h1 className="text-2xl font-bold tracking-tight">Guides ({list.length})</h1>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Source: <code>src/data/guides.ts</code>
      </p>

      <ul className="mt-6 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        {list.map((g) => (
          <li key={g.slug} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
            <div>
              <div className="font-medium">
                {g.brand}: {g.title}
              </div>
              <div className="text-xs text-[var(--muted-foreground)]">
                {g.category} · {g.versions.length} version(s) · {g.confirmations} confirmations
              </div>
            </div>
            <Link
              href={`/${g.brandSlug}/${g.productLine.toLowerCase()}/${g.slug}`}
              className="text-sm font-medium text-brand-600 dark:text-brand-400"
            >
              Open →
            </Link>
          </li>
        ))}
      </ul>

      {list.length === 0 && (
        <p className="mt-6 text-[var(--muted-foreground)]">No guides seeded yet.</p>
      )}
    </div>
  );
}
