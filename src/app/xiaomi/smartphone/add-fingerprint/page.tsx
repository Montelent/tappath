import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuidePage from "@/components/guide/GuidePage";
import HowToJsonLd from "@/components/seo/HowToJsonLd";
import { resolveGuide } from "@/lib/guides/resolve";

const path = "/xiaomi/smartphone/add-fingerprint";

export const metadata: Metadata = {
  title: "Xiaomi: Add a Fingerprint",
  description: "Register a fingerprint on your Xiaomi or Redmi phone.",
  alternates: { canonical: path },
};

export default async function Page() {
  const guide = await resolveGuide("xiaomi", "smartphone", "add-fingerprint");
  if (!guide) notFound();
  const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tappath.com";
  return (
    <>
      <HowToJsonLd guide={guide} url={`${BASE}${path}`} />
      <GuidePage guide={guide} />
    </>
  );
}
