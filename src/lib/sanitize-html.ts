import sanitizeHtml from "sanitize-html";

const RICH_CONTENT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags,
  allowedAttributes: {
    a: ["href", "name", "target", "rel", "title"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    "*": ["class"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: {
    img: ["http", "https"],
  },
  allowProtocolRelative: false,
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true),
  },
};

/** Sanitize editor-authored rich text before it reaches public HTML. */
export function sanitizeRichHtml(value: unknown): string {
  return sanitizeHtml(typeof value === "string" ? value : "", RICH_CONTENT_OPTIONS);
}
