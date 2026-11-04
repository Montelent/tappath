import { getSql, isNeonConfigured } from "@/lib/db/neon";

export type NavMenuItem = {
  id: string;
  label: string;
  href: string;
  openInNewTab?: boolean;
  children?: NavMenuItem[];
};

export type SeoRedirect = {
  id: string;
  from: string;
  to: string;
  code: 301 | 302;
  enabled?: boolean;
};

export type SiteSettings = {
  site_name: string;
  site_tagline: string;
  logo_url: string;
  favicon_url: string;
  og_image_url: string;

  support_email: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  seo_title_separator: string;
  seo_robots_index: boolean;
  seo_robots_follow: boolean;
  seo_canonical_host: string;
  seo_google_verification: string;
  seo_bing_verification: string;
  seo_yandex_verification: string;
  seo_pinterest_verification: string;
  seo_robots_extra: string;
  seo_redirect_trailing_slash: boolean;
  seo_force_canonical_host: boolean;
  seo_redirects: SeoRedirect[];

  /** XML sitemap controls (Admin → SEO → Sitemap) */
  seo_sitemap_enabled: boolean;
  seo_sitemap_include_guides: boolean;
  seo_sitemap_include_glossary: boolean;
  seo_sitemap_include_topics: boolean;
  seo_sitemap_include_devices: boolean;
  seo_sitemap_include_brands: boolean;
  seo_sitemap_include_forum: boolean;
  seo_sitemap_changefreq_guides: string;
  seo_sitemap_priority_guides: string;
  seo_sitemap_changefreq_default: string;
  seo_sitemap_priority_default: string;

  seo_tpl_guide_title: string;
  seo_tpl_guide_description: string;
  seo_tpl_page_title: string;
  seo_tpl_page_description: string;
  seo_tpl_glossary_title: string;
  seo_tpl_glossary_description: string;
  seo_tpl_device_title: string;
  seo_tpl_device_description: string;
  seo_tpl_brand_title: string;
  seo_tpl_brand_description: string;
  seo_tpl_topic_title: string;
  seo_tpl_topic_description: string;
  seo_tpl_homepage_title: string;
  seo_tpl_homepage_description: string;

  homepage_eyebrow: string;
  homepage_hero_title: string;
  homepage_hero_subtitle: string;
  homepage_search_placeholder: string;

  homepage_guides_heading: string;
  homepage_brands_heading: string;
  homepage_topics_heading: string;
  homepage_coming_soon_label: string;
  homepage_all_topics_label: string;
  homepage_no_brands_text: string;

  nav_home: string;
  nav_topics: string;
  nav_devices: string;
  nav_glossary: string;
  nav_forum: string;
  nav_admin: string;
  nav_sign_in: string;
  nav_sign_up: string;
  nav_items: NavMenuItem[];
  footer_items: NavMenuItem[];

  footer_tagline: string;
  footer_copyright: string;
  footer_browse_heading: string;
  footer_account_heading: string;
  footer_support_label: string;

  social_twitter: string;
  social_github: string;
  social_youtube: string;
  social_discord: string;
  social_linkedin: string;
  social_facebook: string;
  social_instagram: string;

  maintenance_mode: boolean;
  maintenance_message: string;

  allow_signups: boolean;
  default_locale: string;

  author_name: string;
  author_slug: string;
  author_title: string;
  author_bio: string;
  author_full_bio: string;
  author_credentials: string;
  author_avatar_url: string;
  author_email: string;
  author_website: string;
  author_twitter: string;
  author_linkedin: string;
  author_github: string;
  author_youtube: string;
  author_facebook: string;
  author_instagram: string;
  author_same_as: string;

  head_code: string;
  body_start_code: string;
  footer_code: string;

  ads_enabled: boolean;
  ad_header: string;
  ad_after_title: string;
  ad_after_simulator: string;
  ad_mid_content: string;
  ad_before_footer: string;
  ad_sidebar: string;
};

export const SITE_SETTINGS_DEFAULTS: SiteSettings = {
  site_name: "TapPath",
  site_tagline: "Visual step-by-step smartphone guides",
  logo_url: "",
  favicon_url: "",
  og_image_url: "/og.png",
  support_email: "support@tappath.com",
  meta_title: "TapPath — Phone settings, step by step",
  seo_title_separator: "·",
  seo_robots_index: true,
  seo_robots_follow: true,
  seo_canonical_host: "",
  seo_google_verification: "",
  seo_bing_verification: "",
  seo_yandex_verification: "",
  seo_pinterest_verification: "",
  seo_robots_extra: "",
  seo_redirect_trailing_slash: true,
  seo_force_canonical_host: false,
  seo_redirects: [],
  seo_sitemap_enabled: true,
  seo_sitemap_include_guides: true,
  seo_sitemap_include_glossary: true,
  seo_sitemap_include_topics: true,
  seo_sitemap_include_devices: true,
  seo_sitemap_include_brands: true,
  seo_sitemap_include_forum: true,
  seo_sitemap_changefreq_guides: "weekly",
  seo_sitemap_priority_guides: "0.9",
  seo_sitemap_changefreq_default: "weekly",
  seo_sitemap_priority_default: "0.7",
  seo_tpl_guide_title: "%title% %sep% %brand% %sep% %sitename%",
  seo_tpl_guide_description: "%excerpt%",
  seo_tpl_page_title: "%title% %sep% %sitename%",
  seo_tpl_page_description: "%excerpt%",
  seo_tpl_glossary_title: "What is %term%? %sep% %sitename%",
  seo_tpl_glossary_description: "%excerpt%",
  seo_tpl_device_title: "%device% guides & specs %sep% %sitename%",
  seo_tpl_device_description: "Step-by-step settings guides and specs for %device%.",
  seo_tpl_brand_title: "%brand% guides, help & settings %sep% %sitename%",
  seo_tpl_brand_description: "Verified menu paths and how-tos for %brand% phones.",
  seo_tpl_topic_title: "%title%: guides & tips %sep% %sitename%",
  seo_tpl_topic_description: "%excerpt%",
  seo_tpl_homepage_title: "%sitename% %sep% Phone settings, step by step",
  seo_tpl_homepage_description: "%excerpt%",
  meta_description:
    "Exact menu paths for Samsung, Xiaomi, Huawei, OnePlus, Oppo, Realme, Android and Google phones. Verified screenshots and steps.",
  meta_keywords: "smartphone settings, Android how to, Samsung One UI, Xiaomi HyperOS, menu path",
  homepage_eyebrow: "Phone settings",
  homepage_hero_title: "Find the exact path in Settings.",
  homepage_hero_subtitle:
    "Step-by-step menu routes for Samsung, Xiaomi, Huawei, OnePlus, Oppo, Realme, Android and Google — with screenshots when you need them.",
  homepage_search_placeholder: "Try “fingerprint”, “battery %”, “private DNS”…",
  homepage_guides_heading: "Latest guides",
  homepage_brands_heading: "Brands",
  homepage_topics_heading: "Topics",
  homepage_coming_soon_label: "Coming soon",
  homepage_all_topics_label: "All topics",
  homepage_no_brands_text: "No brands with published guides yet.",
  nav_home: "Home",
  nav_topics: "Topics",
  nav_devices: "Devices",
  nav_glossary: "Glossary",
  nav_forum: "Forum",
  nav_admin: "Admin",
  nav_sign_in: "Sign in",
  nav_sign_up: "Sign up",
  nav_items: [
    { id: "home", label: "Home", href: "/" },
    { id: "topics", label: "Topics", href: "/topics" },
    { id: "devices", label: "Devices", href: "/devices" },
    { id: "glossary", label: "Glossary", href: "/glossary" },
    { id: "forum", label: "Forum", href: "/forum" },
  ],
  footer_items: [
    { id: "topics", label: "Topics", href: "/topics" },
    { id: "devices", label: "Devices", href: "/devices" },
    { id: "glossary", label: "Glossary", href: "/glossary" },
    { id: "forum", label: "Forum", href: "/forum" },
  ],
  footer_tagline:
    "Phone settings paths written as clear steps — for people who just want the menu to work.",
  footer_copyright: "Paths verified on real devices when screenshots are attached.",
  footer_browse_heading: "Browse",
  footer_account_heading: "Account",
  footer_support_label: "Support",
  social_twitter: "",
  social_github: "",
  social_youtube: "",
  social_discord: "",
  social_linkedin: "",
  social_facebook: "",
  social_instagram: "",
  maintenance_mode: false,
  maintenance_message:
    "We're doing a short maintenance window. Some features may be temporarily unavailable.",
  allow_signups: true,
  default_locale: "en",
  author_name: "TapPath Editorial",
  author_slug: "editorial",
  author_title: "Smartphone settings researcher",
  author_bio:
    "TapPath editors verify menu paths on real devices and keep guides updated when Android and OEM skins change.",
  author_full_bio:
    "Our editorial team tests menu paths on real Samsung, Xiaomi, and other Android phones. Guides are updated when One UI, HyperOS, and stock Android change — so the steps you see match what is on your device.",
  author_credentials: "Verified on real devices · Updated with each major OS release",
  author_avatar_url: "",
  author_email: "",
  author_website: "",
  author_twitter: "",
  author_linkedin: "",
  author_github: "",
  author_youtube: "",
  author_facebook: "",
  author_instagram: "",
  author_same_as: "",
  head_code: "",
  body_start_code: "",
  footer_code: "",
  ads_enabled: false,
  ad_header: "",
  ad_after_title: "",
  ad_after_simulator: "",
  ad_mid_content: "",
  ad_before_footer: "",
  ad_sidebar: "",
};

function unwrapValue(v: unknown): unknown {
  if (v && typeof v === "object" && !Array.isArray(v) && "value" in (v as object)) {
    return (v as { value: unknown }).value;
  }
  return v;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const settings: SiteSettings = { ...SITE_SETTINGS_DEFAULTS };

  if (!isNeonConfigured()) return settings;

  try {
    const sql = getSql()!;
    const rows = await sql`SELECT key, value FROM site_settings`;
    for (const r of rows as { key: string; value: unknown }[]) {
      if (!(r.key in SITE_SETTINGS_DEFAULTS)) continue;
      const raw = unwrapValue(r.value);
      const key = r.key as keyof SiteSettings;
      const def = SITE_SETTINGS_DEFAULTS[key];
      if (typeof def === "boolean") {
        settings[key] = (raw === true || raw === "true") as never;
      } else if (Array.isArray(def)) {
        if (Array.isArray(raw)) {
          settings[key] = raw as never;
        } else if (typeof raw === "string") {
          try {
            const parsed = JSON.parse(raw);
            settings[key] = (Array.isArray(parsed) ? parsed : def) as never;
          } catch {
            settings[key] = def as never;
          }
        }
      } else if (typeof def === "string") {
        settings[key] = (raw == null ? def : String(raw)) as never;
      }
    }
  } catch {
    /* keep defaults */
  }

  return settings;
}

export function activeSocialLinks(s: SiteSettings): { key: string; label: string; href: string }[] {
  const map: { key: keyof SiteSettings; label: string }[] = [
    { key: "social_twitter", label: "X / Twitter" },
    { key: "social_github", label: "GitHub" },
    { key: "social_youtube", label: "YouTube" },
    { key: "social_discord", label: "Discord" },
    { key: "social_linkedin", label: "LinkedIn" },
    { key: "social_facebook", label: "Facebook" },
    { key: "social_instagram", label: "Instagram" },
  ];
  return map
    .map(({ key, label }) => ({
      key: key as string,
      label,
      href: String(s[key] || "").trim(),
    }))
    .filter((x) => x.href.length > 0);
}
