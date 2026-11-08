"use client";

import { useEffect, useId, useRef } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  help?: string;
  minHeight?: number;
  placeholder?: string;
  /** Compact toolbar for shorter fields */
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

/** Free open-source TinyMCE 7 (GPL) from jsDelivr — no API key required */
const TINYMCE_VER = "7.5.1";
const SCRIPT_SRC = `https://cdn.jsdelivr.net/npm/tinymce@${TINYMCE_VER}/tinymce.min.js`;
const SKIN_URL = `https://cdn.jsdelivr.net/npm/tinymce@${TINYMCE_VER}/skins/ui/oxide`;
const CONTENT_CSS = `https://cdn.jsdelivr.net/npm/tinymce@${TINYMCE_VER}/skins/content/default/content.min.css`;

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
 * Free GPL TinyMCE 7 — full toolbars (Tables, Styles, Source, Media, etc.).
 * license_key: "gpl" = open-source free edition, no Tiny Cloud account.
 */
export default function RichTextEditor({
  value,
  onChange,
  label = "Content",
  help,
  minHeight = 280,
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

        // Full free toolbar (WordPress-like)
        const fullToolbar =
          "undo redo | blocks styles | bold italic underline strikethrough | " +
          "alignleft aligncenter alignright alignjustify | " +
          "bullist numlist outdent indent | " +
          "link unlink image media table | " +
          "blockquote hr charmap | " +
          "removeformat | searchreplace visualblocks code fullscreen preview | help";

        const compactToolbar =
          "undo redo | blocks | bold italic underline | " +
          "bullist numlist | link | table | removeformat | code";

        const fullPlugins =
          "advlist autolink lists link image charmap preview anchor " +
          "searchreplace visualblocks code fullscreen insertdatetime media table " +
          "help wordcount autoresize";

        const compactPlugins =
          "advlist lists link table code autoresize searchreplace";

        await window.tinymce.init({
          selector: `#${editorId}`,
          // Free GPL open-source license — no paid Cloud account
          license_key: "gpl",
          promotion: false,
          branding: false,
          // Full menu bar like classic WordPress editor
          menubar: compact
            ? false
            : "file edit view insert format tools table help",
          statusbar: true,
          resize: true,
          min_height: minHeight,
          height: Math.max(minHeight, 320),
          placeholder,
          plugins: compact ? compactPlugins : fullPlugins,
          toolbar: compact ? compactToolbar : fullToolbar,
          toolbar_mode: "wrap",
          toolbar_sticky: false,
          // Image dialog (URL-based; free, no premium image tools)
          image_title: true,
          image_description: true,
          image_dimensions: true,
          automatic_uploads: false,
          file_picker_types: "image",
          // Table defaults
          table_toolbar:
            "tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | " +
            "tableinsertcolbefore tableinsertcolafter tabledeletecol",
          table_appearance_options: true,
          table_grid: true,
          table_resize_bars: true,
          table_style_by_css: true,
          // Formats dropdown (Styles)
          style_formats_merge: true,
          style_formats: [
            {
              title: "Headings",
              items: [
                { title: "Heading 2", format: "h2" },
                { title: "Heading 3", format: "h3" },
                { title: "Heading 4", format: "h4" },
              ],
            },
            {
              title: "Inline",
              items: [
                { title: "Bold", format: "bold" },
                { title: "Italic", format: "italic" },
                { title: "Underline", format: "underline" },
                { title: "Strikethrough", format: "strikethrough" },
                { title: "Code", format: "code" },
              ],
            },
            {
              title: "Blocks",
              items: [
                { title: "Paragraph", format: "p" },
                { title: "Blockquote", format: "blockquote" },
                { title: "Pre", format: "pre" },
              ],
            },
          ],
          block_formats:
            "Paragraph=p; Heading 2=h2; Heading 3=h3; Heading 4=h4; Preformatted=pre",
          // Mobile keeps useful tools
          mobile: {
            menubar: false,
            toolbar_mode: "scrolling",
            toolbar: compact
              ? "undo redo | cut copy paste | selectall | bold italic | bullist numlist | link | table | code"
              : "undo redo | cut copy paste | selectall | blocks | bold italic underline | bullist numlist | link image table | code",
            plugins: "lists link image table code autoresize",
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
              touch-action: pan-y;
              word-break: break-word;
            }
            p { margin: 0 0 0.75em; }
            h2, h3, h4 { margin: 1em 0 0.5em; line-height: 1.3; }
            a { color: #2563eb; }
            ul, ol { padding-left: 1.25rem; margin: 0 0 0.75em; }
            table { border-collapse: collapse; width: 100%; margin: 0 0 1em; }
            table td, table th { border: 1px solid #c3c4c7; padding: 6px 10px; }
            table th { background: #f6f7f7; font-weight: 600; }
            blockquote {
              border-left: 3px solid #c3c4c7;
              margin: 0 0 1em;
              padding: 0.25em 0 0.25em 1em;
              color: #50575e;
            }
            pre, code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; }
            pre { background: #f6f7f7; padding: 10px; overflow-x: auto; }
            img { max-width: 100%; height: auto; }
            hr { border: none; border-top: 1px solid #c3c4c7; margin: 1.25em 0; }
          `,
          skin_url: SKIN_URL,
          content_css: CONTENT_CSS,
          // Allow full free HTML subset including tables
          valid_elements:
            "p,br,strong/b,em/i,u,s,a[href|target|rel|title],ul,ol,li," +
            "h1,h2,h3,h4,h5,h6,blockquote,code,pre,span[style|class]," +
            "div[style|class],hr,img[src|alt|width|height|title|class]," +
            "table[border|cellpadding|cellspacing|width|class|style]," +
            "thead,tbody,tfoot,tr," +
            "th[colspan|rowspan|width|height|align|valign|scope|class|style]," +
            "td[colspan|rowspan|width|height|align|valign|class|style]," +
            "caption,figure,figcaption,iframe[src|width|height|frameborder|allowfullscreen|title]," +
            "video[src|controls|width|height],source[src|type]",
          extended_valid_elements:
            "a[href|target|_blank|rel|title],img[src|alt|width|height|title|class|style]," +
            "table[*],td[*],th[*],tr[*],iframe[*]",
          relative_urls: false,
          convert_urls: true,
          browser_spellcheck: true,
          // Let the browser/OS own long-press selection and clipboard menus on touch devices.
          contextmenu_never_use_native: false,
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
                body.style.setProperty("-webkit-touch-callout", "default");
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
        <span className="mb-1 block text-[13px] font-semibold text-[var(--a-fg,#1d2327)]">
          {label}
        </span>
      )}
      {help && (
        <p className="mb-2 text-[12px] text-[var(--a-muted,#646970)]">{help}</p>
      )}
      <div className="overflow-hidden rounded border border-[var(--a-input-border,#8c8f94)] bg-[var(--a-card,#fff)] shadow-sm touch-manipulation">
        <textarea
          id={editorId}
          defaultValue={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={Math.max(8, Math.round(minHeight / 28))}
          className="w-full resize-y bg-transparent px-3 py-2 text-sm leading-relaxed outline-none min-h-[160px] select-text"
          style={{
            WebkitUserSelect: "text",
            userSelect: "text",
          }}
        />
      </div>
    </div>
  );
}
