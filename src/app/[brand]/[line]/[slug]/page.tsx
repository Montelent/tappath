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
  const vars = {
    title: guide.title,
    brand: guide.brand,
    sitename: s.site_name,
    sep: s.seo_title_separator || "·",
    excerpt: guide.shortDescription,
    description: guide.shortDescription,
    product_line: guide.productLine || line,
  };
  const title = applySeoTemplate(
    s.seo_tpl_guide_title,
    vars,
    `${guide.brand}: ${guide.title}`
  );
  const description = applySeoTemplate(
    s.seo_tpl_guide_description,
    vars,
    guide.shortDescription
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
    (guide as { featuredImageUrl?: string }).featuredImageUrl ||
    s.og_image_url ||
    "/og.png";
  const ogImage = featured.startsWith("http")
    ? featured
    : origin
      ? `${origin}${featured.startsWith("/") ? "" : "/"}${featured}`
      : featured;

  return {
    title,
    description: plainDesc || description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description: plainDesc || description,
      type: "article",
      url: path,
      images: [{ url: ogImage, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: plainDesc || description,
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
