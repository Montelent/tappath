import JsonLd, { siteBase } from "@/components/seo/JsonLd";

export type Crumb = { name: string; path?: string };

/** BreadcrumbList schema for any page hierarchy. */
export default function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  const base = siteBase();
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.path
        ? { item: item.path.startsWith("http") ? item.path : `${base}${item.path}` }
        : {}),
    })),
  };
  return <JsonLd data={data} />;
}
