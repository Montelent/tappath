import type { Metadata } from "next";
import GuidePage from "@/components/guide/GuidePage";
import HowToJsonLd from "@/components/seo/HowToJsonLd";
import { guides } from "@/data/guides";

const guide = guides["samsung-galaxy-remove-google-search-bar"];
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tappath.com";
const path = `/samsung/galaxy/${guide.slug}`;
const url = `${BASE}${path}`;

export const metadata: Metadata = {
  title: `Samsung: ${guide.title}`,
  description: guide.shortDescription,
  alternates: {
    canonical: path,
  },
  openGraph: {
    title: `Samsung: ${guide.title}`,
    description: guide.shortDescription,
    type: "article",
    url: path,
  },
  twitter: {
    card: "summary_large_image",
    title: `Samsung: ${guide.title}`,
    description: guide.shortDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RemoveGoogleSearchBarPage() {
  return (
    <>
      <HowToJsonLd guide={guide} url={url} />
      <GuidePage guide={guide} />
    </>
  );
}
