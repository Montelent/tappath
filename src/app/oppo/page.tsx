import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BrandPage from "@/components/brand/BrandPage";
import { resolveBrandPage } from "@/lib/brands/resolve";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Oppo Guides, Help & Settings",
  description: "Step-by-step guides for Oppo. Interactive live simulator included.",
};

export default async function Page() {
  const brand = await resolveBrandPage("oppo");
  if (!brand) notFound();
  return <BrandPage brand={brand} />;
}
