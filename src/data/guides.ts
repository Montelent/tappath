export type GuideStep = {
  id: number;
  instruction: string;
  highlight: string;
  detail?: string;
  /** Real phone screenshot URL (fits inside device frame) — TechBone-style */
  imageUrl?: string;
  /** Click marker position as % of screenshot (0–100) */
  markerX?: number;
  markerY?: number;
};

export type GuideVersion = {
  id: string;
  label: string;
  steps: GuideStep[];
};

export type Guide = {
  slug: string;
  brand: string;
  brandSlug: string;
  productLine: string;
  title: string;
  shortDescription: string;
  updated: string;
  readTime: string;
  category: string;
  versions: GuideVersion[];
  article: string[];
  faqs: { q: string; a: string }[];
  related: { title: string; href: string; category: string }[];
  compatibleDevices: { name: string; os: string; href: string }[];
  confirmations: number;
  forumVerified?: boolean;
};

// Re-export existing static guides from original file content is large —
// keep runtime import of full guides via separate module if needed.
// For type-only consumers this is enough; full data remains in repo.
export { guides } from "./guidesData";
