export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuidePage from "@/components/guide/GuidePage";
import HowToJsonLd from "@/components/seo/HowToJsonLd";
import { requestOrigin } from "@/components/seo/JsonLd";
import { resolveGuide } from "@/lib/guides/resolve";

const path = "/xiaomi/smartphone/add-fingerprint";

export const metadata: Metadata = {
  title: "Xiaomi: Add a Fingerprint",
  description: "Set up fingerprint unlock on Xiaomi phones.",
  alternates: { canonical: path },
};

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
