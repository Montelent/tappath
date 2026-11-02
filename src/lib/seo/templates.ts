/**
 * Rank Math–style SEO title/description templates with shortcodes.
 */

export type SeoVars = {
  title?: string;
  sitename?: string;
  sep?: string;
  brand?: string;
  excerpt?: string;
  description?: string;
  term?: string;
  category?: string;
  device?: string;
  product_line?: string;
  page?: string;
};

export const SEO_SHORTCODES: { code: string; label: string; group: string }[] = [
  { code: "%title%", label: "Title", group: "Content" },
  { code: "%sitename%", label: "Site name", group: "Site" },
  { code: "%sep%", label: "Separator", group: "Site" },
  { code: "%brand%", label: "Brand", group: "Content" },
  { code: "%excerpt%", label: "Excerpt", group: "Content" },
  { code: "%description%", label: "Description", group: "Content" },
  { code: "%term%", label: "Glossary term", group: "Glossary" },
  { code: "%category%", label: "Category", group: "Content" },
  { code: "%device%", label: "Device name", group: "Devices" },
  { code: "%product_line%", label: "Product line", group: "Content" },
  { code: "%page%", label: "Page number", group: "Site" },
];

export function applySeoTemplate(
  template: string | null | undefined,
  vars: SeoVars,
  fallback = ""
): string {
  const tpl = (template || "").trim();
  if (!tpl) return fallback;

  const map: Record<string, string> = {
    "%title%": vars.title || "",
    "%sitename%": vars.sitename || "",
    "%sep%": vars.sep || "·",
    "%brand%": vars.brand || "",
    "%excerpt%": vars.excerpt || vars.description || "",
    "%description%": vars.description || vars.excerpt || "",
    "%term%": vars.term || vars.title || "",
    "%category%": vars.category || "",
    "%device%": vars.device || vars.title || "",
    "%product_line%": vars.product_line || "",
    "%page%": vars.page || "",
  };

  let out = tpl;
  for (const [code, value] of Object.entries(map)) {
    out = out.split(code).join(value);
  }
  out = out
    .replace(/\s{2,}/g, " ")
    .replace(/\s*[·|–—-]\s*[·|–—-]\s*/g, " · ")
    .replace(/^\s*[·|–—-]\s*|\s*[·|–—-]\s*$/g, "")
    .trim();
  return out || fallback;
}

export function seoPreviewTitle(template: string, vars: SeoVars): string {
  const t = applySeoTemplate(template, vars, vars.title || "Page title");
  return t.length > 60 ? t.slice(0, 57) + "…" : t;
}

export function seoPreviewDescription(template: string, vars: SeoVars): string {
  const d = applySeoTemplate(template, vars, vars.excerpt || vars.description || "");
  return d.length > 160 ? d.slice(0, 157) + "…" : d;
}
