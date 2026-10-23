import type { MetadataRoute } from "next";
import { topics } from "@/data/topics";
import { glossaryTerms } from "@/data/glossary";
import { getAllDevices } from "@/data/devices";
import { guides } from "@/data/guides";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tappath.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/topics`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/devices`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/glossary`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/sign-in`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/sign-up`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  const brands = [
    "samsung",
    "xiaomi",
    "huawei",
    "oneplus",
    "oppo",
    "realme",
    "android",
    "google",
  ].map((slug) => ({
    url: `${BASE}/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const topicRoutes = topics.map((t) => ({
    url: `${BASE}/topics/${t.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const glossaryRoutes = glossaryTerms.map((t) => ({
    url: `${BASE}/glossary/${t.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const deviceRoutes = getAllDevices().map((d) => ({
    url: `${BASE}${d.href}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const guideRoutes = Object.values(guides).map((g) => ({
    url: `${BASE}/${g.brandSlug}/${g.productLine.toLowerCase()}/${g.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [
    ...staticRoutes,
    ...brands,
    ...topicRoutes,
    ...glossaryRoutes,
    ...deviceRoutes,
    ...guideRoutes,
  ];
}
