export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuidePage from "@/components/guide/GuidePage";
import HowToJsonLd from "@/components/seo/HowToJsonLd";
import { requestOrigin } from "@/components/seo/JsonLd";
import { resolveGuide } from "@/lib/guides/resolve";

const path = "/samsung/galaxy/remove-google-search-bar";

export async function generateMetadata(): Promise<Metadata> {
  const guide = await resolveGuide("samsung", "galaxy", "remove-google-search-bar");
  return {
    title: guide ? `Samsung: ${guide.title}` : "Remove Google Search Bar",
    description: guide?.shortDescription?.replace(/<[^>]+>/g, "").slice(0, 160),
    alternates: { canonical: path },
  };
}

export default async function Page() {
  const guide = await resolveGuide("samsung", "galaxy", "remove-google-search-bar");
  if (!guide) notFound();
  const BASE = await requestOrigin();
  const url = `${BASE}${path}`;
  return (
    <>
      <HowToJsonLd guide={guide} url={url} />
      <GuidePage guide={guide} />
    </>
  );
}
