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

/** Score and rank related guides (same brand / line / topic / devices / OS version). */
export async function resolveRelatedGuides(
  guide: Guide,
  limit = 8
): Promise<Guide["related"]> {
  let all: DbGuide[] = [];
  try {
    if (isDatabaseConfigured()) {
      all = await listGuides();
    } else {
      all = Object.values(guides).map((g) => ({
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
      })) as unknown as DbGuide[];
    }
  } catch {
    return guide.related || [];
  }

  const selfSlug = guide.slug;
  const selfBrand = (guide.brandSlug || "").toLowerCase();
  const selfLine = (guide.productLine || "").toLowerCase();
  const selfCat = (guide.category || "").toLowerCase();
  const selfDevices = new Set(
    (guide.compatibleDevices || []).map((d) =>
      `${d.name} ${d.os}`.toLowerCase()
    )
  );
  const selfVersionText = (guide.versions || [])
    .map((v) => (v.label || "").toLowerCase())
    .join(" ");

  type Scored = { title: string; href: string; category: string; score: number };
  const scored: Scored[] = [];

  for (const g of all) {
    const brand = String(g.brand_slug || "").toLowerCase();
    const slug = String(g.slug || "");
    if (brand === selfBrand && slug === selfSlug) continue;

    let score = 0;
    if (brand === selfBrand) score += 50;
    if (productMatches(String(g.product_line || ""), selfLine)) score += 25;
    if (selfCat && String(g.category || "").toLowerCase() === selfCat) score += 20;

    const devicesRaw = parseJsonField(g.compatible_devices);
    const devices = Array.isArray(devicesRaw) ? devicesRaw : [];
    for (const d of devices) {
      const row = d as { name?: string; os?: string };
      const key = `${row.name || ""} ${row.os || ""}`.toLowerCase();
      if (!key.trim()) continue;
      for (const sd of selfDevices) {
        if (sd && (key.includes(sd) || sd.includes(key))) {
          score += 8;
          break;
        }
      }
    }

    const versionsRaw = parseJsonField(g.versions);
    const versionLabels = Array.isArray(versionsRaw)
      ? versionsRaw
          .map((v) => String((v as { label?: string })?.label || "").toLowerCase())
          .join(" ")
      : "";
    if (selfVersionText && versionLabels) {
      const tokens = selfVersionText.split(/[^a-z0-9.]+/).filter((t) => t.length > 2);
      for (const tok of tokens) {
        if (versionLabels.includes(tok)) score += 3;
      }
    }

    if (score < 50 && brand === selfBrand) score = Math.max(score, 50);
    if (score <= 0) continue;

    scored.push({
      title: String(g.title || slug),
      href: guideHref(g),
      category: String(g.category || g.brand || ""),
      score,
    });
  }

  scored.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  const manual = (guide.related || []).filter((r) => r.href && r.title);
  const seen = new Set(manual.map((r) => r.href.replace(/\/$/, "")));
  const auto = scored
    .filter((s) => !seen.has(s.href.replace(/\/$/, "")))
    .map(({ title, href, category }) => ({ title, href, category }));

  return [...manual, ...auto].slice(0, limit);
}

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
      if (db) {
        const g = dbGuideToGuide(db);
        g.related = await resolveRelatedGuides(g);
        return g;
      }

      const all = await listGuides();
      const exact = all.find(
        (g) =>
          g.brand_slug === brand &&
          g.slug === slug &&
          productMatches(String(g.product_line || ""), product)
      );
      if (exact) {
        const g = dbGuideToGuide(exact);
        g.related = await resolveRelatedGuides(g);
        return g;
      }

      const bySlug = all.find((g) => g.brand_slug === brand && g.slug === slug);
      if (bySlug) {
        const g = dbGuideToGuide(bySlug);
        g.related = await resolveRelatedGuides(g);
        return g;
      }
    } catch (e) {
      console.error("[resolveGuide]", e);
    }
    return null;
  }

  for (const g of Object.values(guides)) {
    if (
      g.brandSlug === brand &&
      g.slug === slug &&
      productMatches(g.productLine, product)
    ) {
      const related = await resolveRelatedGuides(g);
      return { ...g, related };
    }
  }
  return null;
}
