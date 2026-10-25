import type { Metadata } from "next";
import ContentManager from "@/components/admin/ContentManager";

export const metadata: Metadata = {
  title: "Admin · Devices",
  robots: { index: false, follow: false },
};

export default function AdminDevicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <ContentManager
        table="devices"
        title="Devices"
        columns={[
          { key: "name", label: "Name" },
          { key: "brand_name", label: "Brand" },
          { key: "os", label: "OS" },
          { key: "slug", label: "Slug" },
        ]}
        emptyRow={{
          slug: "",
          name: "",
          brand_slug: "samsung",
          brand_name: "Samsung",
          os: "",
          href: "",
          year: null,
          guides: [],
          published: true,
        }}
        fields={[
          { key: "name", label: "Name" },
          { key: "slug", label: "Slug" },
          { key: "brand_name", label: "Brand name" },
          { key: "brand_slug", label: "Brand slug" },
          { key: "os", label: "OS" },
          { key: "href", label: "Href" },
          { key: "year", label: "Year", type: "number" },
          { key: "published", label: "Published", type: "boolean" },
          { key: "guides", label: "Guides (JSON)", type: "json" },
        ]}
      />
    </div>
  );
}
