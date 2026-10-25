export type DbBrand = {
  id: string;
  slug: string;
  name: string;
  color: string;
  description: string;
  guides_count: number;
  devices_count: number;
  product_lines: { name: string; count: number; href: string }[];
  top_guides: { title: string; href: string; category: string }[];
  devices_list: { name: string; os: string; href: string }[];
  seo_updates: string;
  seo_help: string;
  published: boolean;
  sort_order: number;
};

export type DbTopic = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  guide_count: number;
  brands: string[];
  published: boolean;
  sort_order: number;
};

export type DbDevice = {
  id: string;
  slug: string;
  name: string;
  brand_slug: string;
  brand_name: string;
  os: string;
  href: string;
  year: number | null;
  guides: { title: string; href: string }[];
  published: boolean;
};

export type DbGlossaryTerm = {
  id: string;
  slug: string;
  term: string;
  category: string;
  short: string;
  definition: string;
  related_guides: { title: string; href: string }[];
  published: boolean;
};

export type DbGuide = {
  id: string;
  slug: string;
  brand: string;
  brand_slug: string;
  product_line: string;
  title: string;
  short_description: string;
  updated_label: string;
  read_time: string;
  category: string;
  versions: unknown[];
  article: string[];
  faqs: { q: string; a: string }[];
  related: { title: string; href: string; category: string }[];
  compatible_devices: { name: string; os: string; href: string }[];
  confirmations: number;
  forum_verified: boolean;
  published: boolean;
};

export type AdminStats = {
  guides: number;
  brands: number;
  topics: number;
  devices: number;
  glossary: number;
  forumTopics: number;
  feedback: number;
  usingSupabase: boolean;
};
