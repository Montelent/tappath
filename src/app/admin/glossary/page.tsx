import type { Metadata } from "next";
import ContentManager from "@/components/admin/ContentManager";

export const metadata: Metadata = {
  title: "Admin · Glossary",
  robots: { index: false, follow: false },
};

export default function AdminGlossaryPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
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
          category: "General",
          short: "",
          definition: "",
          related_guides: [],
          published: true,
        }}
        fields={[
          { key: "term", label: "Term" },
          { key: "slug", label: "Slug" },
          { key: "category", label: "Category" },
          { key: "short", label: "Short", type: "textarea" },
          { key: "definition", label: "Definition", type: "textarea" },
          { key: "published", label: "Published", type: "boolean" },
          { key: "related_guides", label: "Related guides (JSON)", type: "json" },
        ]}
      />
    </div>
  );
}
