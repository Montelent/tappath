import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { GlossaryTerm } from "@/data/glossary";
import { glossaryTerms } from "@/data/glossary";

type Props = {
  term: GlossaryTerm;
};

export default function TermPage({ term }: Props) {
  const related = glossaryTerms
    .filter((t) => t.category === term.category && t.slug !== term.slug)
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <Link href="/" className="hover:text-[var(--foreground)]">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/glossary" className="hover:text-[var(--foreground)]">
          Glossary
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-[var(--foreground)]">{term.term}</span>
      </nav>

      <header className="mb-8">
        <span className="inline-block rounded-full bg-brand-100 px-3 py-0.5 text-xs font-medium uppercase tracking-wider text-brand-700 dark:bg-brand-950 dark:text-brand-300">
          {term.category}
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          {term.term}
        </h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">{term.short}</p>
      </header>

      <article className="prose prose-slate dark:prose-invert max-w-none">
        <p className="text-[var(--muted-foreground)] leading-relaxed text-base">
          {term.definition}
        </p>
      </article>

      {term.relatedGuides && term.relatedGuides.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold tracking-tight">Related guides</h2>
          <ul className="mt-3 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            {term.relatedGuides.map((g) => (
              <li key={g.href}>
                <Link
                  href={g.href}
                  className="flex items-center justify-between gap-4 px-4 py-3.5 transition hover:bg-[var(--muted)]/50"
                >
                  <span className="font-medium">{g.title}</span>
                  <span className="text-sm font-medium text-brand-600 dark:text-brand-400">
                    Open →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold tracking-tight">
            More in {term.category}
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {related.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/glossary/${t.slug}`}
                  className="block rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 transition hover:border-brand-300 dark:hover:border-brand-700"
                >
                  <div className="text-sm font-medium">{t.term}</div>
                  <div className="text-xs text-[var(--muted-foreground)] line-clamp-1">
                    {t.short}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-10">
        <Link
          href="/glossary"
          className="text-sm font-medium text-brand-600 dark:text-brand-400"
        >
          ← Back to glossary
        </Link>
      </div>
    </div>
  );
}
