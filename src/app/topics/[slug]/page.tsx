export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TopicHub from "@/components/topics/TopicHub";
import { resolveTopic } from "@/lib/topics/resolve";
import TopicJsonLd from "@/components/seo/TopicJsonLd";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = await resolveTopic(slug);
  if (!topic) return { title: "Topic not found" };
  return {
    title: `${topic.name}: Guides & tips`,
    description: topic.description || `Settings guides for ${topic.name}.`,
  };
}

export default async function TopicSlugPage({ params }: Props) {
  const { slug } = await params;
  const topic = await resolveTopic(slug);
  if (!topic) notFound();
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
      <TopicHub topic={topic} />
    </>
  );
}
