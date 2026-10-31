import JsonLd, { siteBase } from "@/components/seo/JsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

type GuideItem = { title: string; href: string };

type Props = {
  name: string;
  slug: string;
  description: string;
  guides?: GuideItem[];
};

export default function TopicJsonLd({ name, slug, description, guides = [] }: Props) {
  const base = siteBase();
  const url = `${base}/topics/${slug}`;

  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${name}: Guides & tips`,
    description,
    url,
    about: {
      "@type": "Thing",
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
      <JsonLd data={data} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Topics", path: "/topics" },
          { name, path: `/topics/${slug}` },
        ]}
      />
    </>
  );
}
