import type { Topic } from "@/data/topics";
import { getTopic as getStaticTopic } from "@/data/topics";
import {
  listTopics,
  listGuides,
  isDatabaseConfigured,
} from "@/lib/db/content";
import { isNeonConfigured } from "@/lib/db/neon";
import { guideHref } from "@/lib/guides/resolve";
import type { DbTopic, DbGuide } from "@/lib/db/types";

function categoryMatches(guideCategory: string, topicName: string, topicSlug: string): boolean {
  const c = (guideCategory || "").toLowerCase();
  const n = (topicName || "").toLowerCase();
  const s = (topicSlug || "").toLowerCase().replace(/-/g, " ");
  if (!c) return false;
  return (
    c === n ||
    c.includes(n) ||
    n.includes(c) ||
    c.includes(s) ||
    s.includes(c) ||
    c.replace(/&/g, "and") === n.replace(/&/g, "and")
  );
}

function dbTopicToTopic(t: DbTopic, guides: DbGuide[]): Topic {
  const matched = guides.filter((g) =>
    categoryMatches(g.category || "", t.name, t.slug)
  );

  const byBrand = new Map<
    string,
    { brand: string; brandSlug: string; guides: Topic["guidesByBrand"][0]["guides"] }
  >();

  for (const g of matched) {
    const key = g.brand_slug || "other";
    if (!byBrand.has(key)) {
      byBrand.set(key, {
        brand: g.brand || key,
        brandSlug: key,
        guides: [],
      });
    }
    byBrand.get(key)!.guides.push({
      title: g.title,
      brand: g.brand,
      brandSlug: g.brand_slug,
      href: guideHref(g),
      readTime: g.read_time,
    });
  }

  return {
    slug: t.slug,
    name: t.name,
    description: t.description || "",
    icon: t.icon || "Settings",
    guideCount: matched.length,
    faqs: [],
    guidesByBrand: Array.from(byBrand.values()),
  };
}

export async function resolveTopic(slug: string): Promise<Topic | null> {
  const key = slug.toLowerCase();

  if (isDatabaseConfigured()) {
    try {
      const topics = await listTopics();
      const hit = topics.find((t) => t.slug === key);
      if (!hit) return null;
      const guides = await listGuides();
      const topic = dbTopicToTopic(hit, guides);
      return topic.guideCount > 0 ? topic : null;
    } catch (e) {
      console.error("[resolveTopic]", e);
      return null;
    }
  }

  if (isNeonConfigured()) return null;
  return getStaticTopic(key) ?? null;
}

export async function listTopicsForIndex(): Promise<
  { slug: string; name: string; description: string; icon: string; guideCount: number }[]
> {
  if (isDatabaseConfigured()) {
    const topics = await listTopics();
    const guides = await listGuides();
    return topics.map((t) => ({
      slug: t.slug,
      name: t.name,
      description: t.description || "",
      icon: t.icon || "Settings",
      guideCount: guides.filter((g) => categoryMatches(g.category || "", t.name, t.slug)).length,
    })).filter((t) => t.guideCount > 0);
  }
  if (isNeonConfigured()) return [];
  const { topics } = await import("@/data/topics");
  return topics.map((t) => ({
    slug: t.slug,
    name: t.name,
    description: t.description,
    icon: t.icon,
    guideCount: t.guideCount,
  }));
}
