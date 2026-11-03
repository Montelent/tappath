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
          focus_keyword: "",
          canonical_url: "",
          robots_index: true,
          robots_follow: true,
          og_title: "",
          og_description: "",
          og_image: "",
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
            label: "FAQs (optional — good for Google FAQ rich results)",
            type: "faq-list",
            help: "Add common questions about this term. Shown as an accordion on the page.",
          },
          {
            key: "related_guides",
            label: "Pinned related guides (optional)",
            type: "related-list",
            help: "Only if you want to force specific links. Otherwise the site auto-finds guides that mention this term.",
          },
          {
            key: "seo",
            label: "SEO",
            type: "seo-box",
            help: "Title, description, social preview, and robots for this term.",
          },
          { key: "published", label: "Published", type: "boolean" },
        ]}
      />
    </div>
  );
}
