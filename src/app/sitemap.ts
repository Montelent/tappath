import type { MetadataRoute } from "next";
import {
  listGuides,
  listTopics,
  listDevices,
  listGlossary,
  listBrands,
  isDatabaseConfigured,
} from "@/lib/db/content";
import { guideHref } from "@/lib/guides/resolve";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tappath.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/topics`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/devices`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/glossary`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/forum`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
  ];

  if (!isDatabaseConfigured()) return staticRoutes;

  try {
    const [brands, topics, devices, glossary, guides] = await Promise.all([
      listBrands(),
      listTopics(),
      listDevices(),
      listGlossary(),
      listGuides(),
    ]);

    return [
      ...staticRoutes,
      ...brands.map((b) => ({
        url: `${BASE}/${b.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.85,
      })),
      ...topics.map((t) => ({
        url: `${BASE}/topics/${t.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...glossary.map((t) => ({
        url: `${BASE}/glossary/${t.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...devices.map((d) => ({
        url: `${BASE}${d.href || `/${d.brand_slug}/${d.slug}`}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...guides.map((g) => ({
        url: `${BASE}${guideHref(g)}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.9,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
