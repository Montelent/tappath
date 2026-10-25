import type { Metadata } from "next";
import ContentManager from "@/components/admin/ContentManager";

export const metadata: Metadata = {
  title: "Admin · Brands",
  robots: { index: false, follow: false },
};

export default function AdminBrandsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <ContentManager
        table="brands"
        title="Brands"
        columns={[
          { key: "name", label: "Name" },
          { key: "slug", label: "Slug" },
          { key: "guides_count", label: "Guides" },
          { key: "published", label: "Published" },
        ]}
        emptyRow={{
          slug: "",
          name: "",
          color: "bg-blue-500",
          description: "",
          guides_count: 0,
          devices_count: 0,
          product_lines: [],
          top_guides: [],
          devices_list: [],
          seo_updates: "",
          seo_help: "",
          published: true,
          sort_order: 0,
        }}
        fields={[
          { key: "name", label: "Name" },
          { key: "slug", label: "Slug" },
          { key: "color", label: "Color class" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "guides_count", label: "Guides count", type: "number" },
          { key: "devices_count", label: "Devices count", type: "number" },
          { key: "sort_order", label: "Sort order", type: "number" },
          { key: "published", label: "Published", type: "boolean" },
          { key: "product_lines", label: "Product lines (JSON)", type: "json" },
          { key: "top_guides", label: "Top guides (JSON)", type: "json" },
          { key: "seo_updates", label: "SEO updates", type: "textarea" },
          { key: "seo_help", label: "SEO help", type: "textarea" },
        ]}
      />
    </div>
  );
}
