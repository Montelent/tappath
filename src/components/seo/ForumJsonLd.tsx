import JsonLd, { siteBase } from "@/components/seo/JsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

type Category = { name: string; slug: string; description?: string };

type Props = {
  categories?: Category[];
};

export default function ForumJsonLd({ categories = [] }: Props) {
  const base = siteBase();
  const url = `${base}/forum`;

  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Community Forum",
    description:
      "Discuss smartphone settings, report paths, and help others — organized by brand.",
    url,
    about: {
      "@type": "Thing",
      name: "Smartphone settings community",
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: categories.length,
      itemListElement: categories.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        url:
          c.slug === "general" || c.slug === "guides"
            ? url
            : `${base}/forum/${c.slug}`,
        ...(c.description ? { description: c.description } : {}),
      })),
    },
  };

  return (
    <>
      <JsonLd data={data} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Forum", path: "/forum" },
        ]}
      />
    </>
  );
}
