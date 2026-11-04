import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveBrandPage } from "@/lib/brands/resolve";
import { listGuides } from "@/lib/db/content";
import { guideHref } from "@/lib/guides/resolve";
import { resolveDevice } from "@/lib/devices/resolve";
import DevicePage from "@/components/devices/DevicePage";

type Params = { brand: string; line: string };

function lineSlug(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { brand: brandSlug, line } = await params;
  const device = await resolveDevice(line);
  if (device && device.brandSlug === brandSlug.toLowerCase()) {
    return {
      title: `${device.name} Settings, Guides & Help`,
      description: device.description,
      alternates: { canonical: `/${brandSlug}/${line}` },
    };
  }
  const brand = await resolveBrandPage(brandSlug);
  if (!brand) return { title: "Product line not found" };
  const guides = await listGuides();
  const matching = guides.filter((g) => g.brand_slug === brandSlug.toLowerCase() && lineSlug(g.product_line || "") === lineSlug(line));
  const label = matching[0]?.product_line || brand.productLines.find((p) => lineSlug(p.name) === lineSlug(line))?.name || line.replace(/-/g, " ");
  return {
    title: `${brand.name} ${label} Guides & Help`,
    description: `Browse step-by-step ${brand.name} ${label} guides, settings instructions and troubleshooting help.`,
    alternates: { canonical: `/${brandSlug}/${line}` },
  };
}

export default async function ProductLinePage({ params }: { params: Promise<Params> }) {
  const { brand: brandSlug, line } = await params;
  // Device URLs share this route segment with product-line landing pages.
  // Resolve devices exclusively from published database rows; unknown slugs stay 404.
  const device = await resolveDevice(line);
  if (device && device.brandSlug === brandSlug.toLowerCase()) {
    return <DevicePage device={device} />;
  }

  const brand = await resolveBrandPage(brandSlug);
  if (!brand) notFound();

  const allGuides = await listGuides();
  const guides = allGuides
    .filter((g) => g.brand_slug === brandSlug.toLowerCase() && lineSlug(g.product_line || "") === lineSlug(line))
    .sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));

  const lineName = guides[0]?.product_line ||
    brand.productLines.find((p) => lineSlug(p.name) === lineSlug(line))?.name ||
    line.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  if (!guides.length && !brand.productLines.some((p) => lineSlug(p.name) === lineSlug(line))) notFound();

  return (
    <div className="page-pad">
      <div className="max-wide section-y">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]" aria-label="Breadcrumb">
          <Link href="/" className="link-quiet">Home</Link><span aria-hidden>/</span>
          <Link href={`/${brand.slug}`} className="link-quiet">{brand.name}</Link><span aria-hidden>/</span>
          <span className="text-[var(--foreground)]">{lineName}</span>
        </nav>
        <header className="mb-8 max-w-3xl">
          <p className="label-caps mb-2">{brand.name} guides</p>
          <h1 className="font-display text-3xl sm:text-4xl">{brand.name} {lineName} Guides</h1>
          <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed">
            Browse step-by-step settings guides and troubleshooting instructions for {brand.name} {lineName} devices.
          </p>
          <p className="mt-3 font-path text-sm text-[var(--muted-foreground)]">{guides.length} {guides.length === 1 ? "guide" : "guides"}</p>
        </header>
        {guides.length ? (
          <ul className="grid-guides list-none">
            {guides.map((guide) => (
              <li key={String(guide.id || guide.slug)}>
                <Link href={guideHref(guide)} className="surface-card block h-full p-4 link-quiet">
                  <span className="block font-medium break-words">{guide.title}</span>
                  <span className="label-caps mt-2 block">{guide.category || "General"}</span>
                  {guide.short_description && <span className="mt-2 block text-sm leading-relaxed text-[var(--muted-foreground)]">{guide.short_description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180)}</span>}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed border-[var(--border)] p-6 text-sm text-[var(--muted-foreground)]">No published guides are available in this product line yet.</p>
        )}
      </div>
    </div>
  );
}
