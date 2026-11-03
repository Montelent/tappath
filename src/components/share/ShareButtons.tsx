"use client";

import { useCallback, useEffect, useState } from "react";
import { Share2, Link2, Check, Mail } from "lucide-react";

type Props = {
  title: string;
  text?: string;
  url?: string;
  className?: string;
};

type Net = {
  id: string;
  label: string;
  color: string;
  href: (c: { url: string; title: string; text: string }) => string;
};

const NETWORKS: Net[] = [
  {
    id: "facebook",
    label: "Facebook",
    color: "#1877F2",
    href: ({ url }) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "x",
    label: "X",
    color: "#0f1419",
    href: ({ url, title }) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
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
    href: ({ url, title }) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title}\n${url}`)}`,
  },
  {
    id: "telegram",
    label: "Telegram",
    color: "#26A5E4",
    href: ({ url, title }) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
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
    href: ({ url, title }) =>
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`,
  },
  {
    id: "threads",
    label: "Threads",
    color: "#000000",
    href: ({ url, title }) =>
      `https://www.threads.net/intent/post?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
  {
    id: "email",
    label: "Email",
    color: "#6B7280",
    href: ({ url, title, text }) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(
        `${text ? text + "\n\n" : ""}${url}`
      )}`,
  },
];

export default function ShareButtons({
  title,
  text = "",
  url,
  className = "",
}: Props) {
  const [pageUrl, setPageUrl] = useState(url || "");
  const [copied, setCopied] = useState(false);
  const [canNative, setCanNative] = useState(false);

  useEffect(() => {
    if (url) {
      setPageUrl(url.startsWith("http") ? url : `${window.location.origin}${url}`);
    } else {
      setPageUrl(window.location.href.split("#")[0]);
    }
    setCanNative(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, [url]);

  const ctx = { url: pageUrl, title, text: text || title };

  const openShare = useCallback((href: string) => {
    if (href.startsWith("mailto:")) {
      window.location.href = href;
      return;
    }
    window.open(href, "_blank", "noopener,noreferrer,width=640,height=640");
  }, []);

  const nativeShare = async () => {
    try {
      await navigator.share({ title, text: text || title, url: pageUrl });
    } catch {
      /* cancelled */
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  if (!pageUrl) return null;

  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5 ${className}`}
      role="region"
      aria-label="Share this page"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <Share2 className="h-4 w-4 text-[var(--accent)]" />
          Share
        </p>
        {canNative && (
          <button
            type="button"
            onClick={nativeShare}
            className="rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
          >
            Share via…
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {NETWORKS.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => openShare(n.href(ctx))}
            title={`Share on ${n.label}`}
            aria-label={`Share on ${n.label}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium transition"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = n.color;
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.borderColor = n.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "";
              e.currentTarget.style.color = "";
              e.currentTarget.style.borderColor = "";
            }}
          >
            {n.id === "email" ? <Mail className="h-3.5 w-3.5" /> : null}
            {n.label}
          </button>
        ))}
        <button
          type="button"
          onClick={copyLink}
          title="Copy link"
          aria-label="Copy link"
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium hover:border-[var(--accent)]"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <Link2 className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
