import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BrandPage from "@/components/brand/BrandPage";
import { resolveBrandPage } from "@/lib/brands/resolve";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "OnePlus Guides, Help & Settings",
  description: "Step-by-step guides for OnePlus. Interactive live simulator included.",
};

export default async function Page() {
  const brand = await resolveBrandPage("oneplus");
  if (!brand) notFound();
  return <BrandPage brand={brand} />;
}
