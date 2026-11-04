import type { Brand } from "@/data/brands";
import { brands as staticBrands } from "@/data/brands";
import { getBrandBySlug, listGuides, listDevices, isDatabaseConfigured } from "@/lib/db/content";
import { guideHref } from "@/lib/guides/resolve";
import { isNeonConfigured } from "@/lib/db/neon";

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
        const brandDevices = devices.filter((d) => d.brand_slug === key);

        const lineMap = new Map<string, number>();
        for (const g of brandGuides) {
          const line = g.product_line || "Guides";
          lineMap.set(line, (lineMap.get(line) || 0) + 1);
        }

        // Prefer lines derived from live guides; fall back to stored product_lines
        let productLines =
          lineMap.size > 0
            ? Array.from(lineMap.entries()).map(([name, count]) => ({
                name,
                count,
                href: `/${key}/${name.toLowerCase().replace(/\s+/g, "-")}`,
              }))
            : (Array.isArray(db.product_lines) ? db.product_lines : []).map(
                (pl: { name?: string; href?: string; count?: number }) => ({
                  name: String(pl.name || "Guides"),
                  count: Number(pl.count) || 0,
                  href:
                    pl.href ||
                    `/${key}/${String(pl.name || "guides")
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`,
                })
              );

        if (productLines.length === 0 && brandGuides.length > 0) {
          productLines = [{ name: "All", count: brandGuides.length, href: `/${key}` }];
        }

        const topGuides = brandGuides.slice(0, 24).map((g) => ({
          title: g.title,
          href: guideHref(g),
          category: g.category || "General",
        }));

        const devicesList = brandDevices.slice(0, 24).map((d) => ({
          name: d.name,
          os: d.os || "",
          href: d.href || `/devices/${d.slug}`,
        }));

        return {
          slug: db.slug,
          name: db.name,
          guides: brandGuides.length || Number(db.guides_count) || 0,
          devices: brandDevices.length || Number(db.devices_count) || 0,
          topicHubs: 0,
          color: db.color || "bg-slate-500",
          description: db.description || `${db.name} settings guides and help.`,
          productLines,
          topGuides:
            topGuides.length > 0
              ? topGuides
              : Array.isArray(db.top_guides)
                ? (db.top_guides as Brand["topGuides"])
                : [],
          devicesList:
            devicesList.length > 0
              ? devicesList
              : Array.isArray(db.devices_list)
                ? (db.devices_list as Brand["devicesList"])
                : [],
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
