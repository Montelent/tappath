import { guides, type Guide, type GuideVersion } from "@/data/guides";
import { getGuideByPath, listGuides, isDatabaseConfigured } from "@/lib/db/content";
import { isNeonConfigured } from "@/lib/db/neon";
import type { DbGuide } from "@/lib/db/types";

function parseJsonField(raw: unknown): unknown {
  if (raw == null) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return raw;
}

function mapStep(s: Record<string, unknown>, j: number) {
  const instruction = String(s.instruction || s.text || "");
  const bold = instruction.match(/\*\*(.+?)\*\*/);
  const rawUrl =
    s.imageUrl ?? s.image_url ?? s.screenshot ?? s.url ?? null;
  let imageUrl: string | undefined;
  if (typeof rawUrl === "string") {
    const t = rawUrl.trim();
    // ignore empty, literal "null", and leftover data: URLs
    if (t && t !== "null" && t !== "undefined" && !t.startsWith("data:")) {
      imageUrl = t;
    }
  }
  const markerX =
    s.markerX != null
      ? Number(s.markerX)
      : s.marker_x != null
        ? Number(s.marker_x)
        : undefined;
  const markerY =
    s.markerY != null
      ? Number(s.markerY)
      : s.marker_y != null
        ? Number(s.marker_y)
        : undefined;
  return {
    id: Number(s.id) || j + 1,
    instruction,
    highlight: String(s.highlight || (bold ? bold[1] : "")),
    detail: s.detail ? String(s.detail) : undefined,
    imageUrl,
    markerX: Number.isFinite(markerX as number) ? (markerX as number) : undefined,
    markerY: Number.isFinite(markerY as number) ? (markerY as number) : undefined,
  };
}

function mapVersions(raw: unknown): GuideVersion[] {
  const parsed = parseJsonField(raw);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return [{ id: "default", label: "Default", steps: [] }];
  }
  return parsed.map((v: unknown, i: number) => {
    const ver = (v || {}) as Record<string, unknown>;
    let stepsRaw = ver.steps;
    if (typeof stepsRaw === "string") {
      try {
        stepsRaw = JSON.parse(stepsRaw);
      } catch {
        stepsRaw = [];
      }
    }
    const steps = Array.isArray(stepsRaw)
      ? stepsRaw.map((s, j) => mapStep((s || {}) as Record<string, unknown>, j))
      : [];
    return {
      id: String(ver.id || `v-${i}`),
      label: String(ver.label || `Version ${i + 1}`),
      steps,
    };
  });
}

export function dbGuideToGuide(db: DbGuide): Guide {
  const articleRaw = parseJsonField(db.article);
  const article = Array.isArray(articleRaw) ? articleRaw.map(String) : [];
  let versions = mapVersions(db.versions);
  if (versions.every((v) => v.steps.length === 0) && article.length) {
    versions = [
      {
        id: "default",
        label: "Default",
        steps: article.slice(0, 8).map((text, i) => ({
          id: i + 1,
          instruction: text,
          highlight: "",
        })),
      },
    ];
  }

  const faqsRaw = parseJsonField(db.faqs);
  const relatedRaw = parseJsonField(db.related);
  const devicesRaw = parseJsonField(db.compatible_devices);

  return {
    slug: db.slug,
    brand: db.brand,
    brandSlug: db.brand_slug,
    productLine: db.product_line,
    title: db.title,
    shortDescription: db.short_description || "",
    updated: db.updated_label || "",
    readTime: db.read_time || "2 min",
    category: db.category || "General",
    versions,
    article,
    faqs: Array.isArray(faqsRaw) ? (faqsRaw as Guide["faqs"]) : [],
    related: Array.isArray(relatedRaw) ? (relatedRaw as Guide["related"]) : [],
    compatibleDevices: Array.isArray(devicesRaw)
      ? (devicesRaw as Guide["compatibleDevices"])
      : [],
    confirmations: db.confirmations || 0,
    forumVerified: !!db.forum_verified,
  };
}

/** Public URL path for a guide (always lowercase hyphenated product line). */
export function guideHref(g: {
  brand_slug?: string;
  brandSlug?: string;
  product_line?: string;
  productLine?: string;
  slug: string;
}): string {
  const brand = (g.brand_slug || g.brandSlug || "").toLowerCase();
  const line = String(g.product_line || g.productLine || "guides")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return `/${brand}/${line || "guides"}/${g.slug}`;
}

function productMatches(stored: string, requested: string): boolean {
  const a = stored.toLowerCase().replace(/\s+/g, "-");
  const b = requested.toLowerCase().replace(/\s+/g, "-");
  const aSpace = stored.toLowerCase().replace(/-/g, " ");
  const bSpace = requested.toLowerCase().replace(/-/g, " ");
  return (
    a === b ||
    aSpace === bSpace ||
    stored.toLowerCase() === requested.toLowerCase() ||
    a.includes(b) ||
    b.includes(a)
  );
}

/**
 * Resolve a guide for a public URL.
 * When Neon is connected: only database guides (never static mock).
 * Matching is flexible on product line so homepage links don't 404.
 */
export async function resolveGuide(
  brandSlug: string,
  productLine: string,
  slug: string
): Promise<Guide | null> {
  const brand = brandSlug.toLowerCase();
  const product = productLine.toLowerCase();

  if (isDatabaseConfigured()) {
    try {
      const db = await getGuideByPath(brand, productLine, slug);
      if (db) return dbGuideToGuide(db);

      // Soft match: brand + slug only (product line can differ)
      const all = await listGuides();
      const exact = all.find(
        (g) =>
          g.brand_slug === brand &&
          g.slug === slug &&
          productMatches(String(g.product_line || ""), product)
      );
      if (exact) return dbGuideToGuide(exact);

      const bySlug = all.find((g) => g.brand_slug === brand && g.slug === slug);
      if (bySlug) return dbGuideToGuide(bySlug);
    } catch (e) {
      console.error("[resolveGuide]", e);
    }
    // Neon is on — do NOT fall back to mock static guides
    return null;
  }

  // Dev without DATABASE_URL only
  for (const g of Object.values(guides)) {
    if (
      g.brandSlug === brand &&
      g.slug === slug &&
      productMatches(g.productLine, product)
    ) {
      return g;
    }
  }
  return null;
}
