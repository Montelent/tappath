import type { Metadata } from "next";
import ContentManager from "@/components/admin/ContentManager";

export const metadata: Metadata = {
  title: "Admin · Topics",
  robots: { index: false, follow: false },
};

export default function AdminTopicsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <ContentManager
        table="topics"
        title="Topics"
        columns={[
          { key: "name", label: "Name" },
          { key: "slug", label: "Slug" },
          { key: "guide_count", label: "Guides" },
          { key: "published", label: "Published" },
        ]}
        emptyRow={{
          slug: "",
          name: "",
          description: "",
          icon: "Wifi",
          guide_count: 0,
          brands: [],
          published: true,
          sort_order: 0,
        }}
        fields={[
          { key: "name", label: "Name" },
          { key: "slug", label: "Slug" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "icon", label: "Icon (Lucide name)" },
          { key: "guide_count", label: "Guide count", type: "number" },
          { key: "sort_order", label: "Sort order", type: "number" },
          { key: "published", label: "Published", type: "boolean" },
          { key: "brands", label: "Brand slugs (JSON array)", type: "json" },
        ]}
      />
    </div>
  );
}
