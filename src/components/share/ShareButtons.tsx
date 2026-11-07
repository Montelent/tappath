"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Share2, Link2, Check, ChevronDown } from "lucide-react";

type Props = {
  title: string;
  /** Full share title e.g. "Samsung: Add a Fingerprint" — preferred over title */
  shareTitle?: string;
  text?: string;
  /** Short excerpt included in share body where platforms allow it */
  description?: string;
  url?: string;
  className?: string;
};

type ShareCtx = { url: string; title: string; text: string };

type Net = {
  id: string;
  label: string;
  color: string;
  href: (c: ShareCtx) => string;
};

function shareBody(title: string, text: string, url?: string): string {
  const parts = [title];
  if (text && text !== title) parts.push("", text);
  if (url) parts.push("", url);
  return parts.join("\n");
}

const NETWORKS: Net[] = [
  {
    id: "facebook",
    label: "Facebook",
    color: "#1877F2",
    href: ({ url, title }) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`,
  },
  {
    id: "x",
    label: "X",
    color: "#0f1419",
    href: ({ url, title, text }) => {
      const body = text && text !== title ? `${title}\n\n${text}` : title;
      return `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(body)}`;
    },
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    color: "#0A66C2",
    href: ({ url }) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    color: "#25D366",
    href: ({ url, title, text }) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(shareBody(title, text, url))}`,
  },
  {
    id: "telegram",
    label: "Telegram",
    color: "#26A5E4",
    href: ({ url, title, text }) => {
      const body = text && text !== title ? `${title}\n\n${text}` : title;
      return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(body)}`;
    },
  },
  {
    id: "reddit",
    label: "Reddit",
    color: "#FF4500",
    href: ({ url, title }) =>
      `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
  {
    id: "pinterest",
    label: "Pinterest",
    color: "#E60023",
    href: ({ url, title, text }) => {
      const desc = text && text !== title ? `${title} — ${text}` : title;
      return `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(desc)}`;
    },
  },
  {
    id: "threads",
    label: "Threads",
    color: "#000000",
    href: ({ url, title, text }) =>
      `https://www.threads.net/intent/post?text=${encodeURIComponent(shareBody(title, text, url))}`,
  },
  {
    id: "email",
    label: "Email",
    color: "#6B7280",
    href: ({ url, title, text }) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareBody(title, text, url))}`,
  },
];

function NetIcon({ id, className = "h-4 w-4" }: { id: string; className?: string }) {
  switch (id) {
    case "facebook":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
        </svg>
      );
    case "x":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.227-8.451L1.99 2.25h6.182l4.263 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      );
    case "telegram":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M11.944 0A12 12 0 00 0 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      );
    case "reddit":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.61a3.111 3.111 0 01.04.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12a1.75 1.75 0 012.541-1.562 10.04 10.04 0 014.681-1.52l.885-4.152a.342.342 0 01.45-.287l2.94.617a1.214 1.214 0 011.083-.67zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 00.029-.463.33.33 0 00-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 00-.232-.095z" />
        </svg>
      );
    case "pinterest":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741a.219.219 0 01.05.211c-.061.252-.196.796-.222.907-.035.146-.116.177-.268.107-1-.465-1.624-1.926-1.624-3.1 0-2.523 1.834-4.84 5.286-4.84 2.775 0 4.932 1.98 4.932 4.62 0 2.757-1.739 4.976-4.151 4.976-.811 0-1.573-.421-1.834-.919l-.498 1.902c-.181.695-.533 1.566-.796 2.096 1.1.336 2.254.519 3.456.519 6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z" />
        </svg>
      );
    case "threads":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.235-3.521C2.137 18.211 1.2 15.236 1.2 12.01 1.2 5.937 5.905 1.2 12.01 1.2S22.8 5.937 22.8 12.01c0 6.073-4.705 10.81-10.614 10.99zm-.014-2.16c4.793 0 8.47-3.736 8.47-9.83 0-6.094-3.677-9.83-8.47-9.83s-8.47 3.736-8.47 9.83c0 6.094 3.677 9.83 8.47 9.83zm.47-4.61c1.87 0 3.27-.52 4.15-1.54.59-.69.93-1.61.93-2.54 0-1.56-.87-2.66-2.28-2.99-.48-.12-.97-.17-1.48-.17-1.12 0-2.12.35-2.87.98-.1-.89-.33-1.74-.7-2.52h1.98v-1.6H9.25v.1c.68 1.57 1.05 3.22 1.05 4.91 0 .34-.02.67-.05 1-.68-.64-1.55-1.01-2.58-1.01-1.97 0-3.34 1.43-3.34 3.4 0 2.01 1.47 3.38 3.61 3.38 1.12 0 2.05-.38 2.76-1.07.22.68.52 1.28.9 1.79l1.4-.93c-.35-.49-.63-1.05-.84-1.66.3.1.62.15.95.15zm-3.66-1.58c.58 0 1.08.2 1.47.55-.12.57-.18 1.16-.18 1.76 0 .2.01.4.02.59-.4.4-.92.61-1.52.61-1.13 0-1.88-.72-1.88-1.81 0-1.07.74-1.7 2.09-1.7zm5.12.05c.87 0 1.39.55 1.39 1.38 0 .89-.56 1.87-1.86 1.87-.35 0-.67-.07-.95-.2.05-.34.08-.69.08-1.05 0-.55-.05-1.08-.14-1.58.4-.27.9-.42 1.48-.42z" />
        </svg>
      );
    case "email":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
        </svg>
      );
    default:
      return <Share2 className={className} />;
  }
}

export default function ShareButtons({
  title,
  shareTitle,
  text = "",
  description,
  url,
  className = "",
}: Props) {
  const [pageUrl, setPageUrl] = useState(url || "");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const [open, setOpen] = useState(false);
  const [canNative, setCanNative] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (url) {
      setPageUrl(url.startsWith("http") ? url : `${window.location.origin}${url}`);
    } else {
      setPageUrl(window.location.href.split("#")[0]);
    }
    setCanNative(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, [url]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const resolvedTitle = (shareTitle || title || "").trim() || "Share";
  const resolvedText = (description || text || "").trim();
  const ctx: ShareCtx = { url: pageUrl, title: resolvedTitle, text: resolvedText };

  const openShare = useCallback((href: string) => {
    setOpen(false);
    if (href.startsWith("mailto:")) {
      window.location.href = href;
      return;
    }
    window.open(href, "_blank", "noopener,noreferrer,width=640,height=640");
  }, []);

  const nativeShare = async () => {
    setOpen(false);
    try {
      await navigator.share({
        title: resolvedTitle,
        text: resolvedText ? `${resolvedTitle}\n\n${resolvedText}` : resolvedTitle,
        url: pageUrl,
      });
    } catch {
      /* cancelled */
    }
  };

  const copyLink = async () => {
    setCopyError("");
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(pageUrl);
      } else {
        const field = document.createElement("textarea");
        field.value = pageUrl;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        const ok = document.execCommand("copy");
        field.remove();
        if (!ok) throw new Error("Clipboard unavailable");
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError("Could not copy automatically. Select and copy the page URL from your browser.");
    }
  };

  if (!pageUrl) return null;

  return (
    <div ref={rootRef} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium shadow-sm transition hover:border-[var(--accent)] hover:bg-[var(--muted)]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      >
        <Share2 className="h-4 w-4 text-[var(--accent)]" />
        <span>Share</span>
        <ChevronDown
          className={`h-4 w-4 text-[var(--muted-foreground)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Share options"
          className="absolute left-0 top-full z-50 mt-2 w-[min(100vw-2rem,18rem)] origin-top-left rounded-2xl border border-[var(--border)] bg-[var(--card)] p-1.5 shadow-lg sm:w-72"
        >
          {canNative && (
            <button
              type="button"
              role="menuitem"
              onClick={nativeShare}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition hover:bg-[var(--muted)]/50"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-white">
                <Share2 className="h-4 w-4" />
              </span>
              Share via device…
            </button>
          )}

          <div className="max-h-[min(60vh,22rem)] overflow-y-auto overscroll-contain">
            {NETWORKS.map((n) => (
              <button
                key={n.id}
                type="button"
                role="menuitem"
                onClick={() => openShare(n.href(ctx))}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-[var(--muted)]/50"
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: n.color }}
                >
                  <NetIcon id={n.id} className="h-4 w-4" />
                </span>
                <span className="font-medium">{n.label}</span>
              </button>
            ))}

            <button
              type="button"
              role="menuitem"
              onClick={copyLink}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-[var(--muted)]/50"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--foreground)]">
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Link2 className="h-4 w-4" />
                )}
              </span>
              <span className="font-medium">{copied ? "Link copied!" : "Copy link"}</span>
            </button>
            {copyError && <p role="alert" className="px-3 py-2 text-xs text-red-600 dark:text-red-400">{copyError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
