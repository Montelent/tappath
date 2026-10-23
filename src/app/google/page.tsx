import type { Metadata } from "next";
import BrandPage from "@/components/brand/BrandPage";
import { brands } from "@/data/brands";

export const metadata: Metadata = {
  title: "Google Pixel Guides, Help & Settings",
  description:
    "Guides for Google Pixel devices running pure Android / Pixel UI. Clean paths and versioned content.",
};

export default function GooglePage() {
  return <BrandPage brand={brands.google} />;
}
