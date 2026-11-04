import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedPage } from "@/lib/db/pages";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedPage(slug);
  if (!page) return { title: "Page not found" };
  return {
    title: page.seo_title || page.title,
    description: page.seo_description || page.excerpt || undefined,
    robots: { index: true, follow: true },
  };
}

export default async function PublicPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPublishedPage(slug);
  if (!page) notFound();

  return (
    <main className="mx-auto min-h-[60vh] w-full max-w-4xl px-4 py-12 sm:px-6">
      <article>
        <h1 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">{page.title}</h1>
        {page.excerpt ? <p className="mb-8 text-lg text-muted-foreground">{page.excerpt}</p> : null}
        <div className="prose prose-lg max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: page.content }} />
      </article>
    </main>
  );
}
