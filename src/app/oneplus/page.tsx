import type { Metadata } from "next";
import BrandPage from "@/components/brand/BrandPage";
import { brands } from "@/data/brands";

export const metadata: Metadata = {
  title: "OnePlus Guides, Help & Settings",
  description:
    "Verified step-by-step guides for OnePlus devices running OxygenOS with interactive Live Simulator.",
};

export default function OnePlusPage() {
  return <BrandPage brand={brands.oneplus} />;
}
