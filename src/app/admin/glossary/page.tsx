import type { Metadata } from "next";
import Link from "next/link";
import { glossaryTerms } from "@/data/glossary";

export const metadata: Metadata = {
  title: "Admin · Glossary",
  robots: { index: false, follow: false },
};

export default function AdminGlossaryPage() {
  const list = [...glossaryTerms].sort((a, b) => a.term.localeCompare(b.term));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-[var(--muted-foreground)]">
        <Link href="/admin" className="hover:text-[var(--foreground)]">
          Admin
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--foreground)]">Glossary</span>
      </nav>

      <h1 className="text-2xl font-bold tracking-tight">Glossary ({list.length})</h1>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Source: <code>src/data/glossary.ts</code>
      </p>

      <ul className="mt-6 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        {list.map((t) => (
          <li key={t.slug} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
            <div>
              <div className="font-medium">{t.term}</div>
              <div className="text-xs text-[var(--muted-foreground)]">{t.category}</div>
            </div>
            <Link
              href={`/glossary/${t.slug}`}
              className="text-sm font-medium text-brand-600 dark:text-brand-400"
            >
              Open →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
