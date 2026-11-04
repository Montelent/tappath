export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuidePage from "@/components/guide/GuidePage";
import HowToJsonLd from "@/components/seo/HowToJsonLd";
import { requestOrigin } from "@/components/seo/JsonLd";
import { resolveGuide } from "@/lib/guides/resolve";
import { buildGuideMetadata } from "@/lib/seo/guide-metadata";

const path = "/xiaomi/smartphone/add-fingerprint";

export async function generateMetadata(): Promise<Metadata> {
  const guide = await resolveGuide("xiaomi", "smartphone", "add-fingerprint");
  return buildGuideMetadata(guide, path);
}

export default async function Page() {
  const guide = await resolveGuide("xiaomi", "smartphone", "add-fingerprint");
  if (!guide) notFound();
  const BASE = await requestOrigin();
  return (
    <>
      <HowToJsonLd guide={guide} url={`${BASE}${path}`} />
      <GuidePage guide={guide} />
    </>
  );
}
