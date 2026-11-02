"use client";

/**
 * Shared WordPress-style admin UI primitives.
 * Use these on every admin screen so the backend feels consistent and beginner-friendly.
 */
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export const wp = {
  page: "space-y-5",
  title: "text-[23px] font-normal leading-tight text-[#1d2327]",
  subtitle: "mt-1 text-[13px] text-[#646970]",
  label: "mb-1 block text-[13px] font-semibold text-[#1d2327]",
  help: "mb-1.5 text-[12px] text-[#646970]",
  input:
    "w-full rounded border border-[#8c8f94] bg-white px-3 py-2 text-[13px] text-[#1d2327] shadow-sm focus:border-[#2271b1] focus:outline-none focus:ring-1 focus:ring-[#2271b1]",
  select:
    "w-full rounded border border-[#8c8f94] bg-white px-3 py-2 text-[13px] text-[#1d2327] shadow-sm focus:border-[#2271b1] focus:outline-none focus:ring-1 focus:ring-[#2271b1]",
  textarea:
    "w-full rounded border border-[#8c8f94] bg-white px-3 py-2 text-[13px] text-[#1d2327] shadow-sm focus:border-[#2271b1] focus:outline-none focus:ring-1 focus:ring-[#2271b1]",
  btnPrimary:
    "inline-flex items-center justify-center gap-1.5 rounded border border-[#2271b1] bg-[#2271b1] px-4 py-1.5 text-[13px] font-medium text-white hover:bg-[#135e96] disabled:opacity-50",
  btnSecondary:
    "inline-flex items-center justify-center gap-1.5 rounded border border-[#c3c4c7] bg-white px-3 py-1.5 text-[13px] font-medium text-[#2271b1] hover:border-[#2271b1] disabled:opacity-50",
  btnDanger:
    "inline-flex items-center justify-center gap-1.5 rounded border border-[#b32d2e] bg-white px-3 py-1.5 text-[13px] font-medium text-[#b32d2e] hover:bg-[#fcf0f1] disabled:opacity-50",
  panel: "overflow-hidden rounded border border-[#c3c4c7] bg-white shadow-sm",
  panelHead: "border-b border-[#c3c4c7] bg-[#f6f7f7] px-4 py-2.5 text-[14px] font-semibold text-[#1d2327]",
  panelBody: "space-y-4 p-4",
  tableWrap: "overflow-x-auto rounded border border-[#c3c4c7] bg-white shadow-sm",
  thead: "border-b border-[#c3c4c7] bg-[#f6f7f7] text-[12px] font-semibold uppercase tracking-wide text-[#1d2327]",
  th: "px-3 py-2.5 text-left",
  td: "px-3 py-2.5 text-[13px] text-[#1d2327]",
  tr: "border-b border-[#f0f0f1] hover:bg-[#f6f7f7]",
  noticeOk: "rounded border border-[#00a32a] bg-[#edfaef] px-3 py-2 text-[13px] text-[#1e4620]",
  noticeWarn: "rounded border border-[#dba617] bg-[#fcf9e8] px-3 py-2 text-[13px] text-[#996800]",
  noticeErr: "rounded border border-[#d63638] bg-[#fcf0f1] px-3 py-2 text-[13px] text-[#8a2424]",
  noticeInfo: "rounded border border-[#c3c4c7] bg-white px-3 py-2 text-[13px] text-[#1d2327] shadow-sm",
  link: "font-medium text-[#2271b1] hover:underline",
  badgeAdmin: "inline-flex items-center gap-1 rounded bg-[#fcf9e8] px-2 py-0.5 text-[11px] font-semibold text-[#996800]",
  badgeUser: "inline-flex items-center gap-1 rounded bg-[#f0f0f1] px-2 py-0.5 text-[11px] font-medium text-[#50575e]",
} as const;

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
          {title}
          {description && <div className="mt-0.5 text-[12px] font-normal text-[#646970]">{description}</div>}
        </div>
      )}
      <div className={wp.panelBody}>{children}</div>
      {footer && (
        <div className="flex flex-wrap gap-2 border-t border-[#c3c4c7] bg-[#f6f7f7] px-4 py-3">{footer}</div>
      )}
    </div>
  );
}

export function AdminField({
  label,
  help,
  children,
  className,
}: {
  label: string;
  help?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className={wp.label}>{label}</span>
      {help && <span className={wp.help}>{help}</span>}
      {children}
    </label>
  );
}

export function AdminInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(wp.input, props.className)} />;
}

export function AdminTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(wp.textarea, props.className)} />;
}

export function AdminSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(wp.select, props.className)} />;
}

export function AdminPrimaryButton({
  children,
  loading,
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
  children,
  loading,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button type="button" {...rest} disabled={rest.disabled || loading} className={cn(wp.btnSecondary, rest.className)}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export function AdminNotice({
  tone = "info",
  children,
}: {
  tone?: "ok" | "warn" | "err" | "info";
  children: ReactNode;
}) {
  const cls =
    tone === "ok"
      ? wp.noticeOk
      : tone === "warn"
        ? wp.noticeWarn
        : tone === "err"
          ? wp.noticeErr
          : wp.noticeInfo;
  return <div className={cls}>{children}</div>;
}

export function AdminLoading() {
  return (
    <div className="flex justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-[#2271b1]" />
    </div>
  );
}

export function AdminTable({
  headers,
  children,
}: {
  headers: ReactNode[];
  children: ReactNode;
}) {
  return (
    <div className={wp.tableWrap}>
      <table className="w-full text-left">
        <thead className={wp.thead}>
          <tr>
            {headers.map((h, i) => (
              <th key={i} className={wp.th}>
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
