-- TapPath Neon schema (email/password auth; no Supabase auth dependency)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT 'User',
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE,
  name text NOT NULL, color text DEFAULT 'bg-blue-500', description text DEFAULT '',
  guides_count integer NOT NULL DEFAULT 0, devices_count integer NOT NULL DEFAULT 0,
  product_lines jsonb NOT NULL DEFAULT '[]', top_guides jsonb NOT NULL DEFAULT '[]',
  devices_list jsonb NOT NULL DEFAULT '[]', seo_updates text DEFAULT '', seo_help text DEFAULT '',
  published boolean NOT NULL DEFAULT true, sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE,
  name text NOT NULL, description text DEFAULT '', icon text DEFAULT 'book',
  guide_count integer NOT NULL DEFAULT 0, brands text[] NOT NULL DEFAULT '{}',
  published boolean NOT NULL DEFAULT true, sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE,
  name text NOT NULL, brand_slug text NOT NULL, brand_name text NOT NULL,
  os text DEFAULT '', href text NOT NULL, year integer, image_url text,
  guides jsonb NOT NULL DEFAULT '[]', published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS glossary_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE,
  term text NOT NULL, category text NOT NULL DEFAULT 'General', short text DEFAULT '',
  definition text NOT NULL DEFAULT '', faqs jsonb NOT NULL DEFAULT '[]',
  related jsonb NOT NULL DEFAULT '[]', related_guides jsonb NOT NULL DEFAULT '[]',
  published boolean NOT NULL DEFAULT true, seo_title text, seo_description text,
  focus_keyword text, canonical_url text, robots_index boolean DEFAULT true,
  robots_follow boolean DEFAULT true, og_title text, og_description text, og_image text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, slug text NOT NULL UNIQUE,
  content text NOT NULL DEFAULT '', excerpt text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT false, seo_title text, seo_description text,
  focus_keyword text, canonical_url text,
  robots_index boolean NOT NULL DEFAULT true, robots_follow boolean NOT NULL DEFAULT true,
  og_title text, og_description text, og_image text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL,
  brand text NOT NULL, brand_slug text NOT NULL, product_line text NOT NULL DEFAULT '',
  title text NOT NULL, short_description text DEFAULT '', updated_label text DEFAULT '',
  read_time text DEFAULT '2 min', category text DEFAULT 'General',
  versions jsonb NOT NULL DEFAULT '[]', article jsonb NOT NULL DEFAULT '[]',
  faqs jsonb NOT NULL DEFAULT '[]', related jsonb NOT NULL DEFAULT '[]',
  compatible_devices jsonb NOT NULL DEFAULT '[]', confirmations integer NOT NULL DEFAULT 0,
  forum_verified boolean NOT NULL DEFAULT false, published boolean NOT NULL DEFAULT true,
  featured_image_url text, seo_title text, seo_description text, focus_keyword text,
  canonical_url text, robots_index boolean DEFAULT true, robots_follow boolean DEFAULT true,
  og_title text, og_description text, og_image text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (brand_slug, product_line, slug)
);

CREATE TABLE IF NOT EXISTS forum_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL,
  brand text NOT NULL DEFAULT 'General', brand_slug text NOT NULL DEFAULT 'general',
  category text NOT NULL DEFAULT 'General', author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  author_name text NOT NULL DEFAULT 'Anonymous', excerpt text DEFAULT '', body text NOT NULL DEFAULT '',
  solved boolean NOT NULL DEFAULT false, views integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'open', pinned boolean NOT NULL DEFAULT false, locked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS forum_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  author_name text NOT NULL DEFAULT 'Anonymous', body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS guide_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), guide_slug text NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  correct boolean NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY, value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS guides_brand_idx ON guides (brand_slug);
CREATE INDEX IF NOT EXISTS devices_brand_idx ON devices (brand_slug);
CREATE INDEX IF NOT EXISTS forum_topics_updated_idx ON forum_topics (updated_at DESC);
CREATE INDEX IF NOT EXISTS forum_replies_topic_idx ON forum_replies (topic_id, created_at);
CREATE INDEX IF NOT EXISTS guide_feedback_slug_idx ON guide_feedback (guide_slug);
