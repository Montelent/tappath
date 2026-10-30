import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuidePage from "@/components/guide/GuidePage";
import HowToJsonLd from "@/components/seo/HowToJsonLd";
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
  return {
    title: `${guide.brand}: ${guide.title}`,
    description: guide.shortDescription,
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
  const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tappath.com";
  const path = `/guide/${brand}/${line}/${slug}`;
  return (
    <>
      <HowToJsonLd guide={guide} url={`${BASE}${path}`} />
      <GuidePage guide={guide} />
    </>
  );
}
