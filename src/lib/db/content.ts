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
      const rows = await sql`SELECT * FROM brands WHERE published = true ORDER BY sort_order`;
      if (rows.length) return rows as DbBrand[];
    } catch { /* fall through */ }
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
      const rows = await sql`SELECT * FROM topics WHERE published = true ORDER BY sort_order`;
      if (rows.length) return rows as DbTopic[];
    } catch { /* fall through */ }
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
      if (rows.length) return rows as DbDevice[];
    } catch { /* fall through */ }
  }
  return staticDevices().map((d) => ({
    id: d.slug,
    slug: d.slug,
    name: d.name,
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
      if (rows.length) return rows as DbGlossaryTerm[];
    } catch { /* fall through */ }
  }
  return staticGlossary.map((t) => ({
    id: t.slug,
    slug: t.slug,
    term: t.term,
    category: t.category,
    short: t.short,
    definition: t.definition,
    related_guides: [],
    published: true,
  }));
}

export async function listGuides(): Promise<DbGuide[]> {
  if (isNeonConfigured()) {
    try {
      const sql = getSql()!;
      const rows = await sql`SELECT * FROM guides WHERE published = true ORDER BY updated_at DESC`;
      if (rows.length) return rows as DbGuide[];
    } catch { /* fall through */ }
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
      const rows = await sql`
        SELECT * FROM guides
        WHERE brand_slug = ${brandSlug}
          AND lower(product_line) = ${productLine.toLowerCase()}
          AND slug = ${slug}
          AND published = true
        LIMIT 1
      `;
      if (rows[0]) return rows[0] as DbGuide;
    } catch { /* fall through */ }
  }
  const list = await listGuides();
  return (
    list.find(
      (g) =>
        g.slug === slug &&
        g.brand_slug === brandSlug &&
        g.product_line.toLowerCase() === productLine.toLowerCase()
    ) ?? null
  );
}

export async function getAdminStats(): Promise<AdminStats> {
  if (isNeonConfigured()) {
    try {
      const sql = getSql()!;
      const [g, b, t, d, gl, f, fb] = await Promise.all([
        sql`SELECT count(*)::int AS c FROM guides`,
        sql`SELECT count(*)::int AS c FROM brands`,
        sql`SELECT count(*)::int AS c FROM topics`,
        sql`SELECT count(*)::int AS c FROM devices`,
        sql`SELECT count(*)::int AS c FROM glossary_terms`,
        sql`SELECT count(*)::int AS c FROM forum_topics`,
        sql`SELECT count(*)::int AS c FROM guide_feedback`,
      ]);
      return {
        guides: (g[0] as { c: number }).c,
        brands: (b[0] as { c: number }).c,
        topics: (t[0] as { c: number }).c,
        devices: (d[0] as { c: number }).c,
        glossary: (gl[0] as { c: number }).c,
        forumTopics: (f[0] as { c: number }).c,
        feedback: (fb[0] as { c: number }).c,
        usingSupabase: true,
      };
    } catch { /* fall through */ }
  }
  return {
    guides: Object.keys(staticGuides).length,
    brands: Object.keys(staticBrands).length,
    topics: staticTopics.length,
    devices: staticDevices().length,
    glossary: staticGlossary.length,
    forumTopics: 0,
    feedback: 0,
    usingSupabase: false,
  };
}
