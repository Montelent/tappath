import JsonLd, { siteBase } from "@/components/seo/JsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

type GuideItem = { title: string; href: string };

type Props = {
  name: string;
  slug: string;
  description: string;
  guides?: GuideItem[];
};

export default function BrandJsonLd({ name, slug, description, guides = [] }: Props) {
  const base = siteBase();
  const url = `${base}/${slug}`;

  const brand = {
    "@context": "https://schema.org",
    "@type": "Brand",
    name,
    description,
    url,
  };

  const page = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${name} guides & settings`,
    description,
    url,
    about: {
      "@type": "Brand",
      name,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: guides.length,
      itemListElement: guides.slice(0, 50).map((g, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: g.title,
        url: g.href.startsWith("http") ? g.href : `${base}${g.href}`,
      })),
    },
  };

  return (
    <>
      <JsonLd data={brand} />
      <JsonLd data={page} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name, path: `/${slug}` },
        ]}
      />
    </>
  );
}
