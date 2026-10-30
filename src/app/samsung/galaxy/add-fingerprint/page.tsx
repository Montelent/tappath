import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuidePage from "@/components/guide/GuidePage";
import HowToJsonLd from "@/components/seo/HowToJsonLd";
import { resolveGuide } from "@/lib/guides/resolve";

const path = "/samsung/galaxy/add-fingerprint";

export const metadata: Metadata = {
  title: "Samsung: Add a Fingerprint",
  description: "Set up fingerprint unlock on Samsung Galaxy.",
  alternates: { canonical: path },
};

export default async function Page() {
  const guide = await resolveGuide("samsung", "galaxy", "add-fingerprint");
  if (!guide) notFound();
  const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tappath.com";
  return (
    <>
      <HowToJsonLd guide={guide} url={`${BASE}${path}`} />
      <GuidePage guide={guide} />
    </>
  );
}
