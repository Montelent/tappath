import type { Metadata } from "next";
import BrandPage from "@/components/brand/BrandPage";
import { brands } from "@/data/brands";

export const metadata: Metadata = {
  title: "Xiaomi Guides, Help & Settings",
  description:
    "Step-by-step guides and verified menu paths for Xiaomi phones and tablets. Live Simulator ready.",
};

export default function XiaomiPage() {
  return <BrandPage brand={brands.xiaomi} />;
}
