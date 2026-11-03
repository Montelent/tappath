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
    canonicalUrl: (row as { canonical_url?: string | null }).canonical_url || undefined,
    robotsIndex: (row as { robots_index?: boolean | null }).robots_index ?? undefined,
    robotsFollow: (row as { robots_follow?: boolean | null }).robots_follow ?? undefined,
    ogTitle: (row as { og_title?: string | null }).og_title || undefined,
    ogDescription: (row as { og_description?: string | null }).og_description || undefined,
    ogImage: (row as { og_image?: string | null }).og_image || undefined,
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

  const { getSiteSettings } = await import("@/lib/site-settings");
  const { applySeoTemplate } = await import("@/lib/seo/templates");
  const s = await getSiteSettings();
  const plainShort = String(term.short || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const plainDef = String(term.definition || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
  const vars = {
    title: term.term,
    term: term.term,
    sitename: s.site_name,
    sep: s.seo_title_separator || "·",
    excerpt: plainShort || plainDef,
    description: plainShort || plainDef,
    category: term.category,
  };
  // Prefer per-term RankMath fields, then Admin → SEO glossary templates
  const title =
    (term.seoTitle && term.seoTitle.trim()) ||
    applySeoTemplate(
      s.seo_tpl_glossary_title,
      vars,
      `What is ${term.term}? Explanation, benefits & how it works`
    );
  const description =
    (term.seoDescription && term.seoDescription.trim()) ||
    applySeoTemplate(
      s.seo_tpl_glossary_description,
      vars,
      plainShort || plainDef
    );
  const path = `/glossary/${term.slug}`;
  const canonical = (term.canonicalUrl && term.canonicalUrl.trim()) || path;
  const index = term.robotsIndex !== false && s.seo_robots_index !== false;
  const follow = term.robotsFollow !== false && s.seo_robots_follow !== false;
  const ogTitle = (term.ogTitle && term.ogTitle.trim()) || title;
  const ogDesc = (term.ogDescription && term.ogDescription.trim()) || description;
  const origin = (s.seo_canonical_host || process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const imgRaw = term.ogImage || s.og_image_url || "/og.png";
  const ogImage = imgRaw.startsWith("http")
    ? imgRaw
    : origin
      ? `${origin}${imgRaw.startsWith("/") ? "" : "/"}${imgRaw}`
      : imgRaw;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: { index, follow },
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      type: "article",
      url: canonical,
      images: [{ url: ogImage, alt: ogTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDesc,
      images: [ogImage],
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
