import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/site-settings";
import { getRequestOrigin } from "@/lib/seo/request-origin";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const s = await getSiteSettings();
  const host = await getRequestOrigin(s.seo_canonical_host);

  const disallow = ["/admin/", "/api/", "/sign-in/", "/sign-up/"];
  for (const line of (s.seo_robots_extra || "").split("\n")) {
    const m = line.trim().match(/^Disallow:\s*(.+)$/i);
    if (m) disallow.push(m[1].trim());
  }

  const allowIndex = s.seo_robots_index !== false;

  return {
    rules: allowIndex
      ? { userAgent: "*", allow: "/", disallow }
      : { userAgent: "*", disallow: "/" },
    sitemap: `${host}/sitemap.xml`,
    host,
  };
}
