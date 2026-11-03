"use client";

/**
 * Shared WordPress-style admin UI primitives.
 * Colors come from admin-wp.css variables so light/dark both work.
 */
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export const wp = {
  page: "space-y-5",
  title: "text-[23px] font-normal leading-tight a-fg",
  subtitle: "mt-1 text-[13px] a-muted",
  label: "mb-1 block text-[13px] font-semibold a-fg",
  help: "mb-1.5 text-[12px] a-muted",
  input:
    "a-input w-full rounded border px-3 py-2 text-[13px] shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--a-accent)]",
  select:
    "a-input w-full rounded border px-3 py-2 text-[13px] shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--a-accent)]",
  textarea:
    "a-input w-full rounded border px-3 py-2 text-[13px] shadow-sm focus:outline-none focus:ring-1 focus:ring-[var(--a-accent)]",
  btnPrimary:
    "a-btn-primary inline-flex items-center justify-center gap-1.5 rounded border px-4 py-1.5 text-[13px] font-medium disabled:opacity-50",
  btnSecondary:
    "a-btn-secondary inline-flex items-center justify-center gap-1.5 rounded border px-3 py-1.5 text-[13px] font-medium disabled:opacity-50",
  btnDanger:
    "inline-flex items-center justify-center gap-1.5 rounded border px-3 py-1.5 text-[13px] font-medium disabled:opacity-50",
  panel: "a-card overflow-hidden rounded border shadow-sm",
  panelHead: "a-panel-head border-b px-4 py-2.5 text-[14px] font-semibold",
  panelBody: "space-y-4 p-4",
  tableWrap: "a-card overflow-x-auto rounded border shadow-sm",
  thead: "a-thead border-b text-[12px] font-semibold uppercase tracking-wide",
  th: "px-3 py-2.5 text-left",
  td: "px-3 py-2.5 text-[13px] a-fg",
  tr: "a-row border-b border-[var(--a-border-soft)]",
  noticeOk: "rounded border px-3 py-2 text-[13px]",
  noticeWarn: "rounded border px-3 py-2 text-[13px]",
  noticeInfo: "rounded border px-3 py-2 text-[13px]",
};

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className={wp.title}>{title}</h1>
        {description && <div className={wp.subtitle}>{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function AdminPanel({
  title,
  description,
  children,
  footer,
}: {
  title?: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className={wp.panel}>
      {title && (
        <div className={wp.panelHead}>
          <div>{title}</div>
          {description && <div className="mt-0.5 text-[12px] font-normal a-muted">{description}</div>}
        </div>
      )}
      <div className={wp.panelBody}>{children}</div>
      {footer && (
        <div className="border-t border-[var(--a-border)] px-4 py-3" style={{ background: "var(--a-panel-head)" }}>
          {footer}
        </div>
      )}
    </div>
  );
}

export function AdminField({
  label,
  help,
  children,
}: {
  label: string;
  help?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <label className={wp.label}>{label}</label>
      {help && <p className={wp.help}>{help}</p>}
      {children}
    </div>
  );
}

export function AdminPrimaryButton({
  loading,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button type="button" {...rest} disabled={rest.disabled || loading} className={cn(wp.btnPrimary, rest.className)}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export function AdminSecondaryButton({
  loading,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button type="button" {...rest} disabled={rest.disabled || loading} className={cn(wp.btnSecondary, rest.className)}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export function AdminSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(wp.select, props.className)} />;
}

export function AdminTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(wp.textarea, props.className)} />;
}

export function AdminInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(wp.input, props.className)} />;
}

export function AdminTable({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className={wp.tableWrap}>
      <table className="w-full min-w-[480px] border-collapse text-left">
        <thead className={wp.thead}>
          <tr>
            {headers.map((h) => (
              <th key={h || "actions"} className={wp.th}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function AdminNotice({
  tone = "info",
  children,
}: {
  tone?: "ok" | "warn" | "err" | "info";
  children: ReactNode;
}) {
  const style =
    tone === "ok"
      ? { background: "var(--a-ok-bg)", borderColor: "var(--a-ok-border)", color: "var(--a-ok-fg)" }
      : tone === "warn" || tone === "err"
        ? { background: "var(--a-warn-bg)", borderColor: "var(--a-warn-border)", color: "var(--a-warn-fg)" }
        : { background: "var(--a-panel-head)", borderColor: "var(--a-border)", color: "var(--a-fg)" };
  return (
    <div className="rounded border px-3 py-2 text-[13px]" style={style}>
      {children}
    </div>
  );
}

export function AdminLoading() {
  return (
    <div className="flex items-center gap-2 py-8 text-[13px] a-muted">
      <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--a-accent)" }} />
      Loading…
    </div>
  );
}
