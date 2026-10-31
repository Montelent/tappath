import JsonLd, { siteBase } from "@/components/seo/JsonLd";
import BreadcrumbJsonLd, { type Crumb } from "@/components/seo/BreadcrumbJsonLd";

export type CollectionItem = {
  name: string;
  url: string;
  description?: string;
};

type Props = {
  name: string;
  description: string;
  path: string;
  items: CollectionItem[];
  breadcrumbs?: Crumb[];
  pageType?: "CollectionPage" | "SearchResultsPage" | "WebPage";
};

export default function CollectionJsonLd({
  name,
  description,
  path,
  items,
  breadcrumbs,
  pageType = "CollectionPage",
}: Props) {
  const base = siteBase();
  const url = `${base}${path}`;

  const collection = {
    "@context": "https://schema.org",
    "@type": pageType,
    name,
    description,
    url,
    isPartOf: {
      "@type": "WebSite",
      name: "TapPath",
      url: base,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.slice(0, 100).map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        url: item.url.startsWith("http") ? item.url : `${base}${item.url}`,
        ...(item.description ? { description: item.description } : {}),
      })),
    },
  };

  const crumbs: Crumb[] = breadcrumbs ?? [
    { name: "Home", path: "/" },
    { name, path },
  ];

  return (
    <>
      <JsonLd data={collection} />
      <BreadcrumbJsonLd items={crumbs} />
    </>
  );
}
