import type { Metadata } from "next";
import ContentManager from "@/components/admin/ContentManager";

export const metadata: Metadata = {
  title: "Admin · Guides",
  robots: { index: false, follow: false },
};

export default function AdminGuidesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <ContentManager
        table="guides"
        title="Guides"
        columns={[
          { key: "title", label: "Title" },
          { key: "brand", label: "Brand" },
          { key: "category", label: "Category" },
          { key: "slug", label: "Slug" },
          { key: "published", label: "Published" },
        ]}
        emptyRow={{
          slug: "",
          brand: "Samsung",
          brand_slug: "samsung",
          product_line: "Galaxy",
          title: "",
          short_description: "",
          updated_label: "",
          read_time: "2 min",
          category: "General",
          versions: [],
          article: [],
          faqs: [],
          related: [],
          compatible_devices: [],
          confirmations: 0,
          forum_verified: false,
          published: true,
        }}
        fields={[
          { key: "title", label: "Title" },
          { key: "slug", label: "Slug" },
          { key: "brand", label: "Brand" },
          { key: "brand_slug", label: "Brand slug" },
          { key: "product_line", label: "Product line" },
          { key: "category", label: "Category" },
          { key: "short_description", label: "Short description", type: "textarea" },
          { key: "read_time", label: "Read time" },
          { key: "updated_label", label: "Updated label" },
          { key: "confirmations", label: "Confirmations", type: "number" },
          { key: "forum_verified", label: "Forum verified", type: "boolean" },
          { key: "published", label: "Published", type: "boolean" },
          { key: "versions", label: "Versions (JSON)", type: "json" },
          { key: "article", label: "Article paragraphs (JSON)", type: "json" },
          { key: "faqs", label: "FAQs (JSON)", type: "json" },
          { key: "related", label: "Related (JSON)", type: "json" },
          { key: "compatible_devices", label: "Compatible devices (JSON)", type: "json" },
        ]}
      />
    </div>
  );
}
