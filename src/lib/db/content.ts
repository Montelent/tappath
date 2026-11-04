/**
 * Content data access — Neon when DATABASE_URL is set, else static files (dev only).
 * Counts are always computed live from guides/devices when Neon is connected.
 * When Neon is connected, list functions never fall back to mock static data.
 */
import { getSql, isNeonConfigured } from "./neon";
import type {
  AdminStats,
  DbBrand,
  DbDevice,
  DbGlossaryTerm,
  DbGuide,
  DbTopic,
} from "./types";
import { brands as staticBrands } from "@/data/brands";
import { topics as staticTopics } from "@/data/topics";
import { getAllDevices as staticDevices } from "@/data/devices";
import { glossaryTerms as staticGlossary } from "@/data/glossary";
import { guides as staticGuides } from "@/data/guides";

export { isNeonConfigured as isDatabaseConfigured };

export async function listBrands(): Promise<DbBrand[]> {
  if (isNeonConfigured()) {
    try {
      const sql = getSql()!;
      const rows = await sql`
        SELECT
          b.*,
          (
            SELECT count(*)::int FROM guides g
            WHERE g.brand_slug = b.slug AND g.published = true
          ) AS guides_count,
          (
            SELECT count(*)::int FROM devices d
            WHERE d.brand_slug = b.slug AND COALESCE(d.published, true) = true
          ) AS devices_count
        FROM brands b
        WHERE b.published = true
        ORDER BY b.sort_order ASC NULLS LAST, b.name ASC
      `;
      return rows as DbBrand[];
    } catch (e) {
      console.error("[listBrands]", e);
      return [];
    }
  }
  return Object.values(staticBrands).map((b, i) => ({
    id: b.slug,
    slug: b.slug,
    name: b.name,
    color: b.color,
    description: b.description,
    guides_count: b.guides,
    devices_count: b.devices,
    product_lines: b.productLines,
    top_guides: b.topGuides,
    devices_list: b.devicesList,
    seo_updates: b.seoText?.updates ?? "",
    seo_help: b.seoText?.help ?? "",
    published: true,
    sort_order: i,
  }));
}

export async function listTopics(): Promise<DbTopic[]> {
  if (isNeonConfigured()) {
    try {
      const sql = getSql()!;
      const rows = await sql`
        SELECT
          t.*,
          (
            SELECT count(*)::int FROM guides g
            WHERE g.published = true
              AND (
                lower(g.category) = lower(t.name)
                OR lower(g.category) LIKE '%' || lower(t.name) || '%'
                OR lower(t.name) LIKE '%' || lower(g.category) || '%'
              )
          ) AS guide_count
        FROM topics t
        WHERE t.published = true
        ORDER BY t.sort_order ASC NULLS LAST, t.name ASC
      `;
      return rows as DbTopic[];
    } catch (e) {
      console.error("[listTopics]", e);
      return [];
    }
  }
  return staticTopics.map((t, i) => ({
    id: t.slug,
    slug: t.slug,
    name: t.name,
    description: t.description,
    icon: t.icon ?? "book",
    guide_count: t.guideCount,
    brands: (t.guidesByBrand ?? []).map((b) => b.brandSlug),
    published: true,
    sort_order: i,
  }));
}

export async function listDevices(): Promise<DbDevice[]> {
  if (isNeonConfigured()) {
    try {
      const sql = getSql()!;
      const rows = await sql`SELECT * FROM devices WHERE published = true`;
      return (rows as Record<string, unknown>[]).map((r) => ({
        id: String(r.id ?? r.slug ?? ""),
        slug: String(r.slug ?? ""),
        name: String(r.name ?? ""),
        brand: String(r.brand ?? r.brand_name ?? ""),
        brand_slug: String(r.brand_slug ?? ""),
        brand_name: r.brand_name != null ? String(r.brand_name) : null,
        os: r.os != null ? String(r.os) : null,
        href: r.href != null ? String(r.href) : null,
        year: r.year != null ? Number(r.year) : null,
        guides: Array.isArray(r.guides)
          ? (r.guides as { title: string; href: string }[])
          : [],
        published: r.published !== false,
      }));
    } catch (e) {
      console.error("[listDevices]", e);
      return [];
    }
  }
  return staticDevices().map((d) => ({
    id: d.slug,
    slug: d.slug,
    name: d.name,
    brand: d.brand,
    brand_slug: d.brandSlug,
    brand_name: d.brand,
    os: d.os,
    href: d.href,
    year: d.year ?? null,
    guides: (d.guides ?? []).map((g) => ({ title: g.title, href: g.href })),
    published: true,
  }));
}

export async function listGlossary(): Promise<DbGlossaryTerm[]> {
  if (isNeonConfigured()) {
    try {
      const sql = getSql()!;
      const rows = await sql`SELECT * FROM glossary_terms WHERE published = true ORDER BY term`;
      return rows as DbGlossaryTerm[];
    } catch (e) {
      console.error("[listGlossary]", e);
      return [];
    }
  }
  return staticGlossary.map((t) => ({
    id: t.slug,
    slug: t.slug,
    term: t.term,
    category: t.category,
    short: t.short,
    definition: t.definition,
    faqs: t.faqs || [],
    related_guides: (t.relatedGuides || []).map((g) => ({
      title: g.title,
      href: g.href,
      brand: g.brand,
    })),
    seo_title: t.seoTitle || null,
    seo_description: t.seoDescription || null,
    published: true,
  }));
}

export async function getGlossaryBySlug(slug: string): Promise<DbGlossaryTerm | null> {
  const all = await listGlossary();
  return all.find((t) => t.slug === slug) || null;
}

export async function listGuides(): Promise<DbGuide[]> {
  if (isNeonConfigured()) {
    try {
      const sql = getSql()!;
      const rows = await sql`SELECT * FROM guides WHERE published = true ORDER BY updated_at DESC`;
      return rows as DbGuide[];
    } catch (e) {
      console.error("[listGuides]", e);
      return [];
    }
  }
  return Object.values(staticGuides).map((g) => ({
    id: `${g.brandSlug}-${g.slug}`,
    slug: g.slug,
    brand: g.brand,
    brand_slug: g.brandSlug,
    product_line: g.productLine,
    title: g.title,
    short_description: g.shortDescription,
    updated_label: g.updated,
    read_time: g.readTime,
    category: g.category,
    versions: g.versions,
    article: g.article,
    faqs: g.faqs,
    related: g.related,
    compatible_devices: g.compatibleDevices,
    confirmations: g.confirmations,
    forum_verified: !!g.forumVerified,
    published: true,
    featured_image_url: g.featuredImageUrl ?? null,
  }));
}

export async function getGuideByPath(
  brandSlug: string,
  productLine: string,
  slug: string
): Promise<DbGuide | null> {
  if (isNeonConfigured()) {
    try {
      const sql = getSql()!;
      const pl = productLine.toLowerCase();
      const plHyphen = pl.replace(/\s+/g, "-");
      const plSpace = pl.replace(/-/g, " ");
      const rows = await sql`
        SELECT * FROM guides
        WHERE brand_slug = ${brandSlug}
          AND slug = ${slug}
          AND published = true
        ORDER BY
          CASE
            WHEN lower(product_line) = ${pl} THEN 0
            WHEN lower(replace(product_line, ' ', '-')) = ${plHyphen} THEN 0
            WHEN lower(product_line) = ${plSpace} THEN 0
            ELSE 1
          END
        LIMIT 1
      `;
      if (rows[0]) return rows[0] as DbGuide;
    } catch (e) {
      console.error("[getGuideByPath]", e);
    }
    return null;
  }
  const list = await listGuides();
  return list.find((g) => g.slug === slug && g.brand_slug === brandSlug) ?? null;
}

export async function getAdminStats(): Promise<AdminStats> {
  if (isNeonConfigured()) {
    try {
      const sql = getSql()!;
      await sql`CREATE TABLE IF NOT EXISTS pages (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, slug text NOT NULL UNIQUE, content text NOT NULL DEFAULT '', excerpt text NOT NULL DEFAULT '', published boolean NOT NULL DEFAULT false, seo_title text, seo_description text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())`;
      const [g, p, b, t, d, gl, f, fb] = await Promise.all([
        sql`SELECT count(*)::int AS c FROM guides`,
        sql`SELECT count(*)::int AS c FROM pages`,
        sql`SELECT count(*)::int AS c FROM brands`,
        sql`SELECT count(*)::int AS c FROM topics`,
        sql`SELECT count(*)::int AS c FROM devices`,
        sql`SELECT count(*)::int AS c FROM glossary_terms`,
        sql`SELECT count(*)::int AS c FROM forum_topics`,
        sql`SELECT count(*)::int AS c FROM guide_feedback`,
      ]);
      return {
        guides: (g[0] as { c: number }).c,
        pages: (p[0] as { c: number }).c,
        brands: (b[0] as { c: number }).c,
        topics: (t[0] as { c: number }).c,
        devices: (d[0] as { c: number }).c,
        glossary: (gl[0] as { c: number }).c,
        forumTopics: (f[0] as { c: number }).c,
        feedback: (fb[0] as { c: number }).c,
        usingSupabase: true,
      };
    } catch {
      /* fall through */
    }
  }
  return {
    guides: Object.keys(staticGuides).length,
    pages: 0,
    brands: Object.keys(staticBrands).length,
    topics: staticTopics.length,
    devices: staticDevices().length,
    glossary: staticGlossary.length,
    forumTopics: 0,
    feedback: 0,
    usingSupabase: false,
  };
}

export async function getBrandBySlug(slug: string): Promise<DbBrand | null> {
  const all = await listBrands();
  const hit = all.find((b) => b.slug === slug.toLowerCase());
  if (hit) return hit;
  if (!isNeonConfigured()) {
    const s = staticBrands[slug as keyof typeof staticBrands];
    if (!s) return null;
    return {
      id: s.slug,
      slug: s.slug,
      name: s.name,
      color: s.color,
      description: s.description,
      guides_count: s.guides,
      devices_count: s.devices,
      product_lines: s.productLines,
      top_guides: s.topGuides,
      devices_list: s.devicesList,
      seo_updates: s.seoText?.updates ?? "",
      seo_help: s.seoText?.help ?? "",
      published: true,
      sort_order: 0,
    };
  }
  return null;
}
