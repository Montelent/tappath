import JsonLd, { originFromPageUrl, siteBase } from "@/components/seo/JsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

type Faq = { q: string; a: string };

type Props = {
  term: string;
  slug: string;
  short: string;
  definition: string;
  category?: string;
  faqs?: Faq[];
};

function strip(html: string): string {
  return (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** DefinedTerm + WebPage + FAQPage + BreadcrumbList for glossary entries. */
export default function DefinedTermJsonLd({
  term,
  slug,
  short,
  definition,
  category,
  faqs,
}: Props) {
  const base = siteBase();
  const url = `${base}/glossary/${slug}`;
  const origin = originFromPageUrl(url) || base;
  const pageUrl = `${origin}/glossary/${slug}`;
  const desc = strip(definition || short).slice(0, 300);

  const definedTerm = {
    "@type": "DefinedTerm",
    name: term,
    description: desc || short,
    termCode: slug,
    url: pageUrl,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: category ? `TapPath Glossary · ${category}` : "TapPath Tech Glossary",
      url: `${origin}/glossary`,
    },
  };

  const webPage = {
    "@type": "WebPage",
    name: `${term}: Definition & explanation`,
    description: short || desc,
    url: pageUrl,
    mainEntity: definedTerm,
    inLanguage: "en",
  };

  const graph: Record<string, unknown>[] = [definedTerm, webPage];

  const faqEntities = (faqs || [])
    .filter((f) => (f.q || "").trim())
    .map((f) => ({
      "@type": "Question",
      name: strip(f.q),
      acceptedAnswer: {
        "@type": "Answer",
        text: strip(f.a) || strip(f.q),
      },
    }));

  if (faqEntities.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faqEntities,
    });
  }

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": graph,
        }}
      />
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
