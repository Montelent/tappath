import type { Metadata } from "next";
import BrandPage from "@/components/brand/BrandPage";
import { brands } from "@/data/brands";

export const metadata: Metadata = {
  title: "Realme Guides, Help & Settings",
  description:
    "Interactive guides for Realme devices running Realme UI. High number of topic hubs and community activity.",
};

export default function RealmePage() {
  return <BrandPage brand={brands.realme} />;
}
