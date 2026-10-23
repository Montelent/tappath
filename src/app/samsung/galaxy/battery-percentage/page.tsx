import type { Metadata } from "next";
import GuidePage from "@/components/guide/GuidePage";
import HowToJsonLd from "@/components/seo/HowToJsonLd";
import { guides } from "@/data/guides";

const guide = guides["samsung-galaxy-battery-percentage"];
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tappath.com";
const path = `/samsung/galaxy/${guide.slug}`;
const url = `${BASE}${path}`;

export const metadata: Metadata = {
  title: `Samsung: ${guide.title}`,
  description: guide.shortDescription,
  alternates: { canonical: path },
};

export default function BatteryPercentagePage() {
  return (
    <>
      <HowToJsonLd guide={guide} url={url} />
      <GuidePage guide={guide} />
    </>
  );
}
