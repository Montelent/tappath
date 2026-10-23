/**
 * Content seed registry — single source for counts and admin overview.
 */

import { guides } from "@/data/guides";
import { topics } from "@/data/topics";
import { getAllDevices } from "@/data/devices";
import { glossaryTerms } from "@/data/glossary";

export type ContentStats = {
  guides: number;
  brands: number;
  topics: number;
  devices: number;
  glossaryTerms: number;
  lastSeeded: string;
};

export function getContentStats(): ContentStats {
  return {
    guides: Object.keys(guides).length,
    brands: 8,
    topics: topics.length,
    devices: getAllDevices().length,
    glossaryTerms: glossaryTerms.length,
    lastSeeded: new Date().toISOString().slice(0, 10),
  };
}

export type ContentItem = {
  type: "guide" | "device" | "glossary" | "topic";
  id: string;
  title: string;
  href: string;
  meta?: string;
};

export function listAllContent(): ContentItem[] {
  const items: ContentItem[] = [];

  for (const g of Object.values(guides)) {
    items.push({
      type: "guide",
      id: g.slug,
      title: `${g.brand}: ${g.title}`,
      href: `/${g.brandSlug}/${g.productLine.toLowerCase()}/${g.slug}`,
      meta: g.category,
    });
  }

  for (const d of getAllDevices()) {
    items.push({
      type: "device",
      id: d.slug,
      title: d.name,
      href: d.href,
      meta: d.os,
    });
  }

  for (const t of glossaryTerms) {
    items.push({
      type: "glossary",
      id: t.slug,
      title: t.term,
      href: `/glossary/${t.slug}`,
      meta: t.category,
    });
  }

  for (const t of topics) {
    items.push({
      type: "topic",
      id: t.slug,
      title: t.name,
      href: `/topics/${t.slug}`,
      meta: `${t.guideCount} guides`,
    });
  }

  return items;
}

export const seedNotes = {
  howToAddGuide:
    "Add an entry to src/data/guides.ts, create a route under src/app/[brand]/..., and register HowToJsonLd on the page.",
  howToAddDevice: "Add an entry to src/data/devices.ts and a page under the brand folder.",
  howToAddTerm: "Add an entry to src/data/glossary.ts — dynamic route /glossary/[slug] picks it up automatically.",
  howToAddTopic: "Add an entry to src/data/topics.ts and a page under src/app/topics/[slug].",
};
