/** Shared helpers for beginner-friendly guide admin form */

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatUpdatedLabel(date = new Date()): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

export function formatModifiedDate(date = new Date()): string {
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Estimate read time from article paragraphs + step text */
export function estimateReadTime(
  article: string[],
  versions?: { steps?: { instruction?: string; detail?: string }[] }[]
): string {
  let words = 0;
  for (const p of article || []) {
    words += p.trim().split(/\s+/).filter(Boolean).length;
  }
  for (const v of versions || []) {
    for (const s of v.steps || []) {
      words += String(s.instruction || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
      words += String(s.detail || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
    }
  }
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min`;
}

export const GUIDE_CATEGORIES = [
  "Display & Home Screen",
  "Battery & Power",
  "Network & Connectivity",
  "Security",
  "Privacy",
  "Apps & Installation",
  "System & Settings",
  "Sound & Notification",
  "Camera",
  "Accounts",
  "Accessibility",
  "Storage",
  "General",
] as const;
