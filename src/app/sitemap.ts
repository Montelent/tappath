import type { MetadataRoute } from "next";
import {
  listGuides,
  listGlossary,
  listBrands,
  isDatabaseConfigured,
} from "@/lib/db/content";
import { guideHref } from "@/lib/guides/resolve";
import { getSiteSettings } from "@/lib/site-settings";
import { getRequestOrigin } from "@/lib/seo/request-origin";
import { listPublishedPages } from "@/lib/db/pages";
import { listDevicesPublic } from "@/lib/devices/resolve";
import { listTopicsForIndex } from "@/lib/topics/resolve";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const s = await getSiteSettings();
  const host = await getRequestOrigin(s.seo_canonical_host);
  if (s.seo_sitemap_enabled === false) return [];

  const now = new Date();
  const defFreq = (s.seo_sitemap_changefreq_default || "weekly") as
    | "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  const defPri = Number(s.seo_sitemap_priority_default || "0.7") || 0.7;
  const guideFreq = (s.seo_sitemap_changefreq_guides || "weekly") as typeof defFreq;
  const guidePri = Number(s.seo_sitemap_priority_guides || "0.9") || 0.9;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: host, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${host}/topics`, lastModified: now, changeFrequency: defFreq, priority: 0.9 },
    { url: `${host}/devices`, lastModified: now, changeFrequency: defFreq, priority: 0.9 },
    { url: `${host}/glossary`, lastModified: now, changeFrequency: defFreq, priority: 0.8 },
    ...(s.seo_sitemap_include_forum !== false
      ? [{ url: `${host}/forum`, lastModified: now, changeFrequency: "daily" as const, priority: 0.7 }]
      : []),
  ];

  if (!isDatabaseConfigured()) return staticRoutes;

  try {
    const [brands, topics, devices, glossary, guides] = await Promise.all([
      s.seo_sitemap_include_brands !== false ? listBrands() : Promise.resolve([]),
      s.seo_sitemap_include_topics !== false ? listTopicsForIndex() : Promise.resolve([]),
      s.seo_sitemap_include_devices !== false ? listDevicesPublic() : Promise.resolve([]),
      s.seo_sitemap_include_glossary !== false ? listGlossary() : Promise.resolve([]),
      s.seo_sitemap_include_guides !== false ? listGuides() : Promise.resolve([]),
    ]);

    const brandRoutes = brands.map((b) => ({
      url: `${host}/${b.slug}`, lastModified: now, changeFrequency: defFreq, priority: 0.85,
    }));
    const topicRoutes = topics.map((t) => ({
      url: `${host}/topics/${t.slug}`, lastModified: now, changeFrequency: defFreq, priority: 0.8,
    }));
    const deviceRoutes = devices.map((d) => ({
      url: `${host}${d.href || `/${d.brandSlug}/${d.slug}`}`,
      lastModified: now, changeFrequency: defFreq, priority: defPri,
    }));
    const glossaryRoutes = glossary.map((t) => ({
      url: `${host}/glossary/${t.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6,
    }));
    const guideRoutes = guides.map((g) => ({
      url: `${host}${guideHref(g)}`, lastModified: now, changeFrequency: guideFreq, priority: guidePri,
    }));
    const pages = await listPublishedPages();

    return [
      ...staticRoutes,
      ...pages.map((p) => ({
        url: `${host}/pages/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...brandRoutes, ...topicRoutes, ...glossaryRoutes, ...deviceRoutes, ...guideRoutes,
    ];
  } catch {
    return staticRoutes;
  }
}
