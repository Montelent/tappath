import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TermPage from "@/components/glossary/TermPage";
import DefinedTermJsonLd from "@/components/seo/DefinedTermJsonLd";
import { getTerm, glossaryTerms } from "@/data/glossary";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return glossaryTerms.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const term = getTerm(slug);
  if (!term) return { title: "Term not found" };
  return {
    title: `${term.term} — Glossary`,
    description: term.short,
  };
}

export default async function GlossaryTermPage({ params }: Props) {
  const { slug } = await params;
  const term = getTerm(slug);
  if (!term) notFound();
  return (
    <>
      <DefinedTermJsonLd
        term={term.term}
        slug={term.slug}
        short={term.short}
        definition={term.definition}
        category={term.category}
      />
      <TermPage term={term} />
    </>
  );
}
