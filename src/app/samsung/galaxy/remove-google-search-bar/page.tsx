export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuidePage from "@/components/guide/GuidePage";
import HowToJsonLd from "@/components/seo/HowToJsonLd";
import { resolveGuide } from "@/lib/guides/resolve";

export async function generateMetadata(): Promise<Metadata> {
  const guide = await resolveGuide("samsung", "galaxy", "remove-google-search-bar");
  if (!guide) return { title: "Guide not found" };
  return {
    title: `${guide.brand}: ${guide.title}`,
    description: guide.shortDescription,
  };
}

export default async function Page() {
  const guide = await resolveGuide("samsung", "galaxy", "remove-google-search-bar");
  if (!guide) notFound();
  const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tappath.com";
  const url = `${BASE}/samsung/galaxy/remove-google-search-bar`;
  return (
    <>
      <HowToJsonLd guide={guide} url={url} />
      <GuidePage guide={guide} />
    </>
  );
}
