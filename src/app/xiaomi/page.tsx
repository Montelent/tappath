import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BrandPage from "@/components/brand/BrandPage";
import { resolveBrandPage } from "@/lib/brands/resolve";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Xiaomi Guides, Help & Settings",
  description:
    "Step-by-step guides and verified menu paths for Xiaomi. Interactive live simulator included.",
};

export default async function Page() {
  const brand = await resolveBrandPage("xiaomi");
  if (!brand) notFound();
  return <BrandPage brand={brand} />;
}
