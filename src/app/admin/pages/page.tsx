import type { Metadata } from "next";
import ContentManager from "@/components/admin/ContentManager";

export const metadata: Metadata = {
  title: "Admin · Pages",
  robots: { index: false, follow: false },
};

export default function AdminPagesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--accent-subtle)] p-4 text-sm text-[var(--muted-foreground)]">
        Create standalone website pages such as About, Contact, Privacy Policy and Terms. Published pages are available at <strong>/pages/your-page-slug</strong>.
      </div>
      <ContentManager
        table="pages"
        title="Pages"
        columns={[
          { key: "title", label: "Page title" },
          { key: "slug", label: "URL slug" },
          { key: "published", label: "Status" },
        ]}
        emptyRow={{
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          published: false,
          seo_title: "",
          seo_description: "",
        }}
        fields={[
          { key: "title", label: "Page title" },
          { key: "slug", label: "URL slug (e.g. about-us)" , help: "Use lowercase letters, numbers and hyphens. The public URL will be /pages/your-slug." },
          { key: "excerpt", label: "Short description / excerpt", type: "textarea" },
          { key: "content", label: "Page content (TinyMCE editor)", type: "richtext" },
          { key: "published", label: "Publish this page", type: "boolean" },
          { key: "seo", label: "SEO", type: "seo-box" },
        ]}
      />
    </div>
  );
}
