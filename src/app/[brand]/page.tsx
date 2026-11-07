import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BrandPage from "@/components/brand/BrandPage";
import { resolveBrandPage } from "@/lib/brands/resolve";
import { getSiteSettings } from "@/lib/site-settings";
import { applySeoTemplate } from "@/lib/seo/templates";

type Props = { params: Promise<{ brand: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand: slug } = await params;
  const [brand, settings] = await Promise.all([
    resolveBrandPage(slug),
    getSiteSettings(),
  ]);
  if (!brand) return { title: "Brand not found", robots: { index: false, follow: true } };

  const vars = {
    brand: brand.name,
    sitename: settings.site_name,
    sep: settings.seo_title_separator || "·",
    excerpt: brand.description,
    description: brand.description,
  };
  const title = applySeoTemplate(
    settings.seo_tpl_brand_title,
    vars,
    `${brand.name} guides, help & settings`
  );
  const description = applySeoTemplate(
    settings.seo_tpl_brand_description,
    vars,
    brand.description
  );

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/${brand.slug}` },
    robots: { index: settings.seo_robots_index !== false, follow: settings.seo_robots_follow !== false },
  };
}

export default async function DynamicBrandPage({ params }: Props) {
  const { brand: slug } = await params;
  const brand = await resolveBrandPage(slug);
  if (!brand) notFound();
  return <BrandPage brand={brand} />;
}
