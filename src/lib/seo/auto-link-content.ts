import type { DbGlossaryTerm, DbGuide } from "@/lib/db/types";
import { guideHref } from "@/lib/guides/resolve";

type LinkState = {
  glossary: Set<string>;
  guides: Set<string>;
};

function escapeRegExp(value: string): string {
  return value.split("").map((character) => ".*+?^${}()|[]\\\\".includes(character) ? `\\${character}` : character).join("");
}

function escapeAttribute(value: string): string {
  return value.split("").map((character) => ".*+?^${}()|[]\\\\".includes(character) ? `\\${character}` : character).join("");
}

function linkTextNodes(html: string, matcher: RegExp, render: (matched: string) => string): string {
  const parts = html.split(/(<[^>]*>)/g);
  const skipped = new Set(["a", "code", "pre", "script", "style", "textarea", "button", "h1", "h2", "h3", "h4", "h5", "h6"]);
  const stack: string[] = [];
  return parts.map((part) => {
    if (!part) return part;
    if (part.startsWith("<")) {
      const close = part.match(/^<\s*\/\s*([a-z0-9-]+)/i);
      const open = part.match(/^<\s*([a-z0-9-]+)/i);
      if (close) {
        const index = stack.lastIndexOf(close[1].toLowerCase());
        if (index >= 0) stack.splice(index, 1);
      } else if (open && !/\/\s*>$/.test(part)) {
        stack.push(open[1].toLowerCase());
      }
      return part;
    }
    if (stack.some((tag) => skipped.has(tag))) return part;
    return part.replace(matcher, (_whole, boundary: string, matched: string) => boundary + render(matched));
  }).join("");
}

export function createGuideAutoLinker(
  glossary: DbGlossaryTerm[],
  guides: DbGuide[],
  currentGuide: DbGuide
): (html: string) => string {
  const state: LinkState = { glossary: new Set(), guides: new Set() };
  const currentHref = guideHref(currentGuide);
  const glossaryItems = glossary
    .filter((term) => term.published !== false && term.term?.trim().length >= 3 && term.slug)
    .sort((a, b) => b.term.length - a.term.length);
  const guideItems = guides
    .filter((item) => item.published !== false && item.title?.trim().length >= 12 && guideHref(item) !== currentHref)
    .sort((a, b) => b.title.length - a.title.length);

  return (input: string) => {
    let html = input || "";
    for (const term of glossaryItems) {
      if (state.glossary.has(term.slug)) continue;
      const matcher = new RegExp("(^|[^\\p{L}\\p{N}])(" + escapeRegExp(term.term.trim()) + ")(?=$|[^\\p{L}\\p{N}])", "giu");
      let linked = false;
      html = linkTextNodes(html, matcher, (_matched) => {
        if (linked) return _matched;
        linked = true;
        state.glossary.add(term.slug);
        const definition = escapeAttribute((term.short || term.definition || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 260));
        return `<a class="auto-glossary-link" href="/glossary/${encodeURIComponent(term.slug)}" data-definition="${definition}" title="${definition || escapeAttribute(term.term)}" aria-label="${escapeAttribute(term.term)} glossary definition">${_matched}<span class="auto-glossary-tooltip" role="tooltip">${definition || escapeAttribute(term.term)}<span class="auto-glossary-more">Read glossary entry →</span></span></a>`;
      });
    }

    let guideLinks = 0;
    for (const target of guideItems) {
      const href = guideHref(target);
      if (state.guides.has(href) || guideLinks >= 4) continue;
      const matcher = new RegExp("(^|[^\\p{L}\\p{N}])(" + escapeRegExp(target.title.trim()) + ")(?=$|[^\\p{L}\\p{N}])", "giu");
      let linked = false;
      html = linkTextNodes(html, matcher, (_matched) => {
        if (linked) return _matched;
        linked = true;
        state.guides.add(href);
        guideLinks += 1;
        return `<a class="auto-guide-link" href="${escapeAttribute(href)}">${_matched}</a>`;
      });
    }
    return html;
  };
}
