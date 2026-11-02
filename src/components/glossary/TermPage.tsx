import Link from "next/link";
import type { GlossaryTerm } from "@/data/glossary";

export type GuideHit = {
  title: string;
  href: string;
  brand: string;
  category?: string;
};

type Props = {
  term: GlossaryTerm;
  relatedTerms: GlossaryTerm[];
  guideHits: GuideHit[];
};

function isHtml(s: string): boolean {
  return /<[a-z][\s\S]*>/i.test(s || "");
}

export default function TermPage({ term, relatedTerms, guideHits }: Props) {
  const byBrand = new Map<string, GuideHit[]>();
  for (const g of guideHits) {
    const b = g.brand || "Guides";
    if (!byBrand.has(b)) byBrand.set(b, []);
    byBrand.get(b)!.push(g);
  }

  return (
    <div className="page-pad">
      <article className="max-wide py-8 sm:py-10 max-w-3xl">
        <nav
          className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="link-quiet">
            Home
          </Link>
          <span aria-hidden>/</span>
          <Link href="/glossary" className="link-quiet">
            Glossary
          </Link>
          <span aria-hidden>/</span>
          <span className="text-[var(--foreground)]">{term.term}</span>
        </nav>

        <header className="mb-8">
          {term.category && <p className="label-caps mb-2">{term.category}</p>}
          <h1 className="font-display text-3xl sm:text-4xl text-balance tracking-tight">
            {term.term}: Definition &amp; explanation
          </h1>
        </header>

        {term.short && (
          <aside
            className="mb-10 rounded-2xl border border-[var(--border)] bg-[var(--accent-subtle)] p-5 sm:p-6"
            aria-label="In a nutshell"
          >
            <p className="label-caps mb-2 text-[var(--accent)]">In a nutshell</p>
            <p className="text-base leading-relaxed text-[var(--foreground)] sm:text-lg">
              {term.short}
            </p>
          </aside>
        )}

        <section className="mb-12" aria-labelledby="definition-heading">
          <h2 id="definition-heading" className="sr-only">
            Definition
          </h2>
          {isHtml(term.definition) ? (
            <div
              className="prose prose-slate dark:prose-invert max-w-none leading-relaxed
                prose-headings:font-display prose-headings:tracking-tight
                prose-a:text-[var(--accent)] prose-li:marker:text-[var(--accent)]"
              dangerouslySetInnerHTML={{ __html: term.definition }}
            />
          ) : (
            <div className="space-y-4 text-[var(--muted-foreground)] leading-relaxed text-base sm:text-[1.05rem]">
              {(term.definition || "")
                .split(/\n\n+/)
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
            </div>
          )}
        </section>

        {term.faqs && term.faqs.length > 0 && (
          <section className="mb-12" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="font-display text-xl mb-4">
              Frequently asked questions
            </h2>
            <div className="space-y-3">
              {term.faqs.map((f, i) => (
                <details
                  key={i}
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] open:shadow-sm"
                >
                  <summary className="cursor-pointer list-none px-4 py-3.5 font-medium flex items-center justify-between gap-3">
                    <span>{f.q}</span>
                    <span
                      className="shrink-0 text-[var(--muted-foreground)] transition group-open:rotate-45"
                      aria-hidden
                    >
                      +
                    </span>
                  </summary>
                  <div className="border-t border-[var(--border)] px-4 py-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                    {isHtml(f.a) ? (
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: f.a }}
                      />
                    ) : (
                      <p>{f.a}</p>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {guideHits.length > 0 && (
          <section className="mb-12" aria-labelledby="guides-heading">
            <h2 id="guides-heading" className="font-display text-xl mb-2">
              Guides with {term.term}
            </h2>
            <p className="mb-5 text-sm text-[var(--muted-foreground)]">
              Step-by-step how-tos that mention or use {term.term}.
            </p>
            <div className="space-y-6">
              {[...byBrand.entries()].map(([brand, items]) => (
                <div key={brand}>
                  <p className="label-caps mb-2">{brand}</p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {items.map((g) => (
                      <li key={g.href}>
                        <Link
                          href={g.href}
                          className="surface-card block px-4 py-3.5 link-quiet h-full"
                        >
                          {g.category && (
                            <span className="label-caps">{g.category}</span>
                          )}
                          <span className="mt-1 block font-medium tracking-tight">
                            {g.title}
                          </span>
                          <span className="mt-1 block text-xs font-medium text-[var(--accent)]">
                            Open guide →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {relatedTerms.length > 0 && (
          <section aria-labelledby="related-terms-heading">
            <h2 id="related-terms-heading" className="font-display text-xl mb-4">
              Related terms
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {relatedTerms.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/glossary/${t.slug}`}
                    className="surface-card block px-4 py-3 link-quiet"
                  >
                    <span className="font-medium">{t.term}</span>
                    {t.short && (
                      <span className="mt-0.5 block text-xs text-[var(--muted-foreground)] line-clamp-2">
                        {t.short}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </div>
  );
}
