export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuidePage from "@/components/guide/GuidePage";
import HowToJsonLd from "@/components/seo/HowToJsonLd";
import { requestOrigin } from "@/components/seo/JsonLd";
import { resolveGuide } from "@/lib/guides/resolve";

type Params = { brand: string; line: string; slug: string };

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
    description: guide.shortDescription?.replace(/<[^>]+>/g, "").slice(0, 160),
    alternates: { canonical: path },
  };
}

export default async function UniversalGuidePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { brand, line, slug } = await params;
  const guide = await resolveGuide(brand, line, slug);
  if (!guide) notFound();
  const BASE = await requestOrigin();
  const path = `/${brand}/${line}/${slug}`;
  return (
    <>
      <HowToJsonLd guide={guide} url={`${BASE}${path}`} />
      <GuidePage guide={guide} />
    </>
  );
}
