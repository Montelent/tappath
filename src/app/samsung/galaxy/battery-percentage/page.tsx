export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuidePage from "@/components/guide/GuidePage";
import HowToJsonLd from "@/components/seo/HowToJsonLd";
import { requestOrigin } from "@/components/seo/JsonLd";
import { resolveGuide } from "@/lib/guides/resolve";

const path = "/samsung/galaxy/battery-percentage";

export async function generateMetadata(): Promise<Metadata> {
  const guide = await resolveGuide("samsung", "galaxy", "battery-percentage");
  return {
    title: guide ? `Samsung: ${guide.title}` : "Battery percentage",
    description: guide?.shortDescription?.replace(/<[^>]+>/g, "").slice(0, 160),
    alternates: { canonical: path },
  };
}

export default async function Page() {
  const guide = await resolveGuide("samsung", "galaxy", "battery-percentage");
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
