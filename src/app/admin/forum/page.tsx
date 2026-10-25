import type { Metadata } from "next";
import ContentManager from "@/components/admin/ContentManager";

export const metadata: Metadata = {
  title: "Admin · Forum",
  robots: { index: false, follow: false },
};

export default function AdminForumPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <ContentManager
        table="forum_topics"
        title="Forum topics"
        columns={[
          { key: "title", label: "Title" },
          { key: "brand", label: "Brand" },
          { key: "solved", label: "Solved" },
          { key: "views", label: "Views" },
        ]}
        emptyRow={{
          title: "",
          brand: "General",
          brand_slug: "general",
          category: "General",
          author_name: "Admin",
          excerpt: "",
          body: "",
          solved: false,
          views: 0,
        }}
        fields={[
          { key: "title", label: "Title" },
          { key: "brand", label: "Brand" },
          { key: "brand_slug", label: "Brand slug" },
          { key: "category", label: "Category" },
          { key: "author_name", label: "Author" },
          { key: "excerpt", label: "Excerpt", type: "textarea" },
          { key: "body", label: "Body", type: "textarea" },
          { key: "solved", label: "Solved", type: "boolean" },
          { key: "views", label: "Views", type: "number" },
        ]}
      />
    </div>
  );
}
