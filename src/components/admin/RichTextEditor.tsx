"use client";

import { useEffect, useId, useRef } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  help?: string;
  minHeight?: number;
  placeholder?: string;
  compact?: boolean;
};

declare global {
  interface Window {
    tinymce?: {
      init: (config: Record<string, unknown>) => void | Promise<void>;
      get: (
        id: string
      ) => {
        remove: () => void;
        setContent: (c: string) => void;
        getContent: () => string;
      } | null;
      remove: (id?: string) => void;
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
      setTimeout(() => resolve(), 50);
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

/**
 * Free GPL TinyMCE — responsive desktop + mobile toolbars.
 * Tuned for mobile select / copy / paste.
 */
export default function RichTextEditor({
  value,
  onChange,
  label = "Content",
  help,
  minHeight = 220,
  placeholder = "Write content…",
  compact = false,
}: Props) {
  const reactId = useId().replace(/:/g, "");
  const editorId = `tappath-rte-${reactId}`;
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

        const desktopToolbar = compact
          ? "undo redo | bold italic underline | bullist numlist | link | removeformat"
          : "undo redo | styles | bold italic underline strikethrough | alignleft aligncenter alignright | bullist numlist outdent indent | link unlink | removeformat | code";

        const mobileToolbar = compact
          ? "undo redo | bold italic | bullist numlist | link"
          : "undo redo | bold italic underline | bullist numlist | link | removeformat";

        await window.tinymce.init({
          selector: `#${editorId}`,
          license_key: "gpl",
          promotion: false,
          menubar: false,
          branding: false,
          statusbar: true,
          resize: true,
          min_height: minHeight,
          height: minHeight,
          placeholder,
          plugins: "lists link autoresize code paste searchreplace",
          toolbar: desktopToolbar,
          toolbar_mode: "sliding",
          toolbar_sticky: false,
          mobile: {
            menubar: false,
            toolbar_mode: "scrolling",
            toolbar: mobileToolbar,
            plugins: "lists link paste autoresize",
          },
          paste_as_text: false,
          paste_data_images: false,
          paste_merge_formats: true,
          paste_remove_styles_if_webkit: true,
          smart_paste: true,
          content_style: `
            body {
              font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
              font-size: 15px;
              line-height: 1.6;
              color: #0f172a;
              padding: 10px 14px;
              -webkit-user-select: text !important;
              user-select: text !important;
              -webkit-touch-callout: default;
              word-break: break-word;
            }
            p { margin: 0 0 0.75em; }
            a { color: #2563eb; }
            ul, ol { padding-left: 1.25rem; margin: 0 0 0.75em; }
          `,
          skin_url: "https://cdn.jsdelivr.net/npm/tinymce@7.5.1/skins/ui/oxide",
          content_css:
            "https://cdn.jsdelivr.net/npm/tinymce@7.5.1/skins/content/default/content.min.css",
          valid_elements:
            "p,br,strong/b,em/i,u,s,a[href|target|rel|title],ul,ol,li,h2,h3,h4,blockquote,code,pre,span",
          extended_valid_elements: "a[href|target|_blank|rel]",
          relative_urls: false,
          convert_urls: true,
          browser_spellcheck: true,
          contextmenu: false,
          setup: (editor: {
            on: (ev: string, cb: (...args: unknown[]) => void) => void;
            getContent: () => string;
            setContent: (c: string) => void;
            getBody: () => HTMLElement | null;
          }) => {
            editor.on("init", () => {
              editor.setContent(valueRef.current || "");
              const body = editor.getBody();
              if (body) {
                body.style.webkitUserSelect = "text";
                body.style.userSelect = "text";
              }
            });
            const emit = () => onChangeRef.current(editor.getContent());
            editor.on("change", emit);
            editor.on("keyup", emit);
            editor.on("blur", emit);
            editor.on("paste", emit);
          },
        });
      } catch {
        /* CDN failed — plain textarea remains as fallback */
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorId, minHeight, placeholder, compact]);

  useEffect(() => {
    const ed = window.tinymce?.get(editorId);
    if (!ed) return;
    const current = ed.getContent();
    if ((value || "") !== current) {
      ed.setContent(value || "");
    }
  }, [value, editorId]);

  return (
    <div className="w-full">
      {label && (
        <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
          {label}
        </span>
      )}
      {help && (
        <p className="mb-2 text-[11px] text-[var(--muted-foreground)]">{help}</p>
      )}
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)] touch-manipulation">
        <textarea
          id={editorId}
          defaultValue={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={Math.max(6, Math.round(minHeight / 28))}
          className="w-full resize-y bg-transparent px-3 py-2 text-sm leading-relaxed outline-none min-h-[140px]"
          style={{
            WebkitUserSelect: "text",
            userSelect: "text",
          }}
        />
      </div>
    </div>
  );
}
