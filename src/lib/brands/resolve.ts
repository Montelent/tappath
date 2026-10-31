import type { Brand } from "@/data/brands";
import { brands as staticBrands } from "@/data/brands";
import { getBrandBySlug, listGuides, listDevices, isDatabaseConfigured } from "@/lib/db/content";
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

        const rawLines = Array.isArray(db.product_lines) ? db.product_lines : [];
        let productLines =
          rawLines.length > 0
            ? rawLines.map((pl: { name?: string; href?: string }) => {
                const name = String(pl.name || "Guides");
                const href =
                  pl.href || `/${key}/${name.toLowerCase().replace(/\s+/g, "-")}`;
                return { name, count: lineMap.get(name) || 0, href };
              })
            : Array.from(lineMap.entries()).map(([name, count]) => ({
                name,
                count,
                href: `/${key}/${name.toLowerCase().replace(/\s+/g, "-")}`,
              }));

        if (productLines.length === 0 && brandGuides.length > 0) {
          productLines = [{ name: "All", count: brandGuides.length, href: `/${key}` }];
        }

        const topGuides = brandGuides.slice(0, 8).map((g) => ({
          title: g.title,
          href: `/${g.brand_slug}/${String(g.product_line || "galaxy")
            .toLowerCase()
            .replace(/\s+/g, "-")}/${g.slug}`,
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
          guides: Number(db.guides_count) || brandGuides.length,
          devices: Number(db.devices_count) || brandDevices.length,
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

  const fallback = staticBrands[key as keyof typeof staticBrands];
  if (!fallback) return null;
  if (isNeonConfigured()) {
    return {
      ...fallback,
      guides: 0,
      devices: 0,
      productLines: fallback.productLines.map((pl) => ({ ...pl, count: 0 })),
      topGuides: [],
      devicesList: [],
    };
  }
  return fallback;
}
