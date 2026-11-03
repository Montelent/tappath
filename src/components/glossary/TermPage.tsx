import Link from "next/link";
import type { GlossaryTerm } from "@/data/glossary";
import ShareButtons from "@/components/share/ShareButtons";

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

        <div className="mb-8">
          <ShareButtons
            title={term.term}
            text={
              term.short ||
              (typeof term.definition === "string"
                ? term.definition.replace(/<[^>]+>/g, "").slice(0, 160)
                : "") ||
              `What is ${term.term}?`
            }
          />
        </div>

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
              className="prose prose-slate dark:prose-invert max-w-none leading-relaxed"
              dangerouslySetInnerHTML={{ __html: term.definition }}
            />
          ) : (
            <div className="space-y-4 text-[var(--muted-foreground)] leading-relaxed">
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
          <section className="mb-12">
            <h2 className="font-display text-xl mb-4">Frequently asked questions</h2>
            <div className="space-y-3">
              {term.faqs.map((f, i) => (
                <details
                  key={i}
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--card)]"
                >
                  <summary className="cursor-pointer list-none px-4 py-3.5 font-medium">
                    {f.q}
                  </summary>
                  <div className="border-t border-[var(--border)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
                    {isHtml(f.a) ? (
                      <div dangerouslySetInnerHTML={{ __html: f.a }} />
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
          <section className="mb-12">
            <h2 className="font-display text-xl mb-2">Guides with {term.term}</h2>
            <div className="space-y-6 mt-4">
              {[...byBrand.entries()].map(([brand, items]) => (
                <div key={brand}>
                  <p className="label-caps mb-2">{brand}</p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {items.map((g) => (
                      <li key={g.href}>
                        <Link href={g.href} className="surface-card block px-4 py-3.5 link-quiet h-full">
                          {g.category && <span className="label-caps">{g.category}</span>}
                          <span className="mt-1 block font-medium">{g.title}</span>
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
          <section>
            <h2 className="font-display text-xl mb-4">Related terms</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {relatedTerms.map((t) => (
                <li key={t.slug}>
                  <Link href={`/glossary/${t.slug}`} className="surface-card block px-4 py-3 link-quiet">
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
