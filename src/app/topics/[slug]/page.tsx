export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TopicHub from "@/components/topics/TopicHub";
import { resolveTopic } from "@/lib/topics/resolve";
import TopicJsonLd from "@/components/seo/TopicJsonLd";
import { listTopicsForIndex } from "@/lib/topics/resolve";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = await resolveTopic(slug);
  if (!topic) return { title: "Topic not found" };
  const { getSiteSettings } = await import("@/lib/site-settings");
  const { applySeoTemplate } = await import("@/lib/seo/templates");
  const s = await getSiteSettings();
  const vars = {
    title: topic.name,
    sitename: s.site_name,
    sep: s.seo_title_separator || "·",
    excerpt: topic.description || "",
    description: topic.description || "",
    category: topic.name,
  };
  const title = applySeoTemplate(
    s.seo_tpl_topic_title,
    vars,
    `${topic.name}: Guides & tips`
  );
  const description = applySeoTemplate(
    s.seo_tpl_topic_description,
    vars,
    topic.description || `Settings guides for ${topic.name}.`
  );
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/topics/${slug}` },
    robots: {
      index: s.seo_robots_index !== false,
      follow: s.seo_robots_follow !== false,
    },
  };
}

export default async function TopicSlugPage({ params }: Props) {
  const { slug } = await params;
  const topic = await resolveTopic(slug);
  if (!topic) notFound();
  const allTopics = await listTopicsForIndex();
  const otherTopics = allTopics.map(({ name, slug }) => ({ name, slug }));
  const guides = topic.guidesByBrand.flatMap((b) =>
    b.guides.map((g) => ({
      title: g.title,
      href: g.href,
    }))
  );

  return (
    <>
      <TopicJsonLd
        name={topic.name}
        slug={topic.slug}
        description={topic.description || `Settings guides for ${topic.name}.`}
        guides={guides}
      />
      <TopicHub topic={topic} otherTopics={otherTopics} />
    </>
  );
}
