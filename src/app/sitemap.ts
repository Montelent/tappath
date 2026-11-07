import type { MetadataRoute } from "next";
import {
  listGuides,
  listGlossary,
  listBrands,
  isDatabaseConfigured,
} from "@/lib/db/content";
import { guideHref } from "@/lib/guides/resolve";
import { getSiteSettings } from "@/lib/site-settings";
import { listPublishedPages } from "@/lib/db/pages";
import { listDevicesPublic } from "@/lib/devices/resolve";
import { listTopicsForIndex } from "@/lib/topics/resolve";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const s = await getSiteSettings();
  if (s.seo_sitemap_enabled === false) {
    return [];
  }

  const configuredOrigin =
    s.seo_canonical_host ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL.replace(/^https?:\\/\\//i, "")}` : "") ||
    "https://tappath.com";
  let host: string;
  try {
    host = new URL(
      /^https?:\\/\\//i.test(configuredOrigin)
        ? configuredOrigin
        : `https://${configuredOrigin}`
    ).origin;
  } catch {
    host = "https://tappath.com";
  }

  const now = new Date();
  const defFreq = (s.seo_sitemap_changefreq_default || "weekly") as
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  const defPri = Number(s.seo_sitemap_priority_default || "0.7") || 0.7;
  const guideFreq = (s.seo_sitemap_changefreq_guides || "weekly") as typeof defFreq;
  const guidePri = Number(s.seo_sitemap_priority_guides || "0.9") || 0.9;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: host, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${host}/topics`, lastModified: now, changeFrequency: defFreq, priority: 0.9 },
    { url: `${host}/devices`, lastModified: now, changeFrequency: defFreq, priority: 0.9 },
    { url: `${host}/glossary`, lastModified: now, changeFrequency: defFreq, priority: 0.8 },
    { url: `${host}/forum`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
  ];

  if (!isDatabaseConfigured()) {
    return staticRoutes;
  }

  try {
    const [brands, topics, devices, glossary, guides] = await Promise.all([
      s.seo_sitemap_include_brands !== false ? listBrands() : Promise.resolve([]),
      s.seo_sitemap_include_topics !== false ? listTopicsForIndex() : Promise.resolve([]),
      s.seo_sitemap_include_devices !== false ? listDevicesPublic() : Promise.resolve([]),
      s.seo_sitemap_include_glossary !== false ? listGlossary() : Promise.resolve([]),
      s.seo_sitemap_include_guides !== false ? listGuides() : Promise.resolve([]),
    ]);

    const brandsWithGuides = brands.filter((b) => guides.some((g) => g.brand_slug === b.slug));
    // listTopicsForIndex applies the same category matching as public topic pages
    // and excludes topics without at least one published guide.
    // listDevicesPublic includes only devices with at least one matching published guide.
    const devicesWithGuides = devices;

    const brandRoutes = brandsWithGuides.map((b) => ({
      url: `${host}/${b.slug}`,
      lastModified: now,
      changeFrequency: defFreq,
      priority: 0.85,
    }));

    const topicRoutes = topics.map((t) => ({
      url: `${host}/topics/${t.slug}`,
      lastModified: now,
      changeFrequency: defFreq,
      priority: 0.8,
    }));

    const deviceRoutes = devicesWithGuides.map((d) => ({
      url: `${host}${d.href || `/${d.brandSlug}/${d.slug}`}`,
      lastModified: now,
      changeFrequency: defFreq,
      priority: defPri,
    }));

    const glossaryRoutes = glossary.map((t) => ({
      url: `${host}/glossary/${t.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    const guideRoutes = guides.map((g) => ({
      url: `${host}${guideHref(g)}`,
      lastModified: now,
      changeFrequency: guideFreq,
      priority: guidePri,
    }));

    return [
      ...staticRoutes,
      ...((await listPublishedPages()).map((p) => ({ url: `${host}/pages/${p.slug}`, lastModified: p.updated_at ? new Date(p.updated_at) : now, changeFrequency: "monthly" as const, priority: 0.6 }))),
      ...brandRoutes,
      ...topicRoutes,
      ...glossaryRoutes,
      ...deviceRoutes,
      ...guideRoutes,
    ];
  } catch {
    return staticRoutes;
  }
}
