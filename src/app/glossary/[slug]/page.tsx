export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TermPage, { type GuideHit } from "@/components/glossary/TermPage";
import DefinedTermJsonLd from "@/components/seo/DefinedTermJsonLd";
import {
  getGlossaryBySlug,
  listGlossary,
  listGuides,
  isDatabaseConfigured,
} from "@/lib/db/content";
import { guideHref } from "@/lib/guides/resolve";
import type { GlossaryTerm } from "@/data/glossary";
import { getTerm, glossaryTerms } from "@/data/glossary";

type Props = { params: Promise<{ slug: string }> };

function parseJsonArray<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (typeof raw === "string") {
    try {
      const p = JSON.parse(raw);
      return Array.isArray(p) ? (p as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function dbToTerm(
  row: Awaited<ReturnType<typeof getGlossaryBySlug>>
): GlossaryTerm | null {
  if (!row) return null;
  return {
    slug: row.slug,
    term: row.term,
    category: row.category || "General",
    short: row.short || "",
    definition: row.definition || "",
    faqs: parseJsonArray(row.faqs),
    relatedGuides: parseJsonArray(row.related_guides),
    seoTitle: row.seo_title || undefined,
    seoDescription: row.seo_description || undefined,
  };
}

async function findGuidesForTerm(term: GlossaryTerm): Promise<GuideHit[]> {
  const needle = term.term.toLowerCase();
  const slugNeedle = term.slug.toLowerCase().replace(/-/g, " ");
  const hits: GuideHit[] = [];
  const seen = new Set<string>();

  for (const g of term.relatedGuides || []) {
    if (!g.href || seen.has(g.href)) continue;
    seen.add(g.href);
    hits.push({
      title: g.title,
      href: g.href,
      brand: g.brand || "",
    });
  }

  try {
    const guides = await listGuides();
    for (const g of guides) {
      const href = guideHref(g);
      if (seen.has(href)) continue;
      const hay = [g.title, g.slug, g.short_description, g.category, g.brand]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (
        hay.includes(needle) ||
        hay.includes(slugNeedle) ||
        g.slug.includes(term.slug)
      ) {
        seen.add(href);
        hits.push({
          title: g.title,
          href,
          brand: g.brand || "",
          category: g.category || undefined,
        });
      }
    }
  } catch {
    /* ignore */
  }
  return hits.slice(0, 18);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let term: GlossaryTerm | null = null;
  if (isDatabaseConfigured()) {
    term = dbToTerm(await getGlossaryBySlug(slug));
  }
  if (!term) term = getTerm(slug) || null;
  if (!term) return { title: "Term not found" };

  const title =
    term.seoTitle ||
    `What is ${term.term}? Explanation, benefits & how it works | Glossary`;
  const description =
    term.seoDescription ||
    term.short ||
    (term.definition || "").replace(/<[^>]+>/g, " ").slice(0, 160);

  return {
    title,
    description,
    alternates: { canonical: `/glossary/${term.slug}` },
    openGraph: {
      title: `${term.term}: Definition & explanation`,
      description,
      type: "article",
      url: `/glossary/${term.slug}`,
    },
  };
}

export default async function GlossaryTermPage({ params }: Props) {
  const { slug } = await params;

  let term: GlossaryTerm | null = null;
  let relatedTerms: GlossaryTerm[] = [];

  if (isDatabaseConfigured()) {
    const row = await getGlossaryBySlug(slug);
    term = dbToTerm(row);
    if (term) {
      const all = await listGlossary();
      relatedTerms = all
        .filter((t) => t.category === term!.category && t.slug !== term!.slug)
        .slice(0, 8)
        .map((t) => dbToTerm(t)!)
        .filter(Boolean);
    }
  }

  if (!term) {
    term = getTerm(slug) || null;
    if (term) {
      relatedTerms = glossaryTerms
        .filter((t) => t.category === term!.category && t.slug !== term!.slug)
        .slice(0, 8);
    }
  }

  if (!term) notFound();

  const guideHits = await findGuidesForTerm(term);

  return (
    <>
      <DefinedTermJsonLd
        term={term.term}
        slug={term.slug}
        short={term.short}
        definition={term.definition}
        category={term.category}
        faqs={term.faqs}
      />
      <TermPage term={term} relatedTerms={relatedTerms} guideHits={guideHits} />
    </>
  );
}
