import type { Guide } from "@/data/guides";
import { getSiteSettings } from "@/lib/site-settings";
import JsonLd, { siteBase } from "@/components/seo/JsonLd";

type Props = {
  guide: Guide;
  url: string;
};

function toIsoDate(raw: string): string {
  if (!raw) return new Date().toISOString().slice(0, 10);
  const m = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return raw;
}

/** Google HowTo + BreadcrumbList + FAQ + TechArticle with author (E-E-A-T). */
export default async function HowToJsonLd({ guide, url }: Props) {
  const primary = guide.versions[0];
  if (!primary) return null;

  const s = await getSiteSettings();
  const base = siteBase();
  const modified = toIsoDate(guide.updated);

  const steps = primary.steps.map((step, i) => {
    const name = step.instruction.replace(/\*\*/g, "");
    const text = (step.detail ?? step.instruction).replace(/\*\*/g, "");
    const item: Record<string, unknown> = {
      "@type": "HowToStep",
      position: i + 1,
      name,
      text,
      url: `${url}#step-${i + 1}`,
    };
    if (step.imageUrl) {
      item.image = step.imageUrl.startsWith("http")
        ? step.imageUrl
        : `${base}${step.imageUrl}`;
    }
    return item;
  });

  const authorName = (s.author_name || s.site_name || "TapPath").trim();
  const sameAs = (s.author_same_as || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  const author: Record<string, unknown> = {
    "@type": "Person",
    name: authorName,
    ...(s.author_title ? { jobTitle: s.author_title } : {}),
    ...(s.author_bio ? { description: s.author_bio } : {}),
    ...(s.author_avatar_url
      ? {
          image: s.author_avatar_url.startsWith("http")
            ? s.author_avatar_url
            : `${base}${s.author_avatar_url}`,
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };

  const publisher = {
    "@type": "Organization",
    name: s.site_name || "TapPath",
    url: base,
    ...(s.logo_url
      ? {
          logo: {
            "@type": "ImageObject",
            url: s.logo_url.startsWith("http") ? s.logo_url : `${base}${s.logo_url}`,
          },
        }
      : {}),
  };

  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `${guide.brand}: ${guide.title}`,
    description: (guide.shortDescription || "").replace(/<[^>]+>/g, "").slice(0, 300),
    totalTime: `PT${Math.max(1, parseInt(guide.readTime, 10) || 2)}M`,
    step: steps,
    tool: { "@type": "HowToTool", name: `${guide.brand} smartphone` },
    url,
    dateModified: modified,
    datePublished: modified,
    inLanguage: s.default_locale || "en",
    author,
    publisher,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      {
        "@type": "ListItem",
        position: 2,
        name: guide.brand,
        item: `${base}/${guide.brandSlug}`,
      },
      { "@type": "ListItem", position: 3, name: guide.title, item: url },
    ],
  };

  const faq =
    guide.faqs && guide.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: guide.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  const article = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${guide.brand}: ${guide.title}`,
    description: howTo.description,
    dateModified: modified,
    datePublished: modified,
    author,
    publisher,
    mainEntityOfPage: url,
    about: { "@type": "Thing", name: guide.brand },
  };

  return (
    <>
      <JsonLd data={howTo} />
      <JsonLd data={breadcrumb} />
      <JsonLd data={article} />
      {faq && <JsonLd data={faq} />}
    </>
  );
}
