export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import GlossaryIndex from "@/components/glossary/GlossaryIndex";
import CollectionJsonLd from "@/components/seo/CollectionJsonLd";
import { listGlossary, isDatabaseConfigured } from "@/lib/db/content";
import { glossaryTerms } from "@/data/glossary";
import type { GlossaryTerm } from "@/data/glossary";

export const metadata: Metadata = {
  title: "Tech glossary: smartphone & technology terms explained",
  description:
    "Smartphone and technology terms explained simply — Network, System, Battery, Security, Display, Camera, Messaging and more.",
  alternates: { canonical: "/glossary" },
};

export default async function GlossaryPage() {
  let terms: GlossaryTerm[] = process.env.NODE_ENV === "production" ? [] : glossaryTerms;

  if (isDatabaseConfigured()) {
    try {
      const rows = await listGlossary();
      terms = rows.map((r) => ({
          slug: r.slug,
          term: r.term,
          category: r.category || "General",
          short: r.short || "",
          definition: r.definition || "",
        }));
    } catch {
      terms = [];
    }
  }

  const items = terms.map((term) => ({
    name: term.term,
    url: `/glossary/${term.slug}`,
    description: term.short,
  }));

  return (
    <>
      <CollectionJsonLd
        name="Tech glossary"
        description="Smartphone and technology terms explained simply."
        path="/glossary"
        items={items}
      />
      <GlossaryIndex terms={terms} />
    </>
  );
}
