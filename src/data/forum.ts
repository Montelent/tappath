export type ForumTopic = {
  id: string;
  title: string;
  brand: string;
  brandSlug: string;
  category: string;
  replies: number;
  views: number;
  lastActivity: string;
  solved: boolean;
  author: string;
  excerpt: string;
};

export type ForumCategory = {
  slug: string;
  name: string;
  description: string;
  topicCount: number;
};

export const forumCategories: ForumCategory[] = [
  { slug: "samsung", name: "Samsung", description: "Galaxy, One UI, Knox and more", topicCount: 128 },
  { slug: "xiaomi", name: "Xiaomi", description: "HyperOS, Redmi, POCO", topicCount: 94 },
  { slug: "general", name: "General Android", description: "Cross-brand tips and troubleshooting", topicCount: 56 },
  { slug: "guides", name: "Guide feedback", description: "Report broken paths or suggest improvements", topicCount: 31 },
];

export const forumTopics: ForumTopic[] = [
  {
    id: "1",
    title: "Google search bar keeps coming back after reboot",
    brand: "Samsung",
    brandSlug: "samsung",
    category: "Display",
    replies: 12,
    views: 840,
    lastActivity: "2h ago",
    solved: true,
    author: "mira_k",
    excerpt: "Removed the widget but after restart it's back on the home screen…",
  },
  {
    id: "2",
    title: "Private DNS won't stick on One UI 7",
    brand: "Samsung",
    brandSlug: "samsung",
    category: "Network",
    replies: 7,
    views: 312,
    lastActivity: "5h ago",
    solved: false,
    author: "dev_nile",
    excerpt: "Set dns.google but after airplane mode it resets to Automatic.",
  },
  {
    id: "3",
    title: "HyperOS battery drain after latest update",
    brand: "Xiaomi",
    brandSlug: "xiaomi",
    category: "Battery",
    replies: 23,
    views: 2104,
    lastActivity: "1d ago",
    solved: true,
    author: "redmi_user",
    excerpt: "Screen-on time dropped from 7h to 4h. Any Adaptive Battery tips?",
  },
  {
    id: "4",
    title: "How to dual WhatsApp without second space?",
    brand: "Xiaomi",
    brandSlug: "xiaomi",
    category: "Apps",
    replies: 9,
    views: 1201,
    lastActivity: "1d ago",
    solved: true,
    author: "alia",
    excerpt: "Looking for Dual Messenger path on HyperOS 2.",
  },
  {
    id: "5",
    title: "VoLTE missing on carrier after eSIM swap",
    brand: "Google",
    brandSlug: "google",
    category: "Network",
    replies: 4,
    views: 198,
    lastActivity: "3d ago",
    solved: false,
    author: "pixel_fan",
    excerpt: "Pixel 9 Pro, eSIM activated, calls fall back to 3G.",
  },
  {
    id: "6",
    title: "Guide path outdated for Always On Display",
    brand: "Samsung",
    brandSlug: "samsung",
    category: "Guides",
    replies: 3,
    views: 89,
    lastActivity: "4d ago",
    solved: false,
    author: "pathchecker",
    excerpt: "On One UI 7 the menu is under Lock screen and AOD, not Display.",
  },
];

export function getTopicsByBrand(brandSlug: string): ForumTopic[] {
  return forumTopics.filter((t) => t.brandSlug === brandSlug);
}
