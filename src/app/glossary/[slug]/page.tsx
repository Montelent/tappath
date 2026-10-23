import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TermPage from "@/components/glossary/TermPage";
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
  return <TermPage term={term} />;
}
