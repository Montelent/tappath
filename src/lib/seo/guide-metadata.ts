import type { Metadata } from "next";
import type { Guide } from "@/data/guides";
import { getSiteSettings } from "@/lib/site-settings";
import { applySeoTemplate } from "@/lib/seo/templates";
import { requestOrigin } from "@/components/seo/JsonLd";

/**
 * Build Next.js Metadata for a guide page using:
 * 1) Per-guide RankMath fields (seoTitle, og*, robots, canonical)
 * 2) Admin → SEO guide templates (seo_tpl_guide_*)
 * 3) Sensible fallbacks
 */
export async function buildGuideMetadata(
  guide: Guide | null,
  path: string
): Promise<Metadata> {
  if (!guide) {
    return { title: "Guide not found" };
  }

  const s = await getSiteSettings();
  const plainExcerpt = String(guide.shortDescription || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const vars = {
    title: guide.title,
    brand: guide.brand,
    sitename: s.site_name,
    sep: s.seo_title_separator || "·",
    excerpt: plainExcerpt,
    description: plainExcerpt,
    product_line: guide.productLine || "",
  };

  const title =
    (guide.seoTitle && guide.seoTitle.trim()) ||
    applySeoTemplate(
      s.seo_tpl_guide_title,
      vars,
      `${guide.title} ${s.seo_title_separator || "·"} ${guide.brand} ${s.seo_title_separator || "·"} ${s.site_name}`
    );

  const description =
    (guide.seoDescription && guide.seoDescription.trim()) ||
    applySeoTemplate(s.seo_tpl_guide_description, vars, plainExcerpt);

  const plainDesc = String(description || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);

  // Detect origin from the live request (or Admin canonical host if set). Never hardcode a domain.
  const detected = await requestOrigin();
  const origin = (
    (s.seo_canonical_host || "").trim() ||
    detected ||
    ""
  ).replace(/\/$/, "");

  const featured =
    guide.ogImage ||
    guide.featuredImageUrl ||
    s.og_image_url ||
    "/og.png";
  const ogImage = featured.startsWith("http")
    ? featured
    : origin
      ? `${origin}${featured.startsWith("/") ? "" : "/"}${featured}`
      : featured;

  const ogTitle = (guide.ogTitle && guide.ogTitle.trim()) || title;
  const ogDesc =
    (guide.ogDescription && guide.ogDescription.trim()) ||
    plainDesc ||
    description;

  const canonicalPath =
    (guide.canonicalUrl && guide.canonicalUrl.trim()) || path;
  const index = guide.robotsIndex !== false && s.seo_robots_index !== false;
  const follow = guide.robotsFollow !== false && s.seo_robots_follow !== false;

  return {
    title: { absolute: title },
    description: plainDesc || description,
    alternates: { canonical: canonicalPath },
    robots: { index, follow },
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      type: "article",
      url: canonicalPath,
      images: [{ url: ogImage, alt: ogTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDesc,
      images: [ogImage],
    },
  };
}
