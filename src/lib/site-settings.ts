import { getSql, isNeonConfigured } from "@/lib/db/neon";

/** All public site settings editable from Admin → Settings */
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
  author_title: string;
  author_bio: string;
  author_avatar_url: string;
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
  author_title: "Smartphone settings researcher",
  author_bio:
    "TapPath editors verify menu paths on real devices and keep guides updated when Android and OEM skins change.",
  author_avatar_url: "",
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
