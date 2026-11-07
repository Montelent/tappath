import type { Brand } from "@/data/brands";
import { brands as staticBrands } from "@/data/brands";
import { getBrandBySlug, listGuides, listDevices, isDatabaseConfigured } from "@/lib/db/content";
import { guideHref } from "@/lib/guides/resolve";
import { isNeonConfigured } from "@/lib/db/neon";
import { deviceHasPublishedGuide } from "@/lib/devices/resolve";

/** Public brand page model with live guide/device/product-line counts from Neon. */
export async function resolveBrandPage(slug: string): Promise<Brand | null> {
  const key = slug.toLowerCase();

  if (isDatabaseConfigured()) {
    try {
      const db = await getBrandBySlug(key);
      if (db) {
        const guides = await listGuides();
        const brandGuides = guides.filter((g) => g.brand_slug === key);
        const devices = await listDevices();
        const brandDevices = devices.filter((d) => d.brand_slug === key && deviceHasPublishedGuide(d, guides));

        const lineMap = new Map<string, number>();
        for (const g of brandGuides) {
          const line = g.product_line || "Guides";
          lineMap.set(line, (lineMap.get(line) || 0) + 1);
        }

        // Public product lines come only from currently published guide rows.
        const productLines = Array.from(lineMap.entries()).map(([name, count]) => ({
          name,
          count,
          href: `/${key}/${name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`,
        }));

        const topGuides = brandGuides.slice(0, 24).map((g) => ({
          title: g.title,
          href: guideHref(g),
          category: g.category || "General",
        }));

        const devicesList = brandDevices.slice(0, 24).map((d) => ({
          name: d.name,
          os: d.os || "",
          href: d.href || `/${d.brand_slug}/${d.slug}`,
        }));

        return {
          slug: db.slug,
          name: db.name,
          guides: brandGuides.length,
          devices: brandDevices.length,
          topicHubs: 0,
          color: db.color || "bg-slate-500",
          description: db.description || `${db.name} settings guides and help.`,
          productLines,
          topGuides,
          devicesList,
          forumTopics: [],
          seoText: {
            updates: db.seo_updates || "",
            help: db.seo_help || "",
          },
        };
      }
    } catch (e) {
      console.error("[resolveBrandPage]", e);
    }
  }

  // In production, the database is the source of truth. Never expose a bundled
  // placeholder brand when the requested brand is missing or the query failed.
  if (isNeonConfigured() || process.env.NODE_ENV === "production") return null;

  const fallback = staticBrands[key as keyof typeof staticBrands];
  return fallback || null;
}
