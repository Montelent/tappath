import type { SiteSettings } from "@/lib/site-settings";

export type AuthorSocial = {
  key: string;
  label: string;
  href: string;
};

export function authorSocialLinks(s: SiteSettings): AuthorSocial[] {
  const entries: { key: keyof SiteSettings; label: string }[] = [
    { key: "author_website", label: "Website" },
    { key: "author_twitter", label: "X / Twitter" },
    { key: "author_linkedin", label: "LinkedIn" },
    { key: "author_github", label: "GitHub" },
    { key: "author_youtube", label: "YouTube" },
    { key: "author_facebook", label: "Facebook" },
    { key: "author_instagram", label: "Instagram" },
  ];
  const out: AuthorSocial[] = [];
  for (const { key, label } of entries) {
    const href = String(s[key] || "").trim();
    if (href) out.push({ key: String(key), label, href });
  }
  const known = new Set(out.map((x) => x.href.replace(/\/$/, "").toLowerCase()));
  for (const raw of String(s.author_same_as || "").split(",")) {
    const href = raw.trim();
    if (!href) continue;
    const norm = href.replace(/\/$/, "").toLowerCase();
    if (known.has(norm)) continue;
    let label = href;
    try {
      label = new URL(href).hostname.replace(/^www\./, "");
    } catch {
      /* keep */
    }
    out.push({ key: href, label, href });
    known.add(norm);
  }
  return out;
}

export function authorSameAsUrls(s: SiteSettings): string[] {
  return authorSocialLinks(s).map((x) => x.href);
}

export function authorProfilePath(s: SiteSettings): string {
  const slug = (s.author_slug || "editorial").trim().replace(/^\/+|\/+$/g, "") || "editorial";
  return `/author/${slug}`;
}
