export const dynamic = "force-dynamic";
export const dynamicParams = true;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuidePage from "@/components/guide/GuidePage";
import HowToJsonLd from "@/components/seo/HowToJsonLd";
import { requestOrigin } from "@/components/seo/JsonLd";
import { resolveGuide } from "@/lib/guides/resolve";
import { listGuides, isDatabaseConfigured } from "@/lib/db/content";
import { guideHref } from "@/lib/guides/resolve";

type Params = { brand: string; line: string; slug: string };

export async function generateStaticParams() {
  if (isDatabaseConfigured()) {
    try {
      const rows = await listGuides();
      return rows.map((g) => {
        const parts = guideHref(g).split("/").filter(Boolean);
        return { brand: parts[0], line: parts[1], slug: parts[2] };
      });
    } catch {
      return [];
    }
  }
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { brand, line, slug } = await params;
  const guide = await resolveGuide(brand, line, slug);
  if (!guide) return { title: "Guide not found" };
  const path = `/${brand}/${line}/${slug}`;
  const { getSiteSettings } = await import("@/lib/site-settings");
  const { applySeoTemplate } = await import("@/lib/seo/templates");
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
    product_line: guide.productLine || line,
  };
  // Prefer per-guide RankMath fields, then site-wide templates from Admin → SEO
  const title =
    (guide.seoTitle && guide.seoTitle.trim()) ||
    applySeoTemplate(
      s.seo_tpl_guide_title,
      vars,
      `${guide.brand}: ${guide.title}`
    );
  const description =
    (guide.seoDescription && guide.seoDescription.trim()) ||
    applySeoTemplate(
      s.seo_tpl_guide_description,
      vars,
      plainExcerpt
    );
  const plainDesc = String(description || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
  const origin = (
    s.seo_canonical_host ||
    process.env.NEXT_PUBLIC_SITE_URL ||
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
  const ogDesc = (guide.ogDescription && guide.ogDescription.trim()) || plainDesc || description;
  const canonicalPath = (guide.canonicalUrl && guide.canonicalUrl.trim()) || path;
  const index = guide.robotsIndex !== false && s.seo_robots_index !== false;
  const follow = guide.robotsFollow !== false && s.seo_robots_follow !== false;

  return {
    // absolute avoids layout template doubling site name after full SEO templates
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

export default async function DynamicGuidePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { brand, line, slug } = await params;
  const guide = await resolveGuide(brand, line, slug);
  if (!guide) notFound();

  const BASE = await requestOrigin();
  const path = `/${brand}/${line}/${slug}`;
  const url = `${BASE}${path}`;

  return (
    <>
      <HowToJsonLd guide={guide} url={url} />
      <GuidePage guide={guide} />
    </>
  );
}
