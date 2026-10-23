import type { Metadata } from "next";
import BrandPage from "@/components/brand/BrandPage";
import { brands } from "@/data/brands";

export const metadata: Metadata = {
  title: "Huawei Guides, Help & Settings",
  description:
    "Step-by-step guides and verified menu paths for Huawei devices running EMUI and HarmonyOS.",
};

export default function HuaweiPage() {
  return <BrandPage brand={brands.huawei} />;
}
