export type DbBrand = {
  id: string;
  slug: string;
  name: string;
  color?: string | null;
  description?: string | null;
  guides_count: number;
  devices_count: number;
  product_lines: { name: string }[];
  top_guides: { title: string; href: string; category: string }[];
  devices_list: { name: string; os: string; href: string }[];
  seo_updates?: string | null;
  seo_help?: string | null;
  published?: boolean;
};

export type DbTopic = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  guide_count?: number;
  brands?: string[];
  published?: boolean;
  sort_order?: number;
};

export type DbDevice = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  brand_slug: string;
  os?: string | null;
  href?: string | null;
  guides: { title: string; href: string }[];
  published?: boolean;
};

export type DbGlossaryTerm = {
  id: string;
  slug: string;
  term: string;
  short?: string | null;
  definition?: string | null;
  category?: string | null;
  faqs?: { q: string; a: string }[] | null;
  related_guides: { title: string; href: string; brand?: string }[];
  seo_title?: string | null;
  seo_description?: string | null;
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
  featured_image_url?: string | null;
};

export type DbForumTopic = {
  id: string;
  title: string;
  brand: string;
  brand_slug: string;
  category: string;
  author_name: string;
  excerpt: string;
  body: string;
  solved: boolean;
  views: number;
  created_at: string;
  updated_at: string;
};

export type AdminStats = {
  guides: number;
  brands: number;
  topics: number;
  devices: number;
  glossary: number;
  forumTopics: number;
  feedback: number;
};
