import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuidePage from "@/components/guide/GuidePage";
import HowToJsonLd from "@/components/seo/HowToJsonLd";
import { guides } from "@/data/guides";

const guide = guides["samsung-galaxy-battery-percentage"];

if (!guide) {
  // Build-time safety: never access properties on undefined
}

const path = guide ? `/samsung/galaxy/${guide.slug}` : "/samsung";
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tappath.com";
const url = `${BASE}${path}`;

export const metadata: Metadata = {
  title: guide ? `Samsung: ${guide.title}` : "Guide not found",
  description: guide?.shortDescription ?? "",
  alternates: guide ? { canonical: path } : undefined,
};

export default function BatteryPercentagePage() {
  if (!guide) notFound();
  return (
    <>
      <HowToJsonLd guide={guide} url={url} />
      <GuidePage guide={guide} />
    </>
  );
}
