import type { Metadata } from "next";
import BrandPage from "@/components/brand/BrandPage";
import { brands } from "@/data/brands";

export const metadata: Metadata = {
  title: "Android Guides, Help & Settings",
  description:
    "Generic Android (AOSP / stock) step-by-step guides. Useful when your OEM skin closely follows pure Android.",
};

export default function AndroidPage() {
  return <BrandPage brand={brands.android} />;
}
