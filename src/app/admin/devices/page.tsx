import type { Metadata } from "next";
import Link from "next/link";
import { getAllDevices } from "@/data/devices";

export const metadata: Metadata = {
  title: "Admin · Devices",
  robots: { index: false, follow: false },
};

export default function AdminDevicesPage() {
  const list = getAllDevices();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-[var(--muted-foreground)]">
        <Link href="/admin" className="hover:text-[var(--foreground)]">
          Admin
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--foreground)]">Devices</span>
      </nav>

      <h1 className="text-2xl font-bold tracking-tight">Devices ({list.length})</h1>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Source: <code>src/data/devices.ts</code>
      </p>

      <ul className="mt-6 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        {list.map((d) => (
          <li key={d.slug} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
            <div>
              <div className="font-medium">{d.name}</div>
              <div className="text-xs text-[var(--muted-foreground)]">
                {d.os} · {d.guides.length} linked guides
              </div>
            </div>
            <Link
              href={d.href}
              className="text-sm font-medium text-brand-600 dark:text-brand-400"
            >
              Open →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
