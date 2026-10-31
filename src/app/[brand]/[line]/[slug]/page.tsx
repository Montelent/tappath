export const dynamic = "force-dynamic";
export const dynamicParams = true;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuidePage from "@/components/guide/GuidePage";
import HowToJsonLd from "@/components/seo/HowToJsonLd";
import { resolveGuide, guideHref } from "@/lib/guides/resolve";
import { listGuides, isDatabaseConfigured } from "@/lib/db/content";

type Params = { brand: string; line: string; slug: string };

/** Only real DB guide paths when Neon is connected — never mock paths. */
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
  return {
    title: `${guide.brand}: ${guide.title}`,
    description: guide.shortDescription,
    alternates: { canonical: path },
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

  const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tappath.com";
  const path = `/${brand}/${line}/${slug}`;
  const url = `${BASE}${path}`;

  return (
    <>
      <HowToJsonLd guide={guide} url={url} />
      <GuidePage guide={guide} />
    </>
  );
}
