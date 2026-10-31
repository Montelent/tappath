import type { Metadata } from "next";
import GlossaryIndex from "@/components/glossary/GlossaryIndex";
import CollectionJsonLd from "@/components/seo/CollectionJsonLd";
import { glossaryTerms } from "@/data/glossary";

export const metadata: Metadata = {
  title: "Tech glossary: smartphone & technology terms explained",
  description:
    "Smartphone and technology terms explained simply — Network, System, Battery, Security, Display, Camera, Messaging and more.",
};

export default function GlossaryPage() {
  const items = glossaryTerms.map((term) => ({
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
      <GlossaryIndex />
    </>
  );
}
