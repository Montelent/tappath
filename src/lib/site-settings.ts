import { getSql, isNeonConfigured } from "@/lib/db/neon";

/** All public site settings editable from Admin → Settings */
export type SiteSettings = {
  // Branding
  site_name: string;
  site_tagline: string;
  logo_url: string;
  favicon_url: string;
  og_image_url: string;

  // Contact / SEO
  support_email: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;

  // Homepage hero
  homepage_eyebrow: string;
  homepage_hero_title: string;
  homepage_hero_subtitle: string;
  homepage_search_placeholder: string;

  // Homepage section headings
  homepage_guides_heading: string;
  homepage_brands_heading: string;
  homepage_topics_heading: string;
  homepage_coming_soon_label: string;

  // Footer
  footer_tagline: string;
  footer_copyright: string;

  // Feature flags
  maintenance_mode: boolean;
  allow_signups: boolean;
  default_locale: string;
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

  footer_tagline:
    "Phone settings paths written as clear steps — for people who just want the menu to work.",
  footer_copyright: "Paths verified on real devices when screenshots are attached.",

  maintenance_mode: false,
  allow_signups: true,
  default_locale: "en",
};

function unwrapValue(v: unknown): unknown {
  if (v && typeof v === "object" && !Array.isArray(v) && "value" in (v as object)) {
    return (v as { value: unknown }).value;
  }
  return v;
}

/** Server-side: load site settings from Neon (or defaults). */
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
    // table missing or query error — keep defaults
  }

  return settings;
}
