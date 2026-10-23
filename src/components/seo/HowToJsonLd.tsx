import type { Guide } from "@/data/guides";

type Props = {
  guide: Guide;
  url: string;
};

/**
 * Google HowTo structured data for rich results.
 * https://developers.google.com/search/docs/appearance/structured-data/how-to
 */
export default function HowToJsonLd({ guide, url }: Props) {
  const primary = guide.versions[0];
  if (!primary) return null;

  const steps = primary.steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.instruction.replace(/\*\*/g, ""),
    text: s.detail ?? s.instruction.replace(/\*\*/g, ""),
  }));

  const data = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `${guide.brand}: ${guide.title}`,
    description: guide.shortDescription,
    totalTime: `PT${Math.max(1, parseInt(guide.readTime, 10) || 2)}M`,
    step: steps,
    tool: {
      "@type": "HowToTool",
      name: `${guide.brand} smartphone`,
    },
    url,
    dateModified: guide.updated.split(".").reverse().join("-"),
    inLanguage: "en",
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: process.env.NEXT_PUBLIC_SITE_URL ?? "https://tappath.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: guide.brand,
        item: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://tappath.com"}/${guide.brandSlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: guide.title,
        item: url,
      },
    ],
  };

  const faq =
    guide.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: guide.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.a,
            },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      {faq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
        />
      )}
    </>
  );
}
