import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedPage } from "@/lib/db/pages";
import { getSiteSettings } from "@/lib/site-settings";
import { applySeoTemplate } from "@/lib/seo/templates";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [page, settings] = await Promise.all([getPublishedPage(slug), getSiteSettings()]);
  if (!page) return { title: "Page not found" };
  const plainExcerpt = (page.excerpt || "").replace(/<[^>]+>/g, " ").replace(/\\s+/g, " ").trim();
  const title = page.seo_title || applySeoTemplate(
    settings.seo_tpl_page_title,
    { title: page.title, sitename: settings.site_name, sep: settings.seo_title_separator, excerpt: plainExcerpt },
    page.title
  );
  const description = page.seo_description || applySeoTemplate(
    settings.seo_tpl_page_description,
    { title: page.title, sitename: settings.site_name, sep: settings.seo_title_separator, excerpt: plainExcerpt },
    plainExcerpt
  );
  const canonical = page.canonical_url || `/pages/${page.slug}`;
  const ogTitle = page.og_title || title;
  const ogDescription = page.og_description || description;
  return {
    title,
    description: description || undefined,
    alternates: { canonical },
    robots: { index: page.robots_index !== false, follow: page.robots_follow !== false },
    openGraph: { type: "article", title: ogTitle, description: ogDescription, url: canonical, images: page.og_image ? [page.og_image] : undefined },
    twitter: { card: "summary_large_image", title: ogTitle, description: ogDescription, images: page.og_image ? [page.og_image] : undefined },
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
