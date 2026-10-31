import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BrandPage from "@/components/brand/BrandPage";
import { resolveBrandPage } from "@/lib/brands/resolve";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Android Guides, Help & Settings",
  description: "Step-by-step guides for Android. Interactive live simulator included.",
};

export default async function Page() {
  const brand = await resolveBrandPage("android");
  if (!brand) notFound();
  return <BrandPage brand={brand} />;
}
