export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TopicHub from "@/components/topics/TopicHub";
import { resolveTopic } from "@/lib/topics/resolve";
export async function generateMetadata(): Promise<Metadata> {
  const topic = await resolveTopic("messaging");
  if (!topic) return { title: "Topic not found" };
  return { title: `${topic.name}: Guides, tips & solutions`, description: topic.description };
}
export default async function Page() {
  const topic = await resolveTopic("messaging");
  if (!topic) notFound();
  return <TopicHub topic={topic} />;
}
