import type { Guide } from "@/data/guides";
import { getSiteSettings } from "@/lib/site-settings";
import JsonLd, {
  absOnOrigin,
  originFromPageUrl,
  siteBase,
} from "@/components/seo/JsonLd";
import { authorProfilePath, authorSameAsUrls } from "@/lib/author";

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

function stripHtml(html: string): string {
  return (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default async function HowToJsonLd({ guide, url }: Props) {
  const primary = guide.versions[0];
  if (!primary || !primary.steps?.length) return null;

  const s = await getSiteSettings();
  const origin = originFromPageUrl(url) || siteBase();
  const modified = toIsoDate(guide.updated);

  const steps = primary.steps
    .map((step, i) => {
      const name = stripHtml((step.instruction || "").replace(/\*\*/g, ""));
      const text = stripHtml(
        (step.detail ?? step.instruction ?? "").replace(/\*\*/g, "")
      );
      if (!name && !text) return null;
      const item: Record<string, unknown> = {
        "@type": "HowToStep",
        position: i + 1,
        name: name || `Step ${i + 1}`,
        text: text || name || `Step ${i + 1}`,
        url: `${url}#step-${i + 1}`,
      };
      const img = absOnOrigin(step.imageUrl, origin);
      if (img) item.image = img;
      return item;
    })
    .filter(Boolean);

  if (!steps.length) return null;

  // Person.name must be plain text — never a URL (schema.org Text).
  let authorName = (s.author_name || s.site_name || "TapPath").trim();
  if (!authorName || /^https?:\/\//i.test(authorName)) {
    authorName = "TapPath Editorial";
  }
  const sameAs = authorSameAsUrls(s);
  const profileUrl = `${origin}${authorProfilePath(s)}`;

  const author: Record<string, unknown> = {
    "@type": "Person",
    "@id": profileUrl,
    name: authorName,
    url: profileUrl,
    ...(s.author_title ? { jobTitle: s.author_title } : {}),
    ...(s.author_bio
      ? { description: stripHtml(s.author_bio).slice(0, 300) }
      : {}),
    ...(s.author_avatar_url
      ? { image: absOnOrigin(s.author_avatar_url, origin) }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };

  const publisher: Record<string, unknown> = {
    "@type": "Organization",
    name: s.site_name || "TapPath",
    url: origin,
  };
  const logo = absOnOrigin(s.logo_url, origin);
  if (logo) {
    publisher.logo = { "@type": "ImageObject", url: logo };
  }

  const description = stripHtml(guide.shortDescription || "").slice(0, 300);
  const minutes = Math.max(1, parseInt(String(guide.readTime || "2"), 10) || 2);

  const howTo: Record<string, unknown> = {
    "@type": "HowTo",
    name: `${guide.brand}: ${guide.title}`,
    description,
    totalTime: `PT${minutes}M`,
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

  const breadcrumb: Record<string, unknown> = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: origin },
      {
        "@type": "ListItem",
        position: 2,
        name: guide.brand,
        item: `${origin}/${guide.brandSlug}`,
      },
      { "@type": "ListItem", position: 3, name: guide.title, item: url },
    ],
  };

  const article: Record<string, unknown> = {
    "@type": "TechArticle",
    headline: `${guide.brand}: ${guide.title}`,
    description,
    dateModified: modified,
    datePublished: modified,
    author,
    publisher,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    about: { "@type": "Thing", name: guide.brand },
  };

  const faqEntities =
    guide.faqs
      ?.filter((f) => (f.q || "").trim())
      .map((f) => ({
        "@type": "Question",
        name: stripHtml(f.q),
        acceptedAnswer: {
          "@type": "Answer",
          text: stripHtml(f.a) || stripHtml(f.q),
        },
      })) ?? [];

  const graph: Record<string, unknown>[] = [howTo, breadcrumb, article];
  if (faqEntities.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faqEntities,
    });
  }

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": graph,
      }}
    />
  );
}
