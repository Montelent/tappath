import JsonLd, { siteBase } from "@/components/seo/JsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

type Props = {
  term: string;
  slug: string;
  short: string;
  definition: string;
  category?: string;
};

export default function DefinedTermJsonLd({
  term,
  slug,
  short,
  definition,
  category,
}: Props) {
  const base = siteBase();
  const url = `${base}/glossary/${slug}`;

  const data = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: term,
    description: definition || short,
    termCode: slug,
    url,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: category ? `TapPath Glossary · ${category}` : "TapPath Tech Glossary",
      url: `${base}/glossary`,
    },
  };

  const page = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${term} — Glossary`,
    description: short || definition,
    url,
    mainEntity: data,
  };

  return (
    <>
      <JsonLd data={data} />
      <JsonLd data={page} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Glossary", path: "/glossary" },
          { name: term, path: `/glossary/${slug}` },
        ]}
      />
    </>
  );
}
