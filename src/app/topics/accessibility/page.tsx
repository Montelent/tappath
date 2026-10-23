import type { Metadata } from "next";
import TopicHub from "@/components/topics/TopicHub";
import { getTopic } from "@/data/topics";

const topic = getTopic("accessibility")!;

export const metadata: Metadata = {
  title: `${topic.name}: Guides, tips & solutions`,
  description: topic.description,
};

export default function AccessibilityTopicPage() {
  return <TopicHub topic={topic} />;
}
