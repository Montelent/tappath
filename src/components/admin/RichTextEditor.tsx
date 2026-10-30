"use client";

import { useEffect, useId, useRef } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  help?: string;
  minHeight?: number;
  placeholder?: string;
};

declare global {
  interface Window {
    tinymce?: {
      init: (config: Record<string, unknown>) => void | Promise<void>;
      get: (id: string) => { remove: () => void; setContent: (c: string) => void; getContent: () => string } | null;
    };
  }
}

const SCRIPT_SRC = "https://cdn.jsdelivr.net/npm/tinymce@7.5.1/tinymce.min.js";

function loadTiny(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.tinymce) return Promise.resolve();
  const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
  if (existing) {
    return new Promise((resolve) => {
      existing.addEventListener("load", () => resolve());
      if (window.tinymce) resolve();
    });
  }
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.referrerPolicy = "origin";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load TinyMCE"));
    document.head.appendChild(s);
  });
}

export default function RichTextEditor({
  value,
  onChange,
  label = "Introduction",
  help,
  minHeight = 220,
  placeholder = "Write the intro that appears before the step-by-step simulator…",
}: Props) {
  const reactId = useId().replace(/:/g, "");
  const editorId = `tappath-intro-${reactId}`;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadTiny();
        if (cancelled || !window.tinymce) return;
        const prev = window.tinymce.get(editorId);
        if (prev) prev.remove();
        await window.tinymce.init({
          selector: `#${editorId}`,
          license_key: "gpl",
          menubar: false,
          branding: false,
          statusbar: true,
          resize: true,
          min_height: minHeight,
          placeholder,
          plugins: "lists link autoresize code",
          toolbar:
            "undo redo | styles | bold italic underline | bullist numlist | link | removeformat | code",
          toolbar_mode: "sliding",
          mobile: {
            menubar: false,
            toolbar_mode: "scrolling",
            toolbar: "undo redo | bold italic | bullist numlist | link | removeformat",
          },
          content_style: `body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; font-size: 15px; line-height: 1.6; color: #0f172a; padding: 8px 12px; } p { margin: 0 0 0.75em; }`,
          skin_url: "https://cdn.jsdelivr.net/npm/tinymce@7.5.1/skins/ui/oxide",
          content_css: "https://cdn.jsdelivr.net/npm/tinymce@7.5.1/skins/content/default/content.min.css",
          setup: (editor: {
            on: (ev: string, cb: () => void) => void;
            getContent: () => string;
            setContent: (c: string) => void;
          }) => {
            editor.on("init", () => editor.setContent(valueRef.current || ""));
            const emit = () => onChangeRef.current(editor.getContent());
            editor.on("change", emit);
            editor.on("keyup", emit);
            editor.on("blur", emit);
          },
        });
      } catch {
        /* CDN failed — textarea fallback remains */
      }
    })();
    return () => {
      cancelled = true;
      try {
        window.tinymce?.get(editorId)?.remove();
      } catch {
        /* ignore */
      }
    };
  }, [editorId, minHeight, placeholder]);

  useEffect(() => {
    const ed = window.tinymce?.get(editorId);
    if (!ed) return;
    if ((value || "") !== ed.getContent()) ed.setContent(value || "");
  }, [value, editorId]);

  return (
    <div className="w-full">
      {label && (
        <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">{label}</span>
      )}
      {help && <p className="mb-2 text-[11px] text-[var(--muted-foreground)]">{help}</p>}
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)]">
        <textarea
          id={editorId}
          defaultValue={value}
          className="min-h-[160px] w-full resize-y bg-transparent px-3 py-2 text-sm outline-none"
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
