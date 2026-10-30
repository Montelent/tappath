import { guides, type Guide, type GuideVersion } from "@/data/guides";
import { getGuideByPath, listGuides, isDatabaseConfigured } from "@/lib/db/content";
import type { DbGuide } from "@/lib/db/types";

function mapVersions(raw: unknown): GuideVersion[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [{ id: "default", label: "Default", steps: [] }];
  }
  return raw.map((v: any, i: number) => {
    if (v && Array.isArray(v.steps)) {
      return {
        id: String(v.id || `v-${i}`),
        label: String(v.label || `Version ${i + 1}`),
        steps: v.steps.map((s: any, j: number) => ({
          id: Number(s.id) || j + 1,
          instruction: String(s.instruction || s.text || ""),
          highlight: String(s.highlight || ""),
          detail: s.detail ? String(s.detail) : undefined,
        })),
      };
    }
    return {
      id: String(v?.id || `v-${i}`),
      label: String(v?.label || `Version ${i + 1}`),
      steps: [],
    };
  });
}

export function dbGuideToGuide(db: DbGuide): Guide {
  const article = Array.isArray(db.article) ? db.article.map(String) : [];
  let versions = mapVersions(db.versions);
  if (versions.every((v) => v.steps.length === 0) && article.length) {
    versions = [
      {
        id: "from-article",
        label: versions[0]?.label || "Guide",
        steps: article.map((text, i) => ({
          id: i + 1,
          instruction: text,
          highlight: "",
          detail: undefined,
        })),
      },
    ];
  }
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
    faqs: Array.isArray(db.faqs) ? (db.faqs as Guide["faqs"]) : [],
    related: Array.isArray(db.related) ? (db.related as Guide["related"]) : [],
    compatibleDevices: Array.isArray(db.compatible_devices)
      ? (db.compatible_devices as Guide["compatibleDevices"])
      : [],
    confirmations: db.confirmations || 0,
    forumVerified: !!db.forum_verified,
  };
}

export async function resolveGuide(
  brandSlug: string,
  productLine: string,
  slug: string
): Promise<Guide | null> {
  const brand = brandSlug.toLowerCase();
  const product = productLine.toLowerCase().replace(/-/g, " ");
  const productHyphen = productLine.toLowerCase();

  for (const g of Object.values(guides)) {
    if (
      g.brandSlug === brand &&
      g.slug === slug &&
      (g.productLine.toLowerCase() === product ||
        g.productLine.toLowerCase().replace(/\s+/g, "-") === productHyphen)
    ) {
      return g;
    }
  }

  if (isDatabaseConfigured()) {
    try {
      const db = await getGuideByPath(brand, productLine, slug);
      if (db) return dbGuideToGuide(db);
      const db2 = await getGuideByPath(brand, product, slug);
      if (db2) return dbGuideToGuide(db2);
      const all = await listGuides();
      const hit = all.find(
        (g) =>
          g.brand_slug === brand &&
          g.slug === slug &&
          (g.product_line.toLowerCase() === product ||
            g.product_line.toLowerCase().replace(/\s+/g, "-") === productHyphen)
      );
      if (hit) return dbGuideToGuide(hit);
    } catch {
      /* ignore */
    }
  }

  return null;
}
