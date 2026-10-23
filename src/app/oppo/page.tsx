import type { Metadata } from "next";
import BrandPage from "@/components/brand/BrandPage";
import { brands } from "@/data/brands";

export const metadata: Metadata = {
  title: "Oppo Guides, Help & Settings",
  description:
    "Step-by-step guides for Oppo devices running ColorOS. Interactive Live Simulator included.",
};

export default function OppoPage() {
  return <BrandPage brand={brands.oppo} />;
}
