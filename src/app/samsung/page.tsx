import type { Metadata } from "next";
import BrandPage from "@/components/brand/BrandPage";
import { brands } from "@/data/brands";

export const metadata: Metadata = {
  title: "Samsung Guides, Help & Settings",
  description:
    "Step-by-step guides and verified menu paths for Samsung devices running One UI. Interactive live simulator included.",
};

export default function SamsungPage() {
  return <BrandPage brand={brands.samsung} />;
}
