export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuidePage from "@/components/guide/GuidePage";
import HowToJsonLd from "@/components/seo/HowToJsonLd";
import { requestOrigin } from "@/components/seo/JsonLd";
import { resolveGuide } from "@/lib/guides/resolve";
import { buildGuideMetadata } from "@/lib/seo/guide-metadata";

const path = "/samsung/galaxy/battery-percentage";

export async function generateMetadata(): Promise<Metadata> {
  const guide = await resolveGuide("samsung", "galaxy", "battery-percentage");
  return buildGuideMetadata(guide, path);
}

export default async function Page() {
  const guide = await resolveGuide("samsung", "galaxy", "battery-percentage");
  if (!guide) notFound();
  const BASE = await requestOrigin();
  return (
    <>
      <HowToJsonLd guide={guide} url={`${BASE}${path}`} />
      <GuidePage guide={guide} />
    </>
  );
}
