import type { Metadata } from "next";
import ContentManager from "@/components/admin/ContentManager";

export const metadata: Metadata = {
  title: "Admin · Glossary",
  robots: { index: false, follow: false },
};

export default function AdminGlossaryPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--accent-subtle)] p-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
        <p className="font-medium text-[var(--foreground)]">How glossary pages work</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Short summary</strong> shows in the “In a nutshell” box (like TechBone).
          </li>
          <li>
            <strong>Definition</strong> is the full article — use headings (How it works, Advantages…) in the editor.
          </li>
          <li>
            <strong>FAQs</strong> appear as an accordion and as FAQ schema for Google.
          </li>
          <li>
            <strong>Related guides</strong> are optional. The site also auto-finds guides that mention this term.
          </li>
        </ul>
      </div>
      <ContentManager
        table="glossary_terms"
        title="Glossary"
        columns={[
          { key: "term", label: "Term" },
          { key: "category", label: "Category" },
          { key: "slug", label: "Slug" },
        ]}
        emptyRow={{
          slug: "",
          term: "",
          category: "Network",
          short: "",
          definition: "",
          faqs: [],
          related_guides: [],
          seo_title: "",
          seo_description: "",
          published: true,
        }}
        fields={[
          { key: "term", label: "Term name (e.g. NFC)" },
          { key: "slug", label: "URL slug (e.g. nfc)" },
          {
            key: "category",
            label: "Category (Network, Security, Display…)",
          },
          {
            key: "short",
            label: "In a nutshell (1–2 sentences)",
            type: "textarea",
          },
          {
            key: "definition",
            label: "Full definition (rich text — add H2/H3 sections)",
            type: "richtext",
          },
          {
            key: "faqs",
            label: 'FAQs as JSON: [{"q":"…","a":"…"}]',
            type: "json",
          },
          {
            key: "related_guides",
            label:
              'Pinned related guides JSON (optional): [{"title":"…","href":"/…","brand":"Samsung"}]',
            type: "json",
          },
          {
            key: "seo_title",
            label: "SEO title (optional — defaults to “What is TERM? …”)",
          },
          {
            key: "seo_description",
            label: "SEO meta description (optional)",
            type: "textarea",
          },
          { key: "published", label: "Published", type: "boolean" },
        ]}
      />
    </div>
  );
}
